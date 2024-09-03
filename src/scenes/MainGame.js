
import { Scene } from 'phaser';

import * as Phaser from "phaser";

export class MainGame extends Scene {



    scene = this

    UNICORN_SPEED = 350
    UNICORN_COST = 3
    GROUND_LEVEL = 580
    GROUND_DEPTH = 25

    bank
    score = 0
    scoreText;
    costText;
    mainCamera
    unicorns
    returningUnicorns

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


    preload() {
    }



    minimumStage(minStage) {
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


    panCameraTo(newX, newY) {
        this.mainCamera.pan(newX, newY, 2500, 'Linear', false, function (camera, progress, dx, dy) {
            var base = (this.GROUND_LEVEL + this.GROUND_DEPTH)
            var my = base / 2 - ((base / 2 - newY) * progress)
            camera.setZoom(((base / 2)) / (base - my))
        });
    }

    create() {
        var outerThis = this

        this.mainCamera = this.cameras.main

        var sky = this.add.image(400, 300, 'sky').setScale(10);
        //sky.setInteractive();

        //var particles = this.add.particles('red');

        const emitter = this.add.particles(0, 0, "red", {
            speed: 100,
            scale: { start: 2.5, end: 0 },
            blendMode: "ADD",
        });

        this.cam = this.cameras.main

        this.ground = this.physics.add.staticGroup();

        this.groundShards = this.physics.add.group();
        this.flyingShards = this.physics.add.group();

        this.diamond = this.physics.add.image(400, -200, 'diamond');

        this.diamond.setSize(4, 4, true);
        this.diamond.setScale(.5)
        this.diamond.setInteractive()
        emitter.startFollow(this.diamond);
        this.diamond.on('pointerdown', function (pointer, targets) {
            var shard = outerThis.flyingShards.create(400, 500, 'diamond');
            shard.setBounce(0);
            //shard.setCollideWorldBounds(true);
            shard.setBlendMode(Phaser.BlendModes.ADD);
            shard.setAlpha(0.5);
            shard.setScale(.05)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            shard.setInteractive()
            outerThis.minimumStage(outerThis.BANK_STAGE)

            shard.on('pointerdown', function (pointer, targets) {
                if (outerThis.groundShards.contains(shard)) {
                    outerThis.groundShards.remove(shard)
                    outerThis.flyingShards.add(shard)
                    shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
                }
            })
        });


        this.bank = this.physics.add.image(915, 520, 'bank');
        this.bank.setSize(this.bank.width - 200, this.bank.height - 200, true);
        this.bank.setScale(.25)
        this.bank.setImmovable(true);
        this.bank.body.allowGravity = false;

        var house = this.physics.add.image(this.HOUSE_X, this.HOUSE_Y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', function (pointer, targets) { outerThis.tryAddUnicorn() })


        this.unicorns = this.physics.add.group();
        this.returningUnicorns = this.physics.add.group();


        //
        // setup collisions
        //
        this.physics.add.collider(this.flyingShards, this.ground, function (shard, platform) {
            outerThis.flyingShards.remove(shard)
            outerThis.groundShards.add(shard)
            shard.setVelocity(0, 0)
        });
        this.physics.add.collider(this.bank, this.flyingShards, function (bank, shard) {
            shard.disableBody(true, true);
            outerThis.updateScore(1)
        });
        this.physics.add.collider(this.groundShards, this.ground);
        this.physics.add.collider(this.diamond, this.ground);
        this.physics.add.collider(this.unicorns, this.ground);
        this.physics.add.collider(this.returningUnicorns, this.ground);
        this.physics.add.collider(this.unicorns, this.groundShards, function (unicorn, shard) {
            shard.setVelocity(0, 0)
            outerThis.flyingShards.add(shard)
            outerThis.groundShards.remove(shard)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            outerThis.unicorns.remove(unicorn)
            outerThis.returningUnicorns.add(unicorn)
            unicorn.setVelocityX(outerThis.UNICORN_SPEED)
            unicorn.setFlipX(!unicorn.flipX)
        });



        var grass = this.add.tileSprite(-2048, this.GROUND_LEVEL, 4096, this.GROUND_DEPTH, "grass");
        //ground.setScale(1.5)
        //let ground = this.add.rectangle(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, 0xffffff);
        grass.setOrigin(0, 0); // i dont understand this
        this.ground.add(grass)


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
        this.costText = this.add.text(this.HOUSE_X + 30, this.STATUS_Y - 4, this.UNICORN_COST, { fontSize: '32px', fill: '#000' });
        //constText.setAlign('top')




        this.phys = this.physics

        unicornButton.on('pointerdown', function (pointer, targets) {
            outerThis.tryAddUnicorn()
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
            this.costText.setText(this.UNICORN_COST)
        }
    }

    updateScore(delta) {
        this.score += delta
        if (this.score >= this.UNICORN_COST) {
            this.minimumStage(this.HOUSE_STAGE)
            this.costText.setColor('#00FF00')
        } else {
            this.costText.setColor('#FF0000')
        }
        this.scoreText.setText(this.score);
    }

    update() {
        var outerThis = this

        this.unicorns.children.iterate(function (uni) {
            // make the unicorn turn around if it is off the world boundaries
            if (typeof uni !== 'undefined' && uni.x < 0) {
                outerThis.unicorns.remove(uni)
                outerThis.returningUnicorns.add(uni)
                uni.body.setVelocityX(outerThis.UNICORN_SPEED)
                uni.setFlipX(false)
            }
        });

        this.returningUnicorns.children.iterate(function (uni) {
            // make the unicorn turn around if it is off the world boundaries
            if (typeof uni !== 'undefined' && uni.x > 1200) {
                outerThis.returningUnicorns.remove(uni)
                outerThis.unicorns.add(uni)
                uni.body.setVelocityX(-outerThis.UNICORN_SPEED)
                uni.setFlipX(true)
            }
        });
    }
}