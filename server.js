// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('colyseus');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const ChatRoom = require('./rooms/ChatRoom');

dotenv.config();

const app = express();
const server = http.createServer(app);
const gameServer = new Server({
    server: server
});

// Middleware
app.use(cors());
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Register Colyseus room
gameServer.define('chat', ChatRoom);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});