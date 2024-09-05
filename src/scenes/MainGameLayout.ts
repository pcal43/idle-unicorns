
// You can write more code here

/* START OF COMPILED CODE */

import Phaser from "phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export class MainGameLayout extends Phaser.Scene {

	constructor() {
		super("MainGame");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// sky
		const sky = this.add.image(0, 0, "sky");
		sky.scaleX = 1.2778527722618436;
		sky.scaleY = 1.2758214667225969;
		sky.setOrigin(0, 0);

		// tilesprite_1
		this.add.tileSprite(563, 754, 1325, 31, "grass");

		// house
		const house = this.add.image(862, 667, "house");
		house.scaleX = 0.28815620461799274;
		house.scaleY = 0.28815620461799274;

		// arcadeimage_1
		const arcadeimage_1 = this.physics.add.image(245, 156, "diamond");
		arcadeimage_1.name = "arcadeimage_1";
		arcadeimage_1.scaleX = 0.32676769622281354;
		arcadeimage_1.scaleY = 0.32676769622281354;
		arcadeimage_1.body.setOffset(5, 5);
		arcadeimage_1.body.setSize(550, 452, false);

		// arcadeimage_2
		const arcadeimage_2 = this.physics.add.image(565, 667, "bank");
		arcadeimage_2.scaleX = 0.21326127874374826;
		arcadeimage_2.scaleY = 0.21326127874374826;
		arcadeimage_2.body.immovable = true;
		arcadeimage_2.body.setSize(917, 715, false);

		// red
		this.add.image(364, 201, "red");

		// collider
		this.physics.add.collider();

		this.arcadeimage_1 = arcadeimage_1;

		this.events.emit("scene-awake");
	}

	 private arcadeimage_1!: Phaser.Physics.Arcade.Image;

	/* START-USER-CODE */

	// Write your code here

	create() {
        this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
