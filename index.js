// javascript source code
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

// defining some middleware
// app.use is defining middleware
app.use(express.static(path.join(__dirname)));

const activeUsers = new Set();

io.on('connection', (socket) => {
    socket.on('new user', (msg) => {
        socket.username = msg;
        activeUsers.add(msg);
        io.emit('new user', [...activeUsers]);
        socket.broadcast.emit('connection', msg + ' connected');
    });
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
    });
    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });
    socket.on('stop typing', (user) => {
        socket.broadcast.emit('stop typing', user);
    });
    socket.on('disconnect', () => {
        user = socket.username;
        activeUsers.delete(user);
        io.emit('disconnection', user);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});