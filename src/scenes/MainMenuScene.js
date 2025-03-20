export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.inputSeed = 0; 
        this.isEditingSeed = false; 
        this.currentDigitIndex = 0;
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel_font.png', 'assets/font/pixel.xml');
    }

    create() {
        this.add.bitmapText(70, 40, 'pixelFont', '~MENU TEXT HERE~', 8);

        this.options = [
            this.add.bitmapText(40, 80, 'pixelFont', 'Pre-Made Puzzle', 8),
            this.add.bitmapText(40, 105, 'pixelFont', 'Random Puzzle', 8),
            this.add.bitmapText(40, 130, 'pixelFont', 'Input Seed', 8),
        ];

        this.selector = this.add.bitmapText(30, 80, 'pixelFont', '>', 8);
        this.selectedIndex = 0;

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); 
        this.cursors = this.input.keyboard.createCursorKeys();

        this.seedText = this.add.bitmapText(50, 155, 'pixelFont', '0000', 8);
        this.seedUnderline = this.add.bitmapText(50, 160, 'pixelFont', '____', 8);
        this.cursor = this.add.bitmapText(50, 170, 'pixelFont', '^', 8);
        this.setSeedUIVisibility(false); // Hide seed UI initially
    }

    update() {
        if (this.isEditingSeed) {
            this.handleSeedEditing();
        } else {
            this.handleMenuNavigation();
        }
    }

    handleMenuNavigation() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.moveSelection(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.moveSelection(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
            this.confirmSelection();
        }
    }

    handleSeedEditing() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.updateDigit(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.updateDigit(-1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
            this.moveCursor(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
            this.moveCursor(1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
            this.confirmSeed();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyH)) {
            this.exitSeedEditing();
        }
    }

    moveSelection(direction) {
        this.selectedIndex += direction;
        if (this.selectedIndex < 0) this.selectedIndex = this.options.length - 1;
        else if (this.selectedIndex >= this.options.length) this.selectedIndex = 0;

        this.selector.setY(this.options[this.selectedIndex].y);
    }

    confirmSelection() {
        const selectedOption = this.options[this.selectedIndex].text;
        switch (selectedOption) {
            case "Pre-Made Puzzle":
                this.scene.start('PuzzleScene');
                break;
            case "Random Puzzle":
                const randomSeed = this.generateRandomSeed();
                this.scene.start('PuzzleScene', { seed: randomSeed });
                break;
            case "Input Seed":
                this.inputSeedUI();
                break;
        }
    }

    generateRandomSeed() {
        // Generate a random 4-digit number (1000 to 9999)
        return Math.floor(1000 + Math.random() * 9000);
    }

    inputSeedUI() {
        this.isEditingSeed = true; 
        this.setSeedUIVisibility(true); 
        this.updateSeedDisplay(); 
    }

    updateDigit(amount) {
        const currentDigit = parseInt(this.seedText.text[this.currentDigitIndex], 10);
        let newDigit = currentDigit + amount;

        if (newDigit < 0) newDigit = 9;
        else if (newDigit > 9) newDigit = 0;

        const seedArray = this.seedText.text.split('');
        seedArray[this.currentDigitIndex] = newDigit.toString();
        this.seedText.setText(seedArray.join(''));

        this.inputSeed = parseInt(this.seedText.text, 10);
    }

    moveCursor(direction) {
        this.currentDigitIndex += direction;
        if (this.currentDigitIndex < 0) this.currentDigitIndex = 3;
        else if (this.currentDigitIndex > 3) this.currentDigitIndex = 0;

        this.cursor.setX(50 + (this.currentDigitIndex * 8));
    }

    confirmSeed() {
        this.isEditingSeed = false; 
        this.setSeedUIVisibility(false);
        this.scene.start('PuzzleScene', { seed: this.inputSeed });
    }

    exitSeedEditing() {
        this.isEditingSeed = false; 
        this.setSeedUIVisibility(false); 
    }

    updateSeedDisplay() {
        // Ensure the seed is displayed as a 4-digit number
        const seedString = this.inputSeed.toString().padStart(4, '0');
        this.seedText.setText(seedString);
    }

    setSeedUIVisibility(visible) {
        this.seedText.setVisible(visible);
        this.seedUnderline.setVisible(visible);
        this.cursor.setVisible(visible);
    }
}