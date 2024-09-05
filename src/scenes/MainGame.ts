
import * as Layout from './MainGameLayout.ts'


export class MainGame extends Layout.default {


    constructor() {
        super();
    }

    preload() {
    }

    create() {
		super.create()
    }

    update() {
        var ai1: Phaser.Physics.Arcade.Image = this['arcadeimage_1']
        this['arcadeimage_1'].scaleX = this['arcadeimage_1'].scaleX + 1
    }
}