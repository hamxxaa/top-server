const Phaser = require('phaser');

const Player = require('../classes/Player')
const Ball = require('../classes/Ball')
const Direk = require('../classes/Direk');
module.exports = class Game extends Phaser.Scene {
    Bodies = Phaser.Physics.Matter.Matter.Bodies;

    preload() { }
    create() {

        this.mapcfg = require("../mapcfg")
        this.defaults = require("../defaults")

        //create ball, posts and scores
        this.score1 = 0;
        this.score2 = 0
        this.balls = []
        this.posts = []
        this.obstacles = []
        this.goalareas = []
        this.createInitialObjects()

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
                if (this.updates[this.mapcfg.score[0].id]) {
                    this.updates[this.mapcfg.score[0].id].text = ++this.score1
                }
                else {
                    this.updates[this.mapcfg.score[0].id] = { text: ++this.score1 }
                }
                this.goInitialPositions()
                // this.events.emit("update score1", ++this.score1)
            }
            if ((object1.label === 'ball' && object2.label === 'goalleft') ||
                (object2.label === 'ball' && object1.label === 'goalleft')) {
                //update scores
                if (this.updates[this.mapcfg.score[1].id]) {
                    this.updates[this.mapcfg.score[1].id].text = ++this.score2
                }
                else {
                    this.updates[this.mapcfg.score[1].id] = { text: ++this.score2 }
                }
                this.goInitialPositions()

                // this.events.emit("update score2", ++this.score2)
            }
            //play sounds if ball hits post
            if ((object1.label === 'ball' && object2.label === 'direk') ||
                (object2.label === 'ball' && object1.label === 'direk')) {
                //play sounds 
                this.events.emit("direk")
            }
        });

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
            this.balls.forEach(ball => {
                var touching = this.matter.intersectBody(playerReach, ball.body);
                if (touching.length > 0) {
                    this.shoot(this.players[ID], ball)
                    //play sounds on client
                    this.events.emit("play shoot sound")
                }
            });

        })

        this.events.on("create players", (info) => {
            for (const [key] of Object.entries(info)) {
                if (info[key].team != "spec") {
                    info[key].createPlayer(this, (info[key].team == 'Team A') ? 100 : 700, 20 + (Object.keys(this.players).length) * 50)
                    this.players[key] = info[key].player
                    this.playersToSend[this.players[key].objectId] = { name: info[key].name, team: info[key].team, size: info[key].size, x: this.players[key].x, y: this.players[key].y }
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
        this.balls.forEach(ball => {
            ball.update()
        });

        //send updates to clients
        this.events.emit("send updates", this.updates)
    }

    // Apply shooting force to the ball
    shoot(player, ball) {
        let direction = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
        let power = player.power
        let forceX = Math.cos(direction) * power;
        let forceY = Math.sin(direction) * power;
        let forceVector = new Phaser.Math.Vector2(forceX, forceY)
        ball.applyForce(forceVector)
    }

    //send players and ball to initial positions and set velocities to 0
    goInitialPositions() {
        for (const [key, player] of Object.entries(this.players)) {
            player.setPosition(player.initialcords.x, player.initialcords.y)
            player.setVelocity(0, 0)
            //add players to updates so client can go to initial positions too
            if (this.updates[player.objectId]) {
                this.updates[player.objectId].x = player.initialcords.x;
                this.updates[player.objectId].y = player.initialcords.y;
            }
            else
                this.updates[player.objectId] = { x: player.initialcords.x, y: player.initialcords.y }
        }
        this.balls.forEach(ball => {
            ball.setPosition(ball.initialcords.x, ball.initialcords.y)
            ball.setVelocity(0, 0)
            // add ball to updates so client can go to initial positions too
            if (this.updates[ball.objectId]) {
                this.updates[ball.objectId].x = ball.initialcords.x
                this.updates[ball.objectId].y = ball.initialcords.y
            }
            else
                this.updates[ball.objectId] = { x: ball.initialcords.x, y: ball.initialcords.y }
        });

        //send these uptades to clients
        this.events.emit("send updates", this.updates)
        //send players to pause scene
        this.events.emit("pause clients")
    }

    createInitialObjects() {
        this.mapcfg.ball.forEach(ball => {
            const style = Object.assign({}, this.defaults.ballDefaults, ball)
            const { x, y, id, radius, density } = style
            this.balls.push(new Ball(this, x, y, 'toptop', id, radius, density))
        });

        this.mapcfg.goalline.forEach(goalline => {
            const style = Object.assign({}, this.defaults.goallineDefaults, goalline)
            const { x, y, height, width, angle, goalareaoffset, posts } = style
            this.goalareas.push(this.matter.add.rectangle(x + Math.cos(angle) * goalareaoffset, y + Math.sin(angle) * goalareaoffset, width, height, { isStatic: true, isSensor: true, angle: angle }))
            this.posts.push(this.matter.add.circle(x - height * Math.sin(angle) / 2, y + height * Math.cos(angle) / 2, posts.radius, { isStatic: true, label: 'direk' }))
            this.posts.push(this.matter.add.circle(x + height * Math.sin(angle) / 2, y - height * Math.cos(angle) / 2, posts.radius, { isStatic: true, label: 'direk' }))
        });

        this.goalareas[0].label = 'goalleft'
        this.goalareas[1].label = 'goalright'

        this.mapcfg.obstacles.forEach(obstacle => {
            this.obstacles.push(this.createShape(obstacle.config))
        });
    }

    createShape(config) {
        const style = Object.assign({}, config, this.defaults.obstacleDefaults)
        const { type, x, y, options } = style;

        let shape;

        switch (type) {
            case 'rectangle':
                shape = this.matter.add.rectangle(x, y, style.width, style.height, options);
                break;

            case 'circle':
                shape = this.matter.add.circle(x, y, style.radius, options);
                break;

            case 'polygon':
                shape = this.matter.add.fromVertices(x, y, style.path, options)
                break;

            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
        return shape;
    }

}