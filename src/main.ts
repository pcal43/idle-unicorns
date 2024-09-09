
import * as Phaser from "phaser";

import { GameScene } from './scenes/GameScene.ts';
import { Preloader } from './scenes/Preloader.ts';
import { BackgroundScene } from './scenes/BackgroundScene.ts';


// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    //backgroundColor: '#111111',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 900 }
        }
    },
  // Allows Phaser canvas to be responsive to browser sizing
  /** 
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },   **/   

    pixelArt: true,
    scene: [ Preloader, BackgroundScene, GameScene ]
};

export default new Phaser.Game(config);

