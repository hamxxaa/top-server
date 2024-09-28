const Phaser = require('phaser');

module.exports = class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture) { 
        //just posts
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this)
        this.radius = 8.3
        this.setScale(this.radius * 2 / this.width, this.radius * 2 / this.height);
        const direkBody = this.scene.Bodies.circle(600, 200, 5, { isStatic: true })
        this.setExistingBody(direkBody)
        this.body.label = 'direk'
        this.setPosition(x,y)
        this.setFriction(0)
    }
}