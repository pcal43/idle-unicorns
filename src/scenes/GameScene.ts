
import { Scene } from 'phaser';

import * as Phaser from "phaser";
import { Stomper } from './Stomper.ts'
import { Runner } from './Runner.ts'

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

const GROUND_LEVEL: integer = 768-20
const GROUND_DEPTH: integer = 25
//const SCORE_Y = GROUND_LEVEL - 200
const SCORE_X: integer = 900

const STATUS_Y: integer = 410


const SHARD_POS: Point = new Phaser.Geom.Point(400, 500)
const DIAMOND_POS: Point = new Phaser.Geom.Point(400, -200)
const STOMPER_HOUSE_POS: Point = new Phaser.Geom.Point(0, 520)
const RUNNER_HOUSE_POS: Point = new Phaser.Geom.Point(1200, 520)


const RUNNER_COST_INCREMENT = 1
const STOMPER_COST_INCREMENT = 1
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

    runnerCost: integer = 0
    stomperCost: integer = 0

    score: integer = 0
    scoreText: Text;
    runnerCostText: Text;
    mainCamera: Camera2D
    runnersCollide: Group
    returningRunnersCollide: Group
    stomperCollisionsGroup: Group

    stomperCostText: Text;

    diamond:Sprite

    stompers: Set<Stomper> = new Set<Stomper>()
    runners: Set<Runner> = new Set<Runner>()

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

    onRunnerHouseClick(_house: ImageWithDynamicBody): void {
        if (this.score >= this.runnerCost) {
            new Runner().create(this, this.point(RUNNER_HOUSE_POS.x, GROUND_LEVEL -30))
            this.changeScore(-this.runnerCost)
            this.runnerCost += RUNNER_COST_INCREMENT
            this.runnerCostText.setText(String(this.runnerCost))
            this.minimumStage(STOMPER_STAGE)
        }
    }

    onStomperHouseClick(_house: ImageWithDynamicBody): void {
        if (this.score >= this.stomperCost) {
            new Stomper().create(this, this.point(STOMPER_HOUSE_POS.x, GROUND_LEVEL -30))
            this.changeScore(-this.stomperCost)
            this.stomperCostText.setText(String(this.stomperCost))            
            this.stomperCost += STOMPER_COST_INCREMENT
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

        var house: ImageWithDynamicBody = this.physics.add.image(RUNNER_HOUSE_POS.x, RUNNER_HOUSE_POS.y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', this.onRunnerHouseClick.bind(this, house))

        var stomperHouse: ImageWithDynamicBody = this.physics.add.image(STOMPER_HOUSE_POS.x, STOMPER_HOUSE_POS.y, 'stomperHouse');
        stomperHouse.setScale(.35)
        stomperHouse.setImmovable(true);
        stomperHouse.body.allowGravity = false;
        stomperHouse.setInteractive()
        stomperHouse.on('pointerdown', this.onStomperHouseClick.bind(this, stomperHouse))



        this.runnersCollide = this.physics.add.group();
        this.returningRunnersCollide = this.physics.add.group();

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
        this.physics.add.collider(this.runnersCollide, ground);
        this.physics.add.collider(this.returningRunnersCollide, ground);
        this.physics.add.collider(this.runnersCollide, this.groundShards, (u, shard): void => {
            var unicorn: Sprite = u as Sprite;
            var runner: Runner = unicorn.getData('Runner')
            runner.collideWithShard(this, shard as Sprite)
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

        this.add.sprite(RUNNER_HOUSE_POS.x, STATUS_Y, 'unicorn').setScale(3).setFlipX(true)
        this.runnerCostText = this.add.text(RUNNER_HOUSE_POS.x + 30, STATUS_Y - 4, String(this.runnerCost), { fontSize: '32px', color: RED });

        this.add.sprite(STOMPER_HOUSE_POS.x, STATUS_Y, 'stomperSheet').setScale(3)
        this.stomperCostText = this.add.text(STOMPER_HOUSE_POS.x + 30, STATUS_Y - 4, String(this.runnerCost), { fontSize: '32px', color: RED });
        //constText.setAlign('top')


        this.minimumStage(INITIAL_STAGE)

        this.scene.launch('BackgroundScene')
    }

    update() {

        for (let stomper of this.stompers) stomper.update(this)
        for (let runner of this.runners) runner.update(this)
    }
}