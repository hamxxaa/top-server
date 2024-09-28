const Phaser = require('phaser');

const Player = require('../classes/Player')
const Ball = require('../classes/Ball')
const Direk = require('../classes/Direk')

module.exports = class Game extends Phaser.Scene {
    soundNames = ['vur1', 'vur2', 'vur3', 'vur4', 'vur5', 'vur6', 'vur7', 'vur8'];
    Bodies = Phaser.Physics.Matter.Matter.Bodies;

    preload() { }
    create() {

        //create ball posts and scores
        this.score1 = 0;
        this.score2 = 0
        this.ball = new Ball(this, 300, 300, 'toptop')
        this.direk = new Direk(this, 770, 200, 'top')
        this.direk2 = new Direk(this, 770, 300, 'top')
        this.direk3 = new Direk(this, 30, 200, 'top')
        this.direk4 = new Direk(this, 30, 300, 'top')

        //create goal areas
        this.goalleft = this.matter.add.image(9, 250, null, null, { isStatic: true, isSensor: true, label: 'goalleft' }).setScale(0.40, 3.1)
        this.goalright = this.matter.add.image(791, 250, null, null, { isStatic: true, isSensor: true, label: 'goalright' }).setScale(0.40, 3.1)//setScale(0.82,3.1)

        //object to keep players
        this.players = {};
        this.spectators = {};
        this.playersToSend = {}

        //object to send updated objects to client
        this.updates = {};

        //set world borders
        this.worldBounds = this.matter.world.setBounds()

        //handle collisions
        this.matter.world.on("collisionstart", (event, object1, object2) => {
            //score goal if ball collides with goal areas
            if ((object1.label === 'ball' && object2.label === 'goalright') ||
                (object2.label === 'ball' && object1.label === 'goalright')) {
                //update scores
                this.events.emit("update score1", ++this.score1)
            }
            if ((object1.label === 'ball' && object2.label === 'goalleft') ||
                (object2.label === 'ball' && object1.label === 'goalleft')) {
                //update scores
                this.events.emit("update score2", ++this.score2)
            }
            //play sounds if ball hits post
            if ((object1.label === 'ball' && object2.label === 'direk') ||
                (object2.label === 'ball' && object1.label === 'direk')) {
                //play sounds 
                this.events.emit("direk")
            }
        });

        //send players and ball to initial positions and set velocities to 0
        this.events.on("go initial positions", () => {
            for (const [key, player] of Object.entries(this.players)) {
                player.setPosition(player.initialcords.x, player.initialcords.y)
                player.setVelocity(0, 0)
                //add players to updates so client can go to initial positions too
                if (this.updates[key]) {
                    this.updates[key].x = player.initialcords.x;
                    this.updates[key].y = player.initialcords.y;
                }
                else
                    this.updates[key] = { x: player.initialcords.x, y: player.initialcords.y }
            }
            this.ball.setPosition(this.ball.initialcords.x, this.ball.initialcords.y)
            this.ball.setVelocity(0, 0)
            //add ball to updates so client can go to initial positions too
            if (this.updates[this.ball.body.label]) {
                this.updates[this.ball.body.label].x = this.ball.initialcords.x
                this.updates[this.ball.body.label].y = this.ball.initialcords.y
            }
            else
                this.updates[this.ball.body.label] = { x: this.ball.initialcords.x, y: this.ball.initialcords.y }
            //send these uptades to clients
            this.events.emit("send updates", this.updates)
            //send players to pause scene
            this.events.emit("pause clients")
        })

        //destroy player when client disconnected
        this.events.on("user disconnected", ID => {
            if (this.players[ID]) {
                this.players[ID].destroy()
                delete this.players[ID]
            }
        })

        //clear updates object
        this.events.on("clear updates", () => {
            Object.keys(this.updates).forEach(key => {
                delete this.updates[key];
            })
        })

        //check if ball is inside reach to shoot on input
        this.events.on("shot", ID => {
            const playerReach = this.players[ID].body.parts.find(part => part.label === 'reach');
            var touching = this.matter.intersectBody(playerReach, this.ball.body);
            if (touching.length > 0) {
                this.shoot(this.players[ID], this.ball)
                //play sounds on client
                this.events.emit("play shoot sound")
            }
        })

        this.events.on("create players", (info) => {
            for (const [key] of Object.entries(info)) {
                if (info[key].team != "spec") {
                    info[key].createPlayer(this,(info[key].team == 'Team A') ? 100 : 700, 20 + (Object.keys(this.players).length) * 50)
                    this.players[key] = info[key].player
                    this.playersToSend[key] = { name: info[key].name, team: info[key].team, size: info[key].size, x: this.players[key].x, y: this.players[key].y }
                }
                else {
                    this.spectators[key] = { name: info[key].name }
                }
            }
        })
    }
    update() {
        //update players every frame
        for (const [key, player] of Object.entries(this.players)) {
            player.update()
        }
        //update ball every frame
        this.ball.update()

        //send updates to clients
        this.events.emit("send updates", this.updates)


    }

    //apply shooting
    shoot(player, ball) {
        const direction = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
        const power = player.power
        const forceX = Math.cos(direction) * power;
        const forceY = Math.sin(direction) * power;
        var forceVector = new Phaser.Math.Vector2(forceX, forceY)
        ball.applyForce(forceVector)
    }
}