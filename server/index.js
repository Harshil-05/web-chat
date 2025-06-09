const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

mongoose.connect(process.env.MONGO_URI);
app.use(cors());
app.use(express.json());

// JWT Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.sendStatus(201);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || user.password !== password) return res.sendStatus(401);
  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET);
  res.json({ token });
});

app.get('/api/users', authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } });
  res.json(users);
});

app.get('/api/messages/:userId', authMiddleware, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id },
    ],
  });
  res.json(messages);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  socket.join(socket.user.id);

  socket.on('send-message', async ({ receiverId, text }) => {
    const msg = new Message({ sender: socket.user.id, receiver: receiverId, text });
    await msg.save();
    io.to(receiverId).emit('receive-message', msg);
    io.to(socket.user.id).emit('receive-message', msg);
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
