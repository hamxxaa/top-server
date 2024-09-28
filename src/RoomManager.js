const Phaser = require('phaser');
const Room = require('./classes/Room')

class RoomManager {
    constructor(io) {
        this.io = io;
        this.rooms = {};
        if (!Phaser.Math.RND || !Phaser.Math.RND.uuid) {
            // Seed the random number generator if it's not already seeded
            Phaser.Math.RND = new Phaser.Math.RandomDataGenerator([Date.now().toString()]);
        }
    }

    createRoom(roomInfo, owner) {
        let ID = Phaser.Math.RND.uuid();
        this.rooms[ID] = new Room(ID, roomInfo.Name, owner.id, this.io.to(ID));
        // this.rooms[roomInfo.ID].startGame();
        this.rooms[ID].addOwner(owner)
    }

    activeRooms() {
        const roomsInfo = {};
        for (const [key, room] of Object.entries(this.rooms)) {
            roomsInfo[key] = {
                id: room.getRoomID(),
                name: room.getRoomName(),
                playing: room.isPlaying(),
                online: room.nonline()
            };
        }
        return roomsInfo;
    }

    addPlayerToRoom(socket, roomID) {
        this.rooms[roomID].addPlayer(socket);

    }
}

module.exports = RoomManager;