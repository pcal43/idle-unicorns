
import { Scene } from 'phaser';

import * as Phaser from "phaser";
import tinycolor from "https://esm.sh/tinycolor2";

//type HTMLCanvasElement = org.w3c.dom.HTMLCanvasElement


type Text = Phaser.GameObjects.Text;
type StaticGroup = Phaser.Physics.Arcade.StaticGroup
type Sprite = Phaser.Physics.Arcade.Sprite
type ImageWithDynamicBody = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
type Image = Phaser.GameObjects.Image;
type Group = Phaser.Physics.Arcade.Group;
type GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
type GameObject = Phaser.GameObjects.GameObject
type Camera2D = Phaser.Cameras.Scene2D.Camera;
type ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
type Point = Phaser.Geom.Point
//type HTMLCanvasElement = Phaorg.w3c.dom.HTMLCanvasElement



const FRAMES_PER_TINT_CHANGE = 100

export class BackgroundScene extends Scene {

    canvas: HTMLCanvasElement
    tint: number = 0xDDDDDD //0x222222
    sky: Image
    frames: number = 0

    constructor() {
        super('BackgroundScene');
    }

    preload(): void {
    }

    create() {
        this.canvas = this.sys.game.canvas;
        this.sky = this.add.image(0, 0, 'sky').setDisplaySize(this.canvas.width, this.canvas.height).setOrigin(0, 0);
        this.sky.setTint(this.tint)
    }

    update() {
        if (this.frames++ > FRAMES_PER_TINT_CHANGE) {
            this.frames = 0
            this.tint = this.changeColorLightness(this.tint, 1)
            this.sky.setTint(this.tint)
        }
    }

    // taken from https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    changeColorLightness(color: number, lightness: number): number {
        return (Math.max(0, Math.min(((color & 0xFF0000) / 0x10000) + lightness, 0xFF)) * 0x10000) +
            (Math.max(0, Math.min(((color & 0x00FF00) / 0x100) + lightness, 0xFF)) * 0x100) +
            (Math.max(0, Math.min(((color & 0x0000FF)) + lightness, 0xFF)));
    }


}