
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
        this.arcadeimage_1.scaleX = this.arcadeimage_1.scaleX + .1
    }
}