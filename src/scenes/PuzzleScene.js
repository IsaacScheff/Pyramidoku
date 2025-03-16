import Phaser from 'phaser';

const BACKGROUND_COLOR = "ac7c00"
const Hieroglyphics = {
    DANCER: 'dancer',
    EYE: 'eye',
    BIRD: 'bird',
};

let pyramidoku = [
    [null],
    [null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null]
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
];

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
        this.cursorCol = 7;
        this.cursorRow = 6;

        if (!this.anims.exists('AnimatedCursor')) {
            this.anims.create({
                key: 'AnimatedCursor',
                frames: this.anims.generateFrameNumbers('AnimatedCursor', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        };

        this.cursor = this.add.sprite(
            this.cursorCol * 32,
            this.cursorRow * 32,
            'AnimatedCursor' 
        );

        this.cursor.play("AnimatedCursor", true);
        this.placeCursor();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);  
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.moveCursor("Left");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyD)) {  
            this.moveCursor("Right");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.moveCursor("Up");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.moveCursor("Down");
            this.placeCursor();
        }
    }

    moveCursor(direction) {
        const numRows = 8;
        let newRow = this.cursorRow;
        let newCol = this.cursorCol;

        switch(direction) {
            case "Up":
                newRow = this.cursorRow - 1;
                if(this.cursorCol == 0) {
                    break;
                }
                if (this.cursorCol == this.cursorRow * 2){
                    newCol = this.cursorCol - 2; 
                } else {
                    newCol = this.cursorCol - 1; 
                }
                break;
            case "Down":
                newRow = this.cursorRow + 1;
                newCol = this.cursorCol + 1;
                break;
            case "Right":
                newCol = this.cursorCol + 1;
                break;
            case "Left":
                newCol = this.cursorCol - 1;
                break;
        }

        if (newRow >= 0 && newRow < numRows) {
            const numColsInNewRum = (newRow * 2) + 1;
            if (newCol >= 0 && newCol < numColsInNewRum) {
                this.cursorRow = newRow;
                this.cursorCol = newCol;
            }
        }
    }

    placeCursor() { 
        this.cursor.x = 128 + (this.cursorCol * 12) - (this.cursorRow * 12);
        
        let y = 36 + (this.cursorRow * 23);
        if (this.cursorCol % 2 != 0) {
            y -= 6;
        }
        this.cursor.y = y;
    }
}

export default PuzzleScene;