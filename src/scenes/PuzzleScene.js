import Phaser from 'phaser';

const BACKGROUND_COLOR = "ac7c00"
const Hieroglyphics = {
    BIRD: 'bird',
    AXE: 'axe',
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
        this.load.image('axe', 'assets/images/Axe.png');
        this.load.image('bird', 'assets/images/GlossyIbis.png');
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

        this.setupControls();

        this.placeTile(4, 4, Hieroglyphics.BIRD);
        this.placeTile(1, 7, Hieroglyphics.AXE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.left)) {
            this.moveCursor("Left");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.right)) {  
            this.moveCursor("Right");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            this.moveCursor("Up");
            this.placeCursor();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keys.down)) {
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

    placeTile(pyramidCol, pyramidRow, tile) {
        const x = 128 + (pyramidCol * 12) - (pyramidRow * 12);
        let y = 36 + (pyramidRow * 23);
        if (pyramidCol % 2 != 0) {
            y -= 6;
        }
        const glyph = this.add.image(x, y, tile);
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            B: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
        };
    }
}

export default PuzzleScene;
