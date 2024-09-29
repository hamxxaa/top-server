const Phaser = require('phaser');
const Game = require('../scenes/Game');
const ClientInfo = require('./ClientInfo')

class Room {
    static config = {
        width: 2000,
        height: 1100,
        type: Phaser.HEADLESS,
        banner: false,
        audio: false,
        physics: {
            default: 'matter',
            matter: {
                debug: true,
                gravity: {
                    y: 0,
                    x: 0
                }
            }
        }
    }

    constructor(ID, name, owner, ioNameSpace) {
        this.ID = ID;
        this.name = name;
        this.owner = owner;
        this.players = {}
        this.game = null;
        this.scene = null;
        this.ioNameSpace = ioNameSpace;
        this.playersInLobby = {};
        this.lobbyToSend = {};
        this.playing = false
    }

    // Method to start the game in the room  
    startGame() {
        if (!this.game) {
            this.game = new Phaser.Game(Room.config)
            this.game.scene.add('game', Game)
            this.game.scene.start('game')
            this.scene = this.game.scene.getScene('game');
            this.playing = true
            this.setupSceneListeners();
        }
    }

    // Getter method to get the room name
    getRoomName() {
        return this.name;
    }

    // Getter method to get the room ID
    getRoomID() {
        return this.ID;
    }

    // Method to check if the game is currently playing
    isPlaying() {
        return this.playing
    }

    // Number of players in the room
    nonline() {
        return Object.keys(this.playersInLobby).length
    }

    // Method to add player to the room
    addPlayer(socket) {
        if (!this.game) {
            socket.join(this.ID)
            this.setupLobbyListeners(socket)
            this.setupLobbyPlayerListeners(socket)
            socket.emit("player can connect to lobby", this.ID)
        }
        else {
            socket.join(this.ID)
            this.setupSpecSocketListeners(socket)
            socket.emit("game already started")
        }
    }

    // Method to add the owner of the room to the room
    addOwner(socket) {
        socket.join(this.ID);
        socket.emit("owner can connect to lobby", this.ID)
        this.setupLobbyListeners(socket)
        this.setupLobbyOwnerListeners(socket)

    }

    // Method to set up listeners for the game scene
    setupSceneListeners() {
        this.scene.events.on("send updates", () => {
            if (Object.keys(this.scene.updates).length) {
                this.ioNameSpace.emit("update clients", this.scene.updates);
                this.scene.events.emit("clear updates", this.scene.updates);
            }
        });

        this.scene.events.on("update score1", score => {
            this.ioNameSpace.emit("update score1", score);
            this.scene.events.emit("go initial positions");
        });

        this.scene.events.on("update score2", score => {
            this.ioNameSpace.emit("update score2", score);
            this.scene.events.emit("go initial positions");
        });

        this.scene.events.on("play shoot sounds", () => {
            this.ioNameSpace.emit("play shoot sounds on client");
        });

        this.scene.events.on("direk", () => {
            this.ioNameSpace.emit("direk");
        });

        this.scene.events.on("pause clients", () => {
            this.ioNameSpace.emit("pause");
        });
    }

    // Method to set up listeners for spectator sockets
    setupSpecSocketListeners(socket) {
        socket.on("disconnect", () => {
            delete this.players[socket.id];
            this.ioNameSpace.emit("user disconnected", socket.id);
            this.scene.events.emit("user disconnected", socket.id);
        });

        socket.on("game started on client side", () => {
            socket.emit("draw players", this.scene.playersToSend)
        })

        socket.on("spec info", name => {
            this.scene.spectators[socket.id] = { name }
        })

        socket.on("spec connected", () =>
            this.ioNameSpace.emit("update specs", this.scene.spectators)
        )
    }

    // Method to set up listeners for player sockets
    setupSocketListeners(socket) {

        socket.on("player input", (totalInput) => {
            this.scene.players[socket.id].totalInput = totalInput
        })

        socket.on("disconnect", () => {
            delete this.players[socket.id];
            this.ioNameSpace.emit("user disconnected", socket.id);
            this.scene.events.emit("user disconnected", socket.id);
        });

        socket.on("game started on client side", () => {
            socket.emit("draw players", this.scene.playersToSend)
        })

    }

    // Method to set up listeners for player lobby interactions
    setupLobbyPlayerListeners(socket) {
        socket.on("player ready", () => {
            this.playersInLobby[socket.id].ready = !this.playersInLobby[socket.id].ready
            socket.emit("update ready condition", this.playersInLobby[socket.id].ready)
        })
    }

    // Method to set up listeners for the lobby
    setupLobbyListeners(socket) {
        socket.on("update stats", (stat, change) => {
            this.playersInLobby[socket.id].updateStats(stat, change)
        })
        socket.on("player connected to lobby", (name) => {
            socket.emit("get lobby", this.lobbyToSend)
            this.playersInLobby[socket.id] = new ClientInfo(socket, name)
            this.ioNameSpace.emit("update lobby", { id: socket.id, name, team: 'spec' });
            this.lobbyToSend[socket.id] = { name: name, team: 'spec' }
        })
        socket.on("update team", (team) => {
            this.playersInLobby[socket.id].updateTeam(team)
            this.lobbyToSend[socket.id].team = team
            this.ioNameSpace.emit("update lobby", { id: socket.id, name: this.playersInLobby[socket.id].name, team: this.playersInLobby[socket.id].team })
        })
    }

    // Method to set up listeners for the lobby owner
    setupLobbyOwnerListeners(socket) {
        socket.on("start game", () => {
            this.startGame()
            this.scene.events.emit("create players", this.playersInLobby)
            this.ioNameSpace.emit("game started")
            for (const [key] of Object.entries(this.playersInLobby)) {
                if (this.playersInLobby[key].team == "spec") {
                    this.setupSpecSocketListeners(this.playersInLobby[key].socket)
                    this.scene.spectators[key] = { name: this.playersInLobby[key].name }
                }
                else {
                    this.setupSocketListeners(this.playersInLobby[key].socket)
                }
            }
        })
    }

}
module.exports = Room