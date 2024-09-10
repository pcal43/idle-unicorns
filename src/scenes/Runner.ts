
import { GameScene } from './GameScene.ts';

type Point = Phaser.Geom.Point
type Sprite = Phaser.Physics.Arcade.Sprite

const HOUSE_X: integer = 1200
const OFFSCREEN_X: integer = 0
const UNICORN_SPEED: integer = 350

enum RunnerState {
    MOVING_LEFT,
    MOVING_RIGHT

}

export class Runner {

    sprite: Sprite
    state: RunnerState
    stateVal: number = 0

    create(scene: GameScene, pos: Point): void {
        // TODO - animate shards flying from bank to house to 'pay' for it
        this.sprite = scene.physics.add.sprite(pos.x, pos.y, 'unicorn')
        scene.runnersCollide.add(this.sprite)
        this.sprite.setBounce(0)
        this.sprite.setScale(4)
        this.sprite.setFlipX(true);
        this.sprite.setVelocity(-UNICORN_SPEED, -400)
        this.sprite.anims.play('right', true)
        this.sprite.setData('Runner', this)
        this.state = RunnerState.MOVING_LEFT
        scene.runners.add(this)
    }

    update(scene: GameScene): void {
        switch (this.state) {
            case RunnerState.MOVING_LEFT:
                if (this.sprite.x < OFFSCREEN_X) {
                    this.changeState(scene, RunnerState.MOVING_RIGHT)
                    this.sprite.setVelocityX(UNICORN_SPEED)
                    this.sprite.setFlipX(false)
                    this.state = RunnerState.MOVING_RIGHT
                }
                break
            case (RunnerState.MOVING_RIGHT):
                if (this.sprite.x > HOUSE_X) {
                    this.changeState(scene, RunnerState.MOVING_LEFT)
                }
                break
        }
    }

    collideWithShard(scene: GameScene, shard: Sprite): void {
        scene.flyingShards.add(shard);
        scene.groundShards.remove(shard);
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        this.changeState(scene, RunnerState.MOVING_RIGHT)
    }

    private changeState(scene: GameScene, state: RunnerState) {
        switch (state) {
            case RunnerState.MOVING_LEFT:
                scene.runnersCollide.add(this.sprite);
                scene.returningRunnersCollide.remove(this.sprite);
                // note to self: you need to set velocity *after* mucking around with collision group membership
                this.sprite.setVelocityX(-UNICORN_SPEED);
                this.sprite.setFlipX(true);
                this.state = state                
                break
            case RunnerState.MOVING_RIGHT:
                scene.runnersCollide.remove(this.sprite);
                scene.returningRunnersCollide.add(this.sprite);
                this.sprite.setVelocityX(UNICORN_SPEED);
                this.sprite.setFlipX(false);
                this.state = state
                break
        }
    }
}
