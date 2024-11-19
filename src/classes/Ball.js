const Phaser = require('phaser');

module.exports = class Ball extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, objectId, radius, density) {
        super(scene.matter.world, x, y, texture);
        // add ball to scene
        scene.add.existing(this)
        // data from constructor
        this.scene = scene
        this.objectId = objectId;
        this.initialcords = { x: x, y: y }
        this.radius = radius

        const ballBody = this.scene.Bodies.circle(0, 0, this.radius, { friction: 0, frictionAir: 0.01, restitution: 1, label: 'ball', density: density })
        this.setExistingBody(ballBody)
        this.setPosition(x, y)

    }
    update() {
        const updt = {}
        // add ball to updates to send clients if updated
        if (this.body.velocity.x !== 0) {
            updt.x = this.x
        }
        if (this.body.velocity.y !== 0) {
            updt.y = this.y
        }

        if (Object.keys(updt).length > 0) {
            this.scene.updates[this.objectId] = updt
        }
    }
}