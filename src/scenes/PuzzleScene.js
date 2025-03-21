import Phaser from 'phaser';

const BACKGROUND_COLOR = "004858"
const CURSOR_DEPTH = 4; 
const TILE_DEPTH = 3;
const ADJ_HIGHLIGHT_DEPTH = 2;
const SOLVED_HIGHLIGHT_DEPTH = 1;

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

        this.puzzleIsSolved = false;

        this.seed = 0; // Default seed
        this.random = this.seededRandom(this.seed);

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
        this.numberOfMoves = 0;

        this.adjHighlights = [];
        this.solvedHighlights = [];

        this.glyphMoveCounts = {
            [Hieroglyphs.BIRD]: 0,
            [Hieroglyphs.AXE]: 0,
            [Hieroglyphs.HEART]: 0,
            [Hieroglyphs.SCARAB]: 0,
            [Hieroglyphs.CAT]: 0,
            [Hieroglyphs.ANKH]: 0,
            [Hieroglyphs.MAN]: 0,
            [Hieroglyphs.EYE]: 0,
        };

        this.glyphMoveCountTexts = {};
    }

    init(data) {
        // Override the default seed if a seed is provided
        if (data.seed !== undefined) {
            this.seed = data.seed;
        }
        this.random = this.seededRandom(this.seed);
    }
    // Seeded random number generator (Linear Congruential Generator)
    seededRandom(seed) {
        let value = seed;
        return function() {
            value = (value * 9301 + 49297) % 233280; // LCG parameters
            return value / 233280; // Normalize to [0, 1)
        };
    }

    setSeed(seed) {
        this.seed = seed;
        this.random = this.seededRandom(seed);
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel_font.png', 'assets/font/pixel.xml');

        this.load.spritesheet('PyramidSolved', 'assets/images/PyramidokuPuzzleSolved.png', { frameWidth: 192, frameHeight: 192 });
        this.load.image('solvedTile', 'assets/images/pyramidokuSolvedTriangle.png');
        this.load.image('adjTile', 'assets/images/pyramidokuAdjTriangle.png');
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
        this.cursorCol = 4;
        this.cursorRow = 4;

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
                frames: this.anims.generateFrameNumbers('PyramidSolved', { start: 0, end: 28 }),
                frameRate: 10,
                repeat: 0
            });
        };

        this.cursor = this.add.sprite(
            this.cursorCol * 32,
            this.cursorRow * 32,
            'AnimatedCursor' 
        ).setDepth(CURSOR_DEPTH);
        this.cursor.play("AnimatedCursor", true);
        this.placeCursor();

        this.setupControls();

        this.fillPyramidRandomly();
        this.renderPyramid();

        this.moveTrackerText = this.add.bitmapText(10, 10, 'pixelFont', 'Moves: 0', 8);
        this.seedDisplayText = this.add.bitmapText(90, 210, 'pixelFont', `Seed#${this.seed}`, 8);

        this.renderGlyphMoveCounters();
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
                this.highlightAdjacentTiles(this.cursorRow, this.cursorCol); 
            } else {
                this.tileSwap();
                this.clearAdjHighlights(); 
            }
        } 

        if(Phaser.Input.Keyboard.JustDown(this.keys.B)) {
            if(this.selectedGlyph == null) {
                this.rotateRow();
            } else {
                this.selectedGlyph = null;
                this.selectedTile = null;
                this.clearAdjHighlights(); 
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
        const glyph = this.add.image(x, y, tile).setDepth(TILE_DEPTH);
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
        if(this.puzzleIsSolved){
            return;
        }
        
        if(this.areTilesAdjacent(this.selectedTile[0], this.selectedTile[1], this.cursorRow, this.cursorCol)){
            this.pyramidoku[this.selectedTile[0]][this.selectedTile[1]].destroy();
            this.pyramidoku[this.selectedTile[0]][this.selectedTile[1]] = null;

            const selectedGlyphKey = this.selectedGlyph.texture.key;
            this.glyphMoveCounts[selectedGlyphKey]++;
            this.updateGlyphMoveCountText(selectedGlyphKey);

            if(this.pyramidoku[this.cursorRow][this.cursorCol] != null){
                this.placeTile(this.selectedTile[1], this.selectedTile[0], this.pyramidoku[this.cursorRow][this.cursorCol].texture.key);
                this.pyramidoku[this.cursorRow][this.cursorCol].destroy();
                
                const targetGlyphKey = this.pyramidoku[this.cursorRow][this.cursorCol].texture.key;
                this.glyphMoveCounts[targetGlyphKey]++;
                this.updateGlyphMoveCountText(targetGlyphKey);
            }

            this.placeTile(this.cursorCol, this.cursorRow, this.selectedGlyph.texture.key);
            this.incrementMoveNumber();
        }
        this.selectedTile = null;
        this.selectedGlyph = null;
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
    
        // Shuffle the glyph pool using the seeded random generator
        for (let i = glyphPool.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
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
        // Check for adjacent matching glyphs
        for (let row = 0; row < this.pyramidoku.length; row++) {
            for (let col = 0; col < this.pyramidoku[row].length; col++) {
                const currentGlyph = this.pyramidoku[row][col];
                if (currentGlyph !== null) {
                    const currentGlyphKey = currentGlyph.texture.key;
    
                    const adjacentPositions = [
                        { row, col: col - 1 },
                        { row, col: col + 1 }, 
                    ];
    
                    if (col % 2 === 0) {
                        adjacentPositions.push({ row: row + 1, col: col + 1 });
                    }
    
                    if (col % 2 === 1 && row > 0) {
                        adjacentPositions.push({ row: row - 1, col: col - 1 });
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
    
        // Check glyph counts per row
        for (let row = 0; row < this.pyramidoku.length; row++) {
            const glyphCounts = {};
    
            for (let col = 0; col < this.pyramidoku[row].length; col++) {
                const glyph = this.pyramidoku[row][col];
                if (glyph !== null) {
                    const glyphKey = glyph.texture.key;
    
                    if (glyphCounts[glyphKey]) {
                        glyphCounts[glyphKey]++;
                    } else {
                        glyphCounts[glyphKey] = 1;
                    }
    
                    const maxAllowed = (row < 4) ? 1 : 2; // Rows 0-4: max 1, rows 5-7: max 2
                    if (glyphCounts[glyphKey] > maxAllowed) {
                        console.log(row);
                        return false; // Glyph count exceeds the limit
                    }
                }
            }
        }
        this.puzzleIsSolved = true;
        this.clearSolvedHighlights();
        this.pyramid.play("AnimatedPyramid", true);
        return true;
    }

    rotateRow() {
        if(this.puzzleIsSolved){
            return;
        }

        const lastIndex = this.pyramidoku[this.cursorRow].length - 1;
        const lastGlyph = this.pyramidoku[this.cursorRow][lastIndex];

         // Increment move count for all glyphs in the row
        for (let col = 0; col < this.pyramidoku[this.cursorRow].length; col++) {
            const glyph = this.pyramidoku[this.cursorRow][col];
            if (glyph !== null) {
                const glyphKey = glyph.texture.key;
                this.glyphMoveCounts[glyphKey]++;
                this.updateGlyphMoveCountText(glyphKey);
            }
        }

        for(let i = lastIndex; i > 0; i--) {
            this.pyramidoku[this.cursorRow][i].destroy();
            this.placeTile(i, this.cursorRow, this.pyramidoku[this.cursorRow][i - 1].texture.key);
        }

        this.pyramidoku[this.cursorRow][0].destroy();
        this.placeTile(0, this.cursorRow, lastGlyph.texture.key);
        
        this.incrementMoveNumber();
    }

    incrementMoveNumber() {
        this.numberOfMoves++;
        this.moveTrackerText.text = `Moves: ${this.numberOfMoves}`;
        this.checkPuzzleSolution();
        this.highlightSolvedRows(); 
    }

    highlightAdjacentTiles(row, col) {
        if(this.puzzleIsSolved){
            return;
        }
        this.clearAdjHighlights(); 
    
        const adjacentPositions = [
            { row, col: col - 1 }, // Left
            { row, col: col + 1 }, // Right
        ];

        let isEven = false;
        if (col % 2 === 0) {
            adjacentPositions.push({ row: row + 1, col: col + 1 }); // Below (for even columns)
            isEven = true;
        } else if (row > 0) {
            adjacentPositions.push({ row: row - 1, col: col - 1 }); // Above (for odd columns)
        }
    
        adjacentPositions.forEach(pos => {
            if (
                pos.row >= 0 &&
                pos.row < this.pyramidoku.length &&
                pos.col >= 0 &&
                pos.col < this.pyramidoku[pos.row].length
            ) {
                const x = 128 + (pos.col * 12) - (pos.row * 12);
                let y = 33 + (pos.row * 23);
                if (pos.col % 2 !== 0) {
                    y -= 6;
                }
                const highlight = this.add.image(x, y, 'adjTile').setDepth(ADJ_HIGHLIGHT_DEPTH);
                if(isEven){
                    highlight.scaleY = -1;
                    highlight.y += 6;
                }
                this.adjHighlights.push(highlight); 
            }
        });
    }

    clearAdjHighlights() {
        this.adjHighlights.forEach(highlight => highlight.destroy());
        this.adjHighlights = [];
    }

    highlightSolvedRows() {
        if(this.puzzleIsSolved){
            return;
        }
        this.clearSolvedHighlights(); 
    
        for (let row = 0; row < this.pyramidoku.length; row++) {
            if (this.isRowSolved(row)) {
                for (let col = 0; col < this.pyramidoku[row].length; col++) {
                    const x = 128 + (col * 12) - (row * 12);
                    let y = 33 + (row * 23);
                    if (col % 2 !== 0) {
                        y -= 6; 
                    }
    
                    const solvedHighlight = this.add.image(x, y, 'solvedTile').setDepth(SOLVED_HIGHLIGHT_DEPTH);
    
                    if (col % 2 != 0) {
                        solvedHighlight.scaleY = -1; 
                        solvedHighlight.y += 6; 
                    }
    
                    this.solvedHighlights.push(solvedHighlight); 
                }
            }
        }
    }

    isRowSolved(row) {
        const glyphCounts = {};
    
        // Check glyph counts in the row
        for (let col = 0; col < this.pyramidoku[row].length; col++) {
            const glyph = this.pyramidoku[row][col];
            if (glyph !== null) {
                const glyphKey = glyph.texture.key;
    
                if (glyphCounts[glyphKey]) {
                    glyphCounts[glyphKey]++;
                } else {
                    glyphCounts[glyphKey] = 1;
                }
    
                const maxAllowed = (row < 4) ? 1 : 2; // Rows 0-4: max 1, rows 5-7: max 2
                if (glyphCounts[glyphKey] > maxAllowed) {
                    return false; // Glyph count exceeds the limit
                }
            }
        }
    
        // Check for adjacent matching glyphs in the row
        for (let col = 0; col < this.pyramidoku[row].length; col++) {
            const currentGlyph = this.pyramidoku[row][col];
            if (currentGlyph !== null) {
                const currentGlyphKey = currentGlyph.texture.key;
    
                const adjacentPositions = [
                    { row, col: col - 1 },
                    { row, col: col + 1 },
                ];
    
                if (col % 2 === 0) {
                    adjacentPositions.push({ row: row + 1, col: col + 1 });
                }
    
                if (col % 2 === 1 && row > 0) {
                    adjacentPositions.push({ row: row - 1, col: col - 1 });
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
    
        return true; // Row passes all checks
    }

    clearSolvedHighlights() {
        this.solvedHighlights.forEach(highlight => {
            if (highlight.texture && highlight.texture.key === 'solvedTile') {
                highlight.destroy();
            }
        });
        this.solvedHighlights = this.solvedHighlights.filter(highlight => highlight.texture.key !== 'solvedTile');
    }

    renderGlyphMoveCounters() {
        const startX = 12; // X position for the counters
        const startY = 30;  // Y position for the counters
        const spacing = 18; // Vertical spacing between counters
    
        Object.entries(Hieroglyphs).forEach(([glyphName, glyphKey], index) => {
            // Render the glyph image
            const glyphImage = this.add.image(startX, startY + index * spacing, glyphKey);
    
            // Render the move count text
            const moveCountText = this.add.bitmapText(
                startX + 10, // Offset to the right of the glyph image
                startY + index * spacing - 5, // Align with the glyph image
                'pixelFont',
                `${this.glyphMoveCounts[glyphKey]}`,
                8
            );
    
            // Store the reference to the move count text
            this.glyphMoveCountTexts[glyphKey] = moveCountText;
        });
    }

    updateGlyphMoveCountText(glyphKey) {
        if (this.glyphMoveCountTexts[glyphKey]) {
            this.glyphMoveCountTexts[glyphKey].text = `${this.glyphMoveCounts[glyphKey]}`;
        }
    }
}

export default PuzzleScene;