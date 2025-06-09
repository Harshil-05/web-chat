# 💬 MERN Real-Time Chat App with WebSocket

A full-stack real-time chat application built with the **MERN stack (MongoDB, Express, React, Node.js)** and **WebSockets (Socket.IO)**. Users can sign in and chat with other users in real time.

---

## 🚀 Features

- 🔐 User authentication (JWT)
- 💬 Real-time messaging with WebSocket
- 📄 Chat history saved in MongoDB
- 🧑‍🤝‍🧑 Multi-user chat interface
- 📦 MongoDB Atlas + Mongoose for DB
- 🎨 Clean React UI with auto-scrolling chat window

---

## 📂 Project Structure

```bash
chat-app/
├── client/           # React frontend
│   └── src/
│       └── pages/    # Login and Chat components
├── server/           # Express backend
│   ├── models/       # Mongoose models (User, Message)
│   └── index.js      # Main backend logic
├── .env              # Environment variables
└── README.md         # This file
