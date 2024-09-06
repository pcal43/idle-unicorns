
import { Scene } from 'phaser';

import * as Phaser from "phaser";

type GameObject = Phaser.GameObjects.GameObject
type Image = Phaser.GameObjects.Image;
type ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
type Camera2D = Phaser.Cameras.Scene2D.Camera;
type Text = Phaser.GameObjects.Text;
type ImageWithDynamicBody = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
type Group = Phaser.Physics.Arcade.Group;
type GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
type StaticGroup = Phaser.Physics.Arcade.StaticGroup

export class MainGame extends Scene {


    UNICORN_SPEED:integer = 350
    UNICORN_COST:integer = 3
    GROUND_LEVEL:integer = 580
    GROUND_DEPTH:integer = 25

    score:integer = 0
    scoreText: Text;
    costText: Text;
    mainCamera: Camera2D
    unicorns: Group
    returningUnicorns: Group

    DIAMOND_STAGE = 0
    BANK_STAGE = 1
    HOUSE_STAGE = 2


    SCORE_Y = this.GROUND_LEVEL - 200
    SCORE_X = 900

    HOUSE_X = 1200
    HOUSE_Y = 520

    STATUS_Y = 410

    stage = 0

    constructor() {
        super('MainGame');
    }


    preload() : void {
    }



    minimumStage(minStage:integer) : void {
        if (this.stage < minStage) {
            switch (minStage) {
                case this.DIAMOND_STAGE:
                    break;
                case this.BANK_STAGE:
                    this.panCameraTo(630, this.GROUND_LEVEL / 2)
                    break;
                case this.HOUSE_STAGE:
                    this.panCameraTo(800, this.GROUND_LEVEL / 2 - 100)
                    break;
            }
            this.stage = minStage
        }
    }


    panCameraTo(newX:integer, newY:integer) : void {
        var scene = this
        this.mainCamera.pan(newX, newY, 2500, 'Linear', false, function (camera, progress, dx, dy) {
            var base = (scene.GROUND_LEVEL + scene.GROUND_DEPTH)
            var my = base / 2 - ((base / 2 - newY) * progress)
            camera.setZoom(((base / 2)) / (base - my))
        });
    }

    create() {
        var scene = this

        scene.mainCamera = this.cameras.main

        scene.add.image(400, 300, 'sky').setScale(10);

        const emitter = this.add.particles(0, 0, "red", {
            speed: 100,
            scale: { start: 2.5, end: 0 },
            blendMode: "ADD",
        });


        var ground:StaticGroup = this.physics.add.staticGroup();

        var groundShards:Group = this.physics.add.group();
        var flyingShards:Group = this.physics.add.group();


        var diamond:ImageWithDynamicBody = this.physics.add.image(400, -200, 'diamond');

        diamond.setSize(4, 4);
        diamond.setScale(.5)
        diamond.setInteractive()
        emitter.startFollow(diamond);
        diamond.on('pointerdown', function (/*pointer, targets*/) {
            var shard = flyingShards.create(400, 500, 'diamond');
            shard.setBounce(0);
            //shard.setCollideWorldBounds(true);
            shard.setBlendMode(Phaser.BlendModes.ADD);
            shard.setAlpha(0.5);
            shard.setScale(.05)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            shard.setInteractive()
            scene.minimumStage(scene.BANK_STAGE)

            shard.on('pointerdown', function (/*pointer, targets*/) {
                if (groundShards.contains(shard)) {
                    groundShards.remove(shard)
                    flyingShards.add(shard)
                    shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
                }
            })
        });

        var bank: ImageWithDynamicBody = this.physics.add.image(915, 520, 'bank');
        // FIXME compiler complaining about the third argument here, but removing it causes lag
        bank.setScale(.25)
        bank.body.setImmovable(true);
        bank.body.allowGravity = false;

        var house = this.physics.add.image(this.HOUSE_X, this.HOUSE_Y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', function (/*pointer, targets*/) { scene.tryAddUnicorn() })


        this.unicorns = this.physics.add.group();
        this.returningUnicorns = this.physics.add.group();


        //
        // setup collisions
        //
        this.physics.add.collider(flyingShards, ground, function (shard, _platform) {
            flyingShards.remove(shard)
            groundShards.add(shard)
            shard.setVelocity(0, 0)
        });
        this.physics.add.collider(bank, flyingShards, function (_, shard:Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody) {
            shard.disableBody(true, true);
            scene.updateScore(1)
        });
        this.physics.add.collider(groundShards, ground);
        this.physics.add.collider(diamond, ground);
        this.physics.add.collider(this.unicorns, ground);
        this.physics.add.collider(this.returningUnicorns, ground);
        this.physics.add.collider(this.unicorns, groundShards, function (unicorn, shard) {
            shard.setVelocity(0, 0)
            flyingShards.add(shard)
            groundShards.remove(shard)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            scene.unicorns.remove(unicorn)
            scene.returningUnicorns.add(unicorn)
            unicorn.setVelocityX(scene.UNICORN_SPEED)
            unicorn.setFlipX(!unicorn.flipX)
        });



        var grass = this.add.tileSprite(-2048, this.GROUND_LEVEL, 4096, this.GROUND_DEPTH, "grass");
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



        var scoreIcon = this.add.image(this.SCORE_X - 30, this.STATUS_Y, 'diamond');
        scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
        scoreIcon.setAlpha(0.5);
        scoreIcon.setScale(.1)
        this.scoreText = this.add.text(this.SCORE_X, this.STATUS_Y - 22, '0', { fontSize: '48px', fill: '#000' });
        this.scoreText.setText("0")

        //unicornButton = this.physics.add.sprite(900, 50, 'unicorn');
        var unicornButton = this.add.sprite(this.HOUSE_X, this.STATUS_Y, 'unicorn');
        //unicornButton = this.add.sprite(100, 70, 'unicorn');
        //unicornButton.frame = 0
        unicornButton.setScale(3)
        unicornButton.setFlipX(true);
        unicornButton.setInteractive()
        this.costText = this.add.text(this.HOUSE_X + 30, this.STATUS_Y - 4, String(this.UNICORN_COST), { fontSize: '32px', fill: '#000' });
        //constText.setAlign('top')


        unicornButton.on('pointerdown', function () {
            scene.tryAddUnicorn()
        });

    }

    tryAddUnicorn() {
        if (this.score >= this.UNICORN_COST) {
            // TODO - animate shards flying from bank to house to 'pay' for it
            this.updateScore(-this.UNICORN_COST)
            var unicorn = this.physics.add.sprite(1200, this.GROUND_LEVEL - 30, 'unicorn');
            this.unicorns.add(unicorn)
            unicorn.setBounce(0);
            unicorn.setScale(4)
            unicorn.setFlipX(true);
            unicorn.setVelocity(-350, -400)
            unicorn.anims.play('right', true);
            this.UNICORN_COST += 3
            this.costText.setText(String(this.UNICORN_COST))
        }
    }

    updateScore(delta:integer) {
        this.score += delta
        if (this.score >= this.UNICORN_COST) {
            this.minimumStage(this.HOUSE_STAGE)
            this.costText.setColor('#00FF00')
        } else {
            this.costText.setColor('#FF0000')
        }
        this.scoreText.setText(String(this.score))
    }

    update() {
        var scene = this

        this.unicorns.children.iterate(function (uni)  {
            // make the unicorn turn around if it is off the world boundaries
            if (typeof uni !== 'undefined' && uni.x < 0) {
                scene.unicorns.remove(uni)
                scene.returningUnicorns.add(uni)
                uni.body.setVelocityX(scene.UNICORN_SPEED)
                uni.setFlipX(false)
            }
        });

        this.returningUnicorns.children.iterate(function (uni: GameObject) {
            // make the unicorn turn around if it is off the world boundaries
            if (typeof uni !== 'undefined' && uni.x > 1200) {
                scene.returningUnicorns.remove(uni)
                scene.unicorns.add(uni)
                uni.body.setVelocityX(-scene.UNICORN_SPEED)
                uni.setFlipX(true)
            }
        });
    }
}