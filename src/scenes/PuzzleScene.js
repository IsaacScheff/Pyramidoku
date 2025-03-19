import Phaser from 'phaser';

const BACKGROUND_COLOR = "ac7c00"
const Hieroglyphs = {
    BIRD: 'bird',
    AXE: 'axe',
    HEART: 'heart',
    SCARAB: 'scarab',
    CAT: 'cat',
    ANKH: 'ankh',
    MAN: 'man',
    EYE: 'eye'
};
class PuzzleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene' });

        this.selectedTile = null;
        this.selectedGlyph = null;
        this.pyramidoku = [
            [null],
            [null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel_font.png', 'assets/font/pixel.xml');

        this.load.spritesheet('PyramidSolved', 'assets/images/PyramidokuPuzzleSolved.png', { frameWidth: 192, frameHeight: 192 });
        this.load.image('axe', 'assets/images/Axe.png');
        this.load.image('bird', 'assets/images/GlossyIbis.png');
        this.load.image('eye', 'assets/images/Eye.png');
        this.load.image('ankh', 'assets/images/Ankh.png');
        this.load.image('heart', 'assets/images/Heart.png');
        this.load.image('man', 'assets/images/Man.png');
        this.load.image('scarab', 'assets/images/Scarab.png');
        this.load.image('cat', 'assets/images/Cat.png');
        this.load.spritesheet('AnimatedCursor', 'assets/images/PyramidokuCursor.png', { frameWidth: 8, frameHeight: 16 });
    }

    create() {
        this.pyramid = this.add.sprite(128, 110, 'PyramidSolved');
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

        if (!this.anims.exists('AnimatedPyramid')) {
            this.anims.create({
                key: 'AnimatedPyramid',
                frames: this.anims.generateFrameNumbers('PyramidSolved', { start: 0, end: 27 }),
                frameRate: 10,
                repeat: 0
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

        this.fillPyramidRandomly();
        this.renderPyramid();

        this.add.bitmapText(50, 50, 'pixelFont', 'Moves: ', 8);
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

        if(Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            if(this.selectedGlyph == null) {
                this.selectedTile = [this.cursorRow, this.cursorCol];
                this.selectedGlyph = this.pyramidoku[this.cursorRow][this.cursorCol];
            } else {
                this.tileSwap();
            }
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
        this.pyramidoku[pyramidRow][pyramidCol] = glyph;
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

    tileSwap() {
        if(this.areTilesAdjacent(this.selectedTile[0], this.selectedTile[1], this.cursorRow, this.cursorCol)){
            this.pyramidoku[this.selectedTile[0]][this.selectedTile[1]].destroy();
            this.pyramidoku[this.selectedTile[0]][this.selectedTile[1]] = null;

            if(this.pyramidoku[this.cursorRow][this.cursorCol] != null){
                this.placeTile(this.selectedTile[1], this.selectedTile[0], this.pyramidoku[this.cursorRow][this.cursorCol].texture.key);
                this.pyramidoku[this.cursorRow][this.cursorCol].destroy();
            }

            this.placeTile(this.cursorCol, this.cursorRow, this.selectedGlyph.texture.key);
        }
        this.selectedTile = null;
        this.selectedGlyph = null;
        this.checkPuzzleSolution();
    }

    areTilesAdjacent(row1, col1, row2, col2) {
        // Check if the tiles are the same
        if (row1 === row2 && col1 === col2) {
            return false;
        }
        // Check left and right adjacency
        if (row1 === row2 && (col1 === col2 - 1 || col1 === col2 + 1)) {
            return true;
        }
        // Check below adjacency (for odd-numbered columns)
        if (col1 % 2 === 1 && row1 === row2 + 1 && col1 === col2 + 1) {
            return true;
        }
        // Check above adjacency (for even-numbered columns)
        if (col1 % 2 === 0 && row1 === row2 - 1 && col1 === col2 - 1) {
            return true;
        }
        return false;
    }

    fillPyramidRandomly() {
        const glyphPool = [];
        for (const glyph of Object.values(Hieroglyphs)) {
            for (let i = 0; i < 8; i++) {
                glyphPool.push(glyph);
            }
        }

        for (let i = glyphPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [glyphPool[i], glyphPool[j]] = [glyphPool[j], glyphPool[i]]; // Swap elements
        }
    
        let poolIndex = 0;
        for (let row = 0; row < this.pyramidoku.length; row++) {
            for (let col = 0; col < this.pyramidoku[row].length; col++) {
                if (this.pyramidoku[row][col] === null) {
                    this.pyramidoku[row][col] = glyphPool[poolIndex];
                    poolIndex++;
                }
            }
        }
    }

    renderPyramid() {
        for (let row = 0; row < this.pyramidoku.length; row++) {
            for (let col = 0; col < this.pyramidoku[row].length; col++) {
                const glyph = this.pyramidoku[row][col];
                if (glyph !== null) {
                    this.placeTile(col, row, glyph);
                }
            }
        }
    }
    checkPuzzleSolution() {
        for (let row = 0; row < this.pyramidoku.length; row++) {
            for (let col = 0; col < this.pyramidoku[row].length; col++) {
                const currentGlyph = this.pyramidoku[row][col];
                if (currentGlyph !== null) {
                    const currentGlyphKey = currentGlyph.texture.key;
    
                    const adjacentPositions = [
                        { row, col: col - 1 }, 
                        { row, col: col + 1 },
                    ];
    
                    // Add below adjacency for even-numbered columns
                    if (col % 2 === 0) {
                        adjacentPositions.push({ row: row + 1, col: col + 1 }); // Below
                    }
    
                    // Add above adjacency for odd-numbered columns
                    if (col % 2 === 1 && row > 0) {
                        adjacentPositions.push({ row: row - 1, col: col - 1 }); // Above
                    }
    
                    for (const pos of adjacentPositions) {
                        if (
                            pos.row >= 0 &&
                            pos.row < this.pyramidoku.length &&
                            pos.col >= 0 &&
                            pos.col < this.pyramidoku[pos.row].length
                        ) {
                            const adjacentGlyph = this.pyramidoku[pos.row][pos.col];
                            if (
                                adjacentGlyph !== null &&
                                adjacentGlyph.texture.key === currentGlyphKey
                            ) {
                                return false; // Found a matching adjacent glyph
                            }
                        }
                    }
                }
            }
        }
        console.log("SOLVED!!!!");
        this.pyramid.play("AnimatedPyramid", true);
        return true; // No matching adjacent glyphs found in the entire puzzle
    }
}

export default PuzzleScene;