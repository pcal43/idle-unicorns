
import * as Phaser from "phaser";

import { MainGame } from './scenes/MainGame.js';
import { Preloader } from './scenes/Preloader.js';

// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    width: 1800,
    height: 600,
    backgroundColor: '#111111',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 900 }
        }
    },
    pixelArt: true,
    scene: [ Preloader, MainGame ]
};

export default new Phaser.Game(config);

