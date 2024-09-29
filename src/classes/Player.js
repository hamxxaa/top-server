const Phaser = require('phaser');

module.exports = class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, speed, power, size, key, team) {
        super(scene.matter.world, x, y, texture);

        // Add player to scene
        scene.add.existing(this);

        // Data from constructor
        this.scene = scene;
        this.power = power * 0.01 + 0.15;
        this.speed = speed * 0.0004 + 0.007;
        this.size = size + 20;
        this.id = key;
        this.team = team;
        this.totalInput = 0

        // Create player's body and reach for shooting
        const playerBody = Phaser.Physics.Matter.Matter.Bodies.circle(0, 0, this.size);
        const playerReach = Phaser.Physics.Matter.Matter.Bodies.circle(0, 0, this.size + 15, {
            isSensor: true,
            label: 'reach',
        });

        // Create compound body
        const compoundPlayerBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: [playerBody, playerReach],
            label: 'player',
        });

        // Set compound body to the player
        this.setExistingBody(compoundPlayerBody);
        this.setPosition(x, y);
        this.setFixedRotation();
        this.setAngle(270);
        this.setFrictionAir(0.015);
        this.setMass(100);



        //position of player when starting and after goal
        this.initialcords = { x: x, y: y }

        //creating vector to apply force on player on input
        this.inputVector = new Phaser.Math.Vector2();
    }

    update() {

        // Calculate the input vector based on player's input
        // 1 = left, 2 = right, 4 = up, 8 = down, 16 = space

        if ((this.totalInput & 1) == 1) {
            this.inputVector.x -= 1
        }
        if ((this.totalInput & 2) == 2) {
            this.inputVector.x += 1
        }
        if ((this.totalInput & 4) == 4) {
            this.inputVector.y -= 1
        }
        if ((this.totalInput & 8) == 8) {
            this.inputVector.y += 1
        }
        if ((this.totalInput & 16) == 16) this.scene.events.emit("shot", this.id);

        // Normalize the input vector and apply force on player
        this.inputVector.normalize();
        if (this.inputVector.x != 0) this.thrustRight(this.inputVector.x * this.speed * 2);
        if (this.inputVector.y != 0) this.thrustBack(this.inputVector.y * this.speed * 2);

        // Add player's position to updates to send to clients if updated
        if (this.body.velocity.x !== 0) {
            this.scene.updates[this.id] = { x: this.x }
        }
        if (this.body.velocity.y !== 0) {
            if (this.scene.updates[this.id]) {
                this.scene.updates[this.id].y = this.y;
            }
            else {
                this.scene.updates[this.id] = { y: this.y }
            }
        }

        //clear vector and input for further inputs
        this.inputVector.set(0)
        this.totalInput = 0
    }
}