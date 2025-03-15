import Phaser from 'phaser';

const BACKGROUND_COLOR = "ac7c00"

class PuzzleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'PuzzleScene' });
    }

    preload() {
        this.load.image('PyramidBackground', 'assets/images/PyramidokuPuzzleBackground.png');
        this.load.spritesheet('AnimatedCursor', 'assets/images/PyramidokuCursor.png', { frameWidth: 8, frameHeight: 16 });
    }

    create() {
        this.add.image(128, 110, 'PyramidBackground');
        this.cameras.main.setBackgroundColor(BACKGROUND_COLOR);
        this.cursorCol = 100;
        this.cursorRow = 100;

        if (!this.anims.exists('AnimatedCursor')) {
            this.anims.create({
                key: 'AnimatedCursor',
                frames: this.anims.generateFrameNumbers('AnimatedCursor', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.cursor = this.add.sprite(
            this.cursorCol,
            this.cursorRow,
            'AnimatedCursor' 
        )

        this.cursor.play("AnimatedCursor", true);
    }

    update() {
    }
}

export default PuzzleScene;
