const Phaser = require('phaser');

module.exports = class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture) {
        super(scene.matter.world, x, y, texture);
        //add ball to scene
        scene.add.existing(this)

        //creating ball' properties
        this.radius = 8.3 * 9 / 5
        this.setScale(this.radius * 2 / this.width, this.radius * 2 / this.height);
        const ballBody = this.scene.Bodies.circle(1000, 550, 9)
        this.setExistingBody(ballBody)
        this.setPosition(x, y)
        this.setFriction(0)
        this.setMass(10);
        this.setFrictionAir(0.01);
        this.body.restitution = 1
        this.body.label = 'ball'
    
        //data from constructor
        this.scene = scene
        //position of ball is starting and after goal
        this.initialcords = { x: 1000, y: 550 }


    }
    update() {
        //add ball to updates to send clients if updated
        if (this.body.velocity.x !== 0) {
            this.scene.updates[this.body.label] = { x: this.x }
        }
        if (this.body.velocity.y !== 0) {
            if (this.scene.updates[this.body.label]) {
                this.scene.updates[this.body.label].y = this.y;
            }
            else {
                this.scene.updates[this.body.label] = { y: this.y }
            }
        }
    }
}