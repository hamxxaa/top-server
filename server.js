
require('@geckos.io/phaser-on-nodejs')

const Phaser = require('phaser');
const Game = require('./src/scenes/Game');
const RoomManager = require('./src/RoomManager')

const server = require('express')();
const http = require('http').createServer(server);
const cors = require('cors');
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:1234',
        methods: ["GET", "POST"]
    }
});

var roomManager = new RoomManager(io)
io.on('connection', function (socket) {

    socket.emit("rooms", roomManager.activeRooms())
    socket.on("join room", roomID => {
        roomManager.addPlayerToRoom(socket, roomID)

    })
    socket.on("create room", roomInfo => {
        roomManager.createRoom(roomInfo, socket)
    })

    socket.on("refresh rooms", () => { socket.emit("rooms", roomManager.activeRooms());
     })
})

http.listen(3000, function () {
})
