import { Scene } from 'phaser';


//import { Physics.Arcade.StaticGroup } from 'phaser';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;

    constructor() {
        super('Game');
    }

    UNICORN_SPEED: integer = 350
    UNICORN_COST: integer = 3
    GROUND_LEVEL: integer = 580
    GROUND_DEPTH: integer = 25


    phys: any
    score: integer = 0
    scoreText: Phaser.GameObjects.Text;
    costText: Phaser.GameObjects.Text;
    mainCamera: Phaser.Cameras.Scene2D.Camera
    unicorns: Phaser.Physics.Arcade.Group
    returningUnicorns: Phaser.Physics.Arcade.Group

    DIAMOND_STAGE: integer = 0
    BANK_STAGE: integer = 1
    HOUSE_STAGE: integer = 2


    SCORE_Y: integer = this.GROUND_LEVEL - 200
    SCORE_X: integer = 900

    HOUSE_X: integer = 1200
    HOUSE_Y: integer = 520

    STATUS_Y: integer = 410

    stage: integer = 0


    preload() {
    }

    minimumStage(minStage:integer) {
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

    panCameraTo(newX:integer, newY:integer) {
        this.mainCamera.pan(newX, newY, 2500, 'Linear', false, 
            function (camera, progress, _dx:integer, _dy:integer) {
                var base = (this.GROUND_LEVEL + this.GROUND_DEPTH)
                var my = base / 2 - ((base / 2 - newY) * progress)
                camera.setZoom(((base / 2)) / (base - my))
        });
    }

    create() {
        this.mainCamera = this.cameras.main

        var sky: Phaser.GameObjects.Image = this.add.image(400, 300, 'sky').setScale(10);
        //sky.setInteractive();

        var particles: Phaser.GameObjects.Particles.ParticleEmitter = this.add.particles('red');

        var emitter = this.add.particles({
            speed: 100,
            scale: { start: 2, end: 0 },
            blendMode: 'ADD'
        });


        var ground:Phaser.Physics.Arcade.StaticGroup = this.physics.add.staticGroup();

        var groundShards: Phaser.Physics.Arcade.Group = this.physics.add.group();
        var flyingShards: Phaser.Physics.Arcade.Group = this.physics.add.group();


        var diamond:Phaser.Types.Physics.Arcade.ImageWithDynamicBody = this.physics.add.image(400, -200, 'diamond');
        diamond.setSize(4, 4);
        diamond.setScale(.5)
        diamond.setInteractive()
        emitter.startFollow(diamond);
        diamond.on('pointerdown', function (_pointer, _targets) {
            var shard = flyingShards.create(400, 500, 'diamond');
            shard.setBounce(0);
            //shard.setCollideWorldBounds(true);
            shard.setBlendMode(Phaser.BlendModes.ADD);
            shard.setAlpha(0.5);
            shard.setScale(.05)
            shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
            shard.setInteractive()
            this.minimumStage(this.BANK_STAGE)

            shard.on('pointerdown', function (_pointer: Phaser.Input.Pointer, _targets: Phaser.GameObjects.GameObject[]) {
                if (groundShards.contains(shard)) {
                    groundShards.remove(shard)
                    flyingShards.add(shard)
                    shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
                }
            })
        });


        var bank:Phaser.Types.Physics.Arcade.ImageWithDynamicBody = this.physics.add.image(915, 520, 'bank');
        bank.setSize(bank.width - 200, bank.height - 200);
        bank.setScale(.25)
        bank.setImmovable(true);
        bank.body.allowGravity = false;

        var house = this.physics.add.image(this.HOUSE_X, this.HOUSE_Y, 'house');
        house.setScale(.35)
        house.setImmovable(true);
        house.body.allowGravity = false;
        house.setInteractive()
        house.on('pointerdown', function (_pointer, _targets) { tryAddUnicorn() })


        this.unicorns = this.physics.add.group();
        this.returningUnicorns = this.physics.add.group();


        type GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;

        //
        // setup collisions
        //
        this.physics.add.collider(flyingShards, ground,  (shard: Phaser.Types.Physics.Arcade.GameObjectWithBody, _platform: GameObjectWithBody) => {
            flyingShards.remove(shard)
            groundShards.add(shard)
            shard.setVelocity(0, 0)
        });
        this.physics.add.collider(bank, flyingShards, function (_bank, shard) {
            shard.disableBody(true, true);
            updateScore(1)
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
            unicorns.remove(unicorn)
            returningUnicorns.add(unicorn)
            unicorn.setVelocityX(UNICORN_SPEED)
            unicorn.setFlipX(!unicorn.flipX)
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


        var scoreIcon = this.add.image(this.SCORE_X - 30, this.STATUS_Y, 'diamond');
        scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
        scoreIcon.setAlpha(0.5);
        scoreIcon.setScale(.1)
        this.scoreText = this.add.text(this.SCORE_X, this.STATUS_Y - 22, '0', { fontSize: '48px', fill: '#000' });
        this.scoreText.setText("0")

        //unicornButton = this.physics.add.sprite(900, 50, 'unicorn');
        var unicornButton = this.add.sprite(HOUSE_X, STATUS_Y, 'unicorn');
        //unicornButton = this.add.sprite(100, 70, 'unicorn');
        //unicornButton.frame = 0
        unicornButton.setScale(3)
        unicornButton.setFlipX(true);
        unicornButton.setInteractive()
        costText = this.add.text(HOUSE_X + 30, STATUS_Y - 4, UNICORN_COST, { fontSize: '32px', fill: '#000' });
        //constText.setAlign('top')




        phys = this.physics

        unicornButton.on('pointerdown', function (_pointer, _targets) {
            tryAddUnicorn()
        });

    }

function tryAddUnicorn() {
    if (score >= UNICORN_COST) {
        // TODO - animate shards flying from bank to house to 'pay' for it
        updateScore(-UNICORN_COST)
        var unicorn = phys.add.sprite(1200, GROUND_LEVEL - 30, 'unicorn');
        unicorns.add(unicorn)
        unicorn.setBounce(0);
        unicorn.setScale(4)
        unicorn.setFlipX(true);
        unicorn.setVelocity(-350, -400)
        unicorn.anims.play('right', true);
        UNICORN_COST += 3
        costText.setText(UNICORN_COST)
    }
}

function updateScore(delta) {
    score += delta
    if (score >= UNICORN_COST) {
        minimumStage(HOUSE_STAGE)
        costText.setColor('#00FF00')
    } else {
        costText.setColor('#FF0000')
    }
    scoreText.setText(score);
}

function update() {

    unicorns.children.iterate(function (uni) {
        // make the unicorn turn around if it is off the world boundaries
        if (typeof uni !== 'undefined' && uni.x < 0) {
            unicorns.remove(uni)
            returningUnicorns.add(uni)
            uni.body.setVelocityX(UNICORN_SPEED)
            uni.setFlipX(false)
        }
    });
    returningUnicorns.children.iterate(function (uni) {
        // make the unicorn turn around if it is off the world boundaries
        if (typeof uni !== 'undefined' && uni.x > 1200) {
            returningUnicorns.remove(uni)
            unicorns.add(uni)
            uni.body.setVelocityX(-UNICORN_SPEED)
            uni.setFlipX(true)
        }
    });

}




}
