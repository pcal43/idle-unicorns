
import { Scene } from 'phaser';

import * as Phaser from "phaser";

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

const UNICORN_SPEED: integer = 350
const GROUND_LEVEL: integer = 580
const GROUND_DEPTH: integer = 25
//const SCORE_Y = GROUND_LEVEL - 200
const SCORE_X = 900
const HOUSE_X = 1200
const HOUSE_Y = 520
const STATUS_Y = 410


const DIAMOND_STAGE = 0
const BANK_STAGE = 1
const HOUSE_STAGE = 2


export class MainGame extends Scene {



    groundShards: Group
    flyingShards: Group

    unicornCost: integer = 3

    score: integer = 0
    scoreText: Text;
    costText: Text;
    mainCamera: Camera2D
    unicorns: Group
    returningUnicorns: Group

    stage = 0

    constructor() {
        super('MainGame');
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
            }
            this.stage = minStage
        }
    }


    panCameraTo(newX: integer, newY: integer): void {
        this.mainCamera.pan(newX, newY, 2500, 'Linear', false, function (camera, progress, dx, dy) {
            var base = (GROUND_LEVEL + GROUND_DEPTH)
            var my = base / 2 - ((base / 2 - newY) * progress)
            camera.setZoom(((base / 2)) / (base - my))
        });
    }


     onDiamondClick(_diamond:ImageWithDynamicBody):void {
        var shard:Sprite = this.flyingShards.create(400, 500, 'diamond');
        shard.setBounce(0);
        //shard.setCollideWorldBounds(true);
        shard.setBlendMode(Phaser.BlendModes.ADD);
        shard.setAlpha(0.5);
        shard.setScale(.05)
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        shard.setInteractive()
        this.minimumStage(BANK_STAGE)
        shard.on('pointerdown', this.onShardClick.bind(this, shard))
     }

     onShardClick(shard:Sprite):void {
        if (this.groundShards.contains(shard)) {
            this.groundShards.remove(shard)
            this.flyingShards.add(shard)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
        }
    }


    onHouseClick(_house:ImageWithDynamicBody):void {
        if (this.score >= this.unicornCost) {
            // TODO - animate shards flying from bank to house to 'pay' for it
            var unicorn = this.physics.add.sprite(1200, GROUND_LEVEL - 30, 'unicorn');
            this.unicorns.add(unicorn)
            unicorn.setBounce(0);
            unicorn.setScale(4)
            unicorn.setFlipX(true);
            unicorn.setVelocity(-350, -400)
            unicorn.anims.play('right', true);
            this.updateScore(-this.unicornCost)            
            this.unicornCost += 3            
            this.costText.setText(String(this.unicornCost))
        }
    }


    create() {
        var scene = this

        this.mainCamera = this.cameras.main

        this.add.image(400, 300, 'sky').setScale(10);

        const emitter = this.add.particles(0, 0, "red", {
            speed: 100,
            scale: { start: 2.5, end: 0 },
            blendMode: "ADD",
        });


        var ground: StaticGroup = this.physics.add.staticGroup();

        this.groundShards = this.physics.add.group();
        this.flyingShards = this.physics.add.group();

        var diamond:ImageWithDynamicBody = this.physics.add.image(400, -200, 'diamond');

        diamond.setSize(4, 4);
        diamond.setScale(.5)
        diamond.setInteractive()
        emitter.startFollow(diamond);
        diamond.on('pointerdown', this.onDiamondClick.bind(this, diamond))

        var bank:ImageWithDynamicBody = this.physics.add.image(915, 520, 'bank');
        // FIXME compiler complaining about the third argument here, but removing it causes lag
        bank.setScale(.25)
        bank.body.setImmovable(true);
        bank.body.allowGravity = false;

        var house:ImageWithDynamicBody = this.physics.add.image(HOUSE_X, HOUSE_Y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', this.onHouseClick.bind(this, house))


        this.unicorns = this.physics.add.group();
        this.returningUnicorns = this.physics.add.group();

        //
        // setup collisions
        //

        this.physics.add.collider(this.flyingShards, ground, function (s, _) {
            var shard: Sprite = s as Sprite;            
            scene.flyingShards.remove(shard)
            scene.groundShards.add(shard)
            shard.setVelocity(0, 0)
        });
        this.physics.add.collider(bank, this.flyingShards, function (_, s) {
            var shard: Sprite = s as Sprite;            
            shard.disableBody(true, true);
            scene.updateScore(1)
        });
        this.physics.add.collider(this.groundShards, ground);
        this.physics.add.collider(diamond, ground);
        this.physics.add.collider(this.unicorns, ground);
        this.physics.add.collider(this.returningUnicorns, ground);
        this.physics.add.collider(this.unicorns, this.groundShards, (u, s): void => {
            var shard: Sprite = s as Sprite;
            var unicorn: Sprite = u as Sprite;
            shard.setVelocity(0, 0);
            scene.flyingShards.add(shard);
            scene.groundShards.remove(shard);
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            scene.unicorns.remove(unicorn);
            scene.returningUnicorns.add(unicorn);
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

        var scoreIcon = this.add.image(SCORE_X - 30, STATUS_Y, 'diamond');
        scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
        scoreIcon.setAlpha(0.5);
        scoreIcon.setScale(.1)
        this.scoreText = this.add.text(SCORE_X, STATUS_Y - 22, '0', { fontSize: '48px', color: '#000' });
        this.scoreText.setText("0")

        //unicornButton = this.physics.add.sprite(900, 50, 'unicorn');
        var unicornButton = this.add.sprite(HOUSE_X, STATUS_Y, 'unicorn');
        //unicornButton = this.add.sprite(100, 70, 'unicorn');
        //unicornButton.frame = 0
        unicornButton.setScale(3)
        unicornButton.setFlipX(true);
        unicornButton.setInteractive()
        this.costText = this.add.text(HOUSE_X + 30, STATUS_Y - 4, String(this.unicornCost), { fontSize: '32px', color: '#000' });
        //constText.setAlign('top')

    }


    updateScore(delta: integer) {
        this.score += delta
        if (this.score >= this.unicornCost) {
            this.minimumStage(HOUSE_STAGE)
            this.costText.setColor('#00FF00')
        } else {
            this.costText.setColor('#FF0000')
        }
        this.scoreText.setText(String(this.score))
    }

    update() {
        for(var i=0; i<this.unicorns.children.entries.length; i++) {
            var unicorn: Sprite = this.unicorns.children.entries[i] as Sprite;
            // make the unicorn turn around if it is off the world boundaries
            if (typeof unicorn !== 'undefined' && unicorn.x < 0) {
                this.unicorns.remove(unicorn)
                this.returningUnicorns.add(unicorn)
                unicorn.setVelocityX(UNICORN_SPEED)
                unicorn.setFlipX(false)
            }
        }
        for(var i=0; i<this.returningUnicorns.children.entries.length; i++) {
            var unicorn: Sprite = this.returningUnicorns.children.entries[i] as Sprite;
            // make the unicorn turn around if it is off the world boundaries
            if (typeof unicorn !== 'undefined' && unicorn.x > 1200) {
                this.returningUnicorns.remove(unicorn)
                this.unicorns.add(unicorn)
                unicorn.setVelocityX(-UNICORN_SPEED)
                unicorn.setFlipX(true)
            }
        }

    }
}