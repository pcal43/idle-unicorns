
import * as Phaser from "phaser";

import { GameScene } from './scenes/GameScene.ts';
import { Preloader } from './scenes/Preloader.ts';
import { BackgroundScene } from './scenes/BackgroundScene.ts';


// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    //width: 800,
    //height: 600,
    //backgroundColor: '#111111',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 900 }
        }
    },

  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },   

    pixelArt: true,
    scene: [ Preloader, BackgroundScene, GameScene ]
};

export default new Phaser.Game(config);

