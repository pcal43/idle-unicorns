
// You can write more code here

/* START OF COMPILED CODE */

class GameScene extends Phaser.Scene {

	constructor() {
		super("GameScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// sky
		const sky = this.add.image(330, 240, "sky");
		sky.scaleX = 1.6375;

		// tilesprite_1
		this.add.tileSprite(334, 521, 1325, 31, "grass");

		// diamond
		const diamond = this.add.image(263, 187, "diamond");
		diamond.scaleX = 0.3203162957913156;
		diamond.scaleY = 0.3203162957913156;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
