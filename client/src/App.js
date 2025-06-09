import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { getUserIdFromToken } from './utils';

const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', {
  auth: { token },
});

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const myId = token ? getUserIdFromToken(token) : null;
  const chatRef = useRef(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    socket.on('receive-message', (msg) => {
      if (
        msg.sender === selectedUser?._id ||
        msg.receiver === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [selectedUser]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const selectUser = async (user) => {
    setSelectedUser(user);
    const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit('send-message', {
      receiverId: selectedUser._id,
      text,
    });
    setText('');
  };

  if (!token) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Please log in first</h2>
        <p>Use Postman or any tool to get a token and set it in localStorage:</p>
        <pre>localStorage.setItem('token', 'YOUR_TOKEN')</pre>
        <p>Then refresh this page.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      <div style={{ width: '30%', borderRight: '1px solid gray', padding: '10px' }}>
        <h3>Users</h3>
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => selectUser(user)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              background: selectedUser?._id === user._id ? '#e6f7ff' : 'white',
            }}>
            {user.username}
          </div>
        ))}
      </div>
      <div style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <h3>Chat with {selectedUser?.username || '...'}</h3>
        <div
          ref={chatRef}
          style={{
            height: '80%',
            overflowY: 'scroll',
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
          }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.sender === myId ? 'right' : 'left',
                margin: '5px 0',
              }}>
              <span
                style={{
                  display: 'inline-block',
                  background: msg.sender === myId ? '#d1ffd1' : '#f1f1f1',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  maxWidth: '60%',
                  wordBreak: 'break-word',
                }}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type a message'
            style={{ width: '80%', padding: '8px', marginRight: '10px' }}
          />
          <button onClick={sendMessage} style={{ padding: '8px 16px' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
