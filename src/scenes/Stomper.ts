
import { GameScene } from './GameScene.ts';

type Point = Phaser.Geom.Point
type Sprite = Phaser.Physics.Arcade.Sprite

const RUNPAST = 200
const HOUSE_X = 0
const MIN_STOMPS = 3

enum StomperState {
    MOVING_RIGHT,
    JUMPING,
    STOMPING,
    MOVING_LEFT,
    RESTING
}

export class Stomper {

    sprite: Sprite
    state: StomperState
    stateVal: number = 0

    create(scene: GameScene, pos: Point): void {
        var sprite: Sprite = scene.physics.add.sprite(pos.x, pos.y, 'stomperSheet')
        scene.stomperCollisionsGroup.add(sprite)
        sprite.setBounce(0)
        sprite.setScale(4)
        sprite.setFlipX(false)
        sprite.setVelocity(350, -400)
        sprite.anims.play('stomperAnim', true);
        scene.stompers.add(this)

        this.sprite = sprite
        this.state = StomperState.MOVING_RIGHT
    }

    update(scene: GameScene): void {
        switch (this.state) {
            case (StomperState.MOVING_RIGHT):
                if (this.sprite.x > scene.diamond.x + RUNPAST) {
                    this.sprite.setVelocity(Phaser.Math.Between(-300, -200), -500)
                    if (Phaser.Math.Between(0, 1) == 0) {
                        this.sprite.setFlipX(true)
                    }
                    this.state = StomperState.JUMPING
                }
                break

            case StomperState.STOMPING:
            case StomperState.JUMPING:
                if (scene.physics.overlap(this.sprite, scene.diamond)) {
                    this.sprite.setVelocity(0, -400)
                    this.state = StomperState.STOMPING
                    scene.createShard()
                    if (this.state = StomperState.STOMPING) {
                        if (this.stateVal++ > MIN_STOMPS) {
                            if (Phaser.Math.Between(0, 1) == 0) {
                                this.state = StomperState.MOVING_LEFT
                                this.sprite.setVelocity(-250, -250)
                                this.sprite.setFlipX(true)                            
                            }
                        }
                    } else {
                        this.state = StomperState.STOMPING
                        this.stateVal = 0
                    }
                }
                break

                case StomperState.MOVING_LEFT:
                    if (this.sprite.x < HOUSE_X) {
                        this.state = StomperState.RESTING
                        this.sprite.setActive(false).setVisible(false)
                        this.sprite.setVelocity(0, 0)
                    }
                    break

                case StomperState.RESTING:
                    if (this.stateVal++ > 100) {
                        this.state = StomperState.MOVING_RIGHT
                        this.sprite.setVelocity(350, 0).setActive(true).setVisible(true)
                        this.sprite.setFlipX(false)
                        this.stateVal = 0
                    }
                    break
                }
    }
}
