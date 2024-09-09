
import { Scene } from 'phaser';

import * as Phaser from "phaser";
import * as Phaser from "phaser";
import { Stomper } from './Stomper.ts'

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

const UNICORN_SPEED: integer = 350
const GROUND_LEVEL: integer = 580
const GROUND_DEPTH: integer = 25
//const SCORE_Y = GROUND_LEVEL - 200
const SCORE_X: integer = 900
const HOUSE_X: integer = 1200
const HOUSE_Y: integer = 520
const STATUS_Y: integer = 410


const SHARD_POS: Point = new Phaser.Geom.Point(400, 500)
const DIAMOND_POS: Point = new Phaser.Geom.Point(400, -200)
const STOMPER_HOUSE_POS: Point = new Phaser.Geom.Point(0, 520)


const DIAMOND_STAGE = 0
const BANK_STAGE = 1
const HOUSE_STAGE = 2
const STOMPER_STAGE = 3
const INITIAL_STAGE = STOMPER_STAGE

const BLACK = '#000';
const GREEN = '#00FF00';
const RED = '#FF0000';

export class GameScene extends Scene {

    canvas:HTMLCanvasElement
    groundShards: Group
    flyingShards: Group

    runnerCost: integer = 3
    stomperCost: integer = 3

    score: integer = 0
    scoreText: Text;
    runnerCostText: Text;
    mainCamera: Camera2D
    runners: Group
    returningRunners: Group
    stomperCollisionsGroup: Group

    stomperCostText: Text;

    diamond:Sprite

    stompers: Set<Stomper> = new Set<Stomper>()

    stage = 0

    constructor() {
        super('GameScene');
    }

    point(x:integer, y:integer):Point {
        return new Phaser.Geom.Point(x,y)
    }

    preload(): void {
    }

    minimumStage(minStage: integer): void {
        if (this.stage < minStage) {
            switch (minStage) {
                case DIAMOND_STAGE:
                    break;
                case BANK_STAGE:
                    this.panCameraTo(630, GROUND_LEVEL / 2)
                    break;
                case HOUSE_STAGE:
                    this.panCameraTo(800, GROUND_LEVEL / 2 - 100)
                    break;
                case STOMPER_STAGE:
                    this.panCameraTo(600, GROUND_LEVEL / 2 - 300)
                    break;
            }
            this.stage = minStage
        }
    }


    panCameraTo(newX: integer, newY: integer): void {
        this.mainCamera.pan(newX, newY, 2500, 'Linear', false, function (camera, progress, _dx, _dy) {
            var base = (GROUND_LEVEL + GROUND_DEPTH)
            var my = base / 2 - ((base / 2 - newY) * progress)
            camera.setZoom(((base / 2)) / (base - my))
        });
    }


    createShard() {
        var shard: Sprite = this.flyingShards.create(SHARD_POS.x, SHARD_POS.y, 'diamond');
        shard.setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5).setScale(.05)
        shard.setBounce(0)
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        shard.setInteractive()
        shard.on('pointerdown', this.onShardClick.bind(this, shard))
    }

    onDiamondClick(_diamond:Sprite): void {
        this.createShard()
        this.minimumStage(BANK_STAGE)
    }

    onShardClick(shard: Sprite): void {
        if (this.groundShards.contains(shard)) {
            this.groundShards.remove(shard)
            this.flyingShards.add(shard)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
        }
    }

    onHouseClick(_house: ImageWithDynamicBody): void {
        if (this.score >= this.runnerCost) {
            // TODO - animate shards flying from bank to house to 'pay' for it
            let runner:Sprite = this.physics.add.sprite(1200, GROUND_LEVEL - 30, 'unicorn');
            this.runners.add(runner)
            runner.setBounce(0);
            runner.setScale(4)
            runner.setFlipX(true);
            runner.setVelocity(-350, -400)
            runner.anims.play('right', true);
            this.changeScore(-this.runnerCost)
            this.runnerCost += 3
            this.runnerCostText.setText(String(this.runnerCost))
            this.minimumStage(STOMPER_STAGE)
        }
    }

    onStomperHouseClick(_house: ImageWithDynamicBody): void {
        if (this.score >= this.stomperCost) {
            new Stomper().create(this, this.point(STOMPER_HOUSE_POS.x, GROUND_LEVEL -30))
            this.changeScore(-this.stomperCost)
            this.stomperCostText.setText(String(this.stomperCost))            
            this.stomperCost += 3
        }
    }

    changeScore(delta: integer) {
        this.score += delta
        if (this.score >= this.runnerCost) {
            this.minimumStage(HOUSE_STAGE)
            this.runnerCostText.setColor(GREEN)
        } else {
            this.runnerCostText.setColor(RED)
        }
        if (this.score >= this.stomperCost) {
            this.minimumStage(HOUSE_STAGE)
            this.stomperCostText.setColor(GREEN)
        } else {
            this.stomperCostText.setColor(RED)
        }
        this.scoreText.setText(String(this.score))
    }

    create() {
        this.canvas = this.sys.game.canvas;

        this.mainCamera = this.cameras.main

        const emitter = this.add.particles(0, 0, "red", {
            speed: 100,
            scale: { start: 2.5, end: 0 },
            blendMode: "ADD",
        });


        var ground: StaticGroup = this.physics.add.staticGroup();

        this.groundShards = this.physics.add.group();
        this.flyingShards = this.physics.add.group();

        this.diamond = this.physics.add.sprite(DIAMOND_POS.x, DIAMOND_POS.y, 'diamond');        

        this.diamond.setSize(this.diamond.width/2, this.diamond.height /2.5).setOffset(this.diamond.width/4, 40)
        this.diamond.setScale(.5)
        this.diamond.setInteractive()
        emitter.startFollow(this.diamond);
        this.diamond.on('pointerdown', this.onDiamondClick.bind(this, this.diamond))

        var bank: ImageWithDynamicBody = this.physics.add.image(915, 520, 'bank');
        // FIXME compiler complaining about the third argument here, but removing it causes lag
        bank.setScale(.25)
        bank.body.setImmovable(true);
        bank.body.allowGravity = false;

        var house: ImageWithDynamicBody = this.physics.add.image(HOUSE_X, HOUSE_Y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', this.onHouseClick.bind(this, house))

        var stomperHouse: ImageWithDynamicBody = this.physics.add.image(STOMPER_HOUSE_POS.x, STOMPER_HOUSE_POS.y, 'stomperHouse');
        stomperHouse.setScale(.35)
        stomperHouse.setImmovable(true);
        stomperHouse.body.allowGravity = false;
        stomperHouse.setInteractive()
        stomperHouse.on('pointerdown', this.onStomperHouseClick.bind(this, stomperHouse))



        this.runners = this.physics.add.group();
        this.returningRunners = this.physics.add.group();

        this.stomperCollisionsGroup = this.physics.add.group();
        this.physics.add.collider(this.stomperCollisionsGroup, ground);


        //
        // setup collisions
        //

        var scene = this
        this.physics.add.collider(this.flyingShards, ground, function (s, _) {
            var shard: Sprite = s as Sprite;
            scene.flyingShards.remove(shard)
            scene.groundShards.add(shard)
            shard.setVelocity(0, 0)
        });
        this.physics.add.collider(bank, this.flyingShards, function (_, s) {
            var shard: Sprite = s as Sprite;
            shard.disableBody(true, true);
            scene.changeScore(1)
        });
        this.physics.add.collider(this.groundShards, ground);
        this.physics.add.collider(this.diamond, ground);
        this.physics.add.collider(this.runners, ground);
        this.physics.add.collider(this.returningRunners, ground);
        this.physics.add.collider(this.runners, this.groundShards, (u, s): void => {
            var shard: Sprite = s as Sprite;
            var unicorn: Sprite = u as Sprite;
            shard.setVelocity(0, 0);
            scene.flyingShards.add(shard);
            scene.groundShards.remove(shard);
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            scene.runners.remove(unicorn);
            scene.returningRunners.add(unicorn);
            unicorn.setVelocityX(UNICORN_SPEED);
            unicorn.setFlipX(!unicorn.flipX);
        });

        var grass = this.add.tileSprite(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, "grass");
        //ground.setScale(1.5)
        //let ground = this.add.rectangle(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, 0xffffff);
        grass.setOrigin(0, 0); // i dont understand this
        ground.add(grass)

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('unicorn', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stomperAnim',
            frames: this.anims.generateFrameNumbers('stomperSheet', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        var scoreIcon = this.add.image(SCORE_X - 30, STATUS_Y, 'diamond');
        scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
        scoreIcon.setAlpha(0.5);
        scoreIcon.setScale(.1)
        this.scoreText = this.add.text(SCORE_X, STATUS_Y - 22, '0', { fontSize: '48px', color: '#000' });
        this.scoreText.setText("0")

        this.add.sprite(HOUSE_X, STATUS_Y, 'unicorn').setScale(3).setFlipX(true)
        this.runnerCostText = this.add.text(HOUSE_X + 30, STATUS_Y - 4, String(this.runnerCost), { fontSize: '32px', color: RED });

        this.add.sprite(STOMPER_HOUSE_POS.x, STATUS_Y, 'stomperSheet').setScale(3)
        this.stomperCostText = this.add.text(STOMPER_HOUSE_POS.x + 30, STATUS_Y - 4, String(this.runnerCost), { fontSize: '32px', color: RED });
        //constText.setAlign('top')


        this.minimumStage(INITIAL_STAGE)

        this.scene.launch('BackgroundScene')
    }

    update() {

        for (let stomper of this.stompers) stomper.update(this)

        for (let i = 0; i < this.runners.children.entries.length; i++) {
            let unicorn: Sprite = this.runners.children.entries[i] as Sprite;
            // make the unicorn turn around if it is off the world boundaries
            if (typeof unicorn !== 'undefined' && unicorn.x < 0) {
                this.runners.remove(unicorn)
                this.returningRunners.add(unicorn)
                unicorn.setVelocityX(UNICORN_SPEED)
                unicorn.setFlipX(false)
            }
        }
        for (let i = 0; i < this.returningRunners.children.entries.length; i++) {
            var unicorn: Sprite = this.returningRunners.children.entries[i] as Sprite;
            // make the unicorn turn around if it is off the world boundaries
            if (typeof unicorn !== 'undefined' && unicorn.x > 1200) {
                this.returningRunners.remove(unicorn)
                this.runners.add(unicorn)
                unicorn.setVelocityX(-UNICORN_SPEED)
                unicorn.setFlipX(true)
            }
        }

    }
}