const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { genarateMessage, locationMessage } = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', genarateMessage('Admin', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        genarateMessage(`${user.username} has joined the room!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity Is Not allowed');
    }
    io.to(user.room).emit('message', genarateMessage(user.username, message));
    callback('Delivered');
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      locationMessage(
        user.username,
        `https://www.google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback('Location Shared');
  });
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        genarateMessage(user.username, `${user.username} has left the room`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
