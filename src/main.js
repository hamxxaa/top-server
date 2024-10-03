const Phaser = require('phaser');

function createGame() {
    config = {
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
    return new Phaser.Game(config);
}

module.exports = createGame;


