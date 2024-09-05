
import * as Phaser from "phaser";

import { MainGame } from './scenes/MainGame.ts';

import { Preloader } from './scenes/Preloader.ts';

//import * as MainGameLayout from './scenes/MainGameLayout.ts'


// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 1024,
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

