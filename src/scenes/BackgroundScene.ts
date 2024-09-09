
import { Scene } from 'phaser';

import * as Phaser from "phaser";
import * as Phaser from "phaser";

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


export class BackgroundScene extends Scene {

    canvas:HTMLCanvasElement

    constructor() {
        super('BackgroundScene');
    }

    preload(): void {
    }

    create() {
        this.canvas = this.sys.game.canvas;
        var sky:Image = this.add.image(0, 0, 'sky').setDisplaySize(this.canvas.width, this.canvas.height).setOrigin(0, 0);

    }

    update() {
    }
}