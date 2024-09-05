
import { MainGameLayout } from './MainGameLayout.ts'


export class MainGame extends MainGameLayout {


    constructor() {
        super();
    }

    preload() {
    }

    create() {
		super.create()
    }

    update() {
		this.arcadeimage_1.scaleX = this.arcadeimage_1.scaleX + 1
    }
}