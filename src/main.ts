
import * as Phaser from "phaser";

import { MainGame } from './scenes/MainGame.ts';

import { Preloader } from './scenes/Preloader.ts';


// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#111111',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 900 }
        }
    },
    pixelArt: true,
    scene: [ Preloader, MainGame ]
};

export default new Phaser.Game(config);

