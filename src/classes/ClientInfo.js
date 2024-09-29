const Phaser = require('phaser');
const Player = require('./Player')


module.exports = class ClientInfo {

    constructor(socket, name) {
        this.socket = socket
        this.speed = 0
        this.power = 0
        this.size = 0
        this.points = 10
        this.key = this.socket.id
        this.texture = 'galatasaray'
        this.team = 'spec'
        this.player = null
        this.name = name
    }

    createPlayer(scene, x, y) {
        this.player = new Player(scene, x, y, this.texture, this.speed, this.power, this.size, this.key, this.team)
    }

    updateTeam(team) {
        this.team = team
    }

    //Check the request from client for updating stats
    updateStats(stat, change) {
        let valid = 0
        switch (stat) {
            //speed
            case 1:
                switch (change) {
                    //minus
                    case 1:
                        if (this.speed > 0) {
                            this.speed -= 1
                            this.points += 1
                            valid = 1
                        }
                        break;
                    //plus
                    case 2:
                        if (this.speed < 10 && this.points > 0) {
                            this.speed += 1
                            this.points -= 1
                            valid = 1
                        }
                        break;
                }
                break;
            //power
            case 2:
                switch (change) {
                    //minus
                    case 1:
                        if (this.power > 0) {
                            this.power -= 1
                            this.points += 1
                            valid = 1
                        }
                        break;
                    //plus
                    case 2:
                        if (this.power < 10 && this.points > 0) {
                            this.power += 1
                            this.points -= 1
                            valid = 1
                        }
                        break;
                }
                break;
            //size
            case 3:
                switch (change) {
                    //minus
                    case 1:
                        if (this.size > 0) {
                            this.size -= 1
                            this.points += 1
                            valid = 1
                        }
                        break;
                    //plus
                    case 2:
                        if (this.size < 10 && this.points > 0) {
                            this.size += 1
                            this.points -= 1
                            valid = 1
                        }
                        break;
                }
                break;
        }

        if (valid == 1) {
            this.socket.emit("validate stats", stat, change, this.points)
        }
    }
}