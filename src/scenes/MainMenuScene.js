export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
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
        ]

        this.selector = this.add.bitmapText(30, 80, 'pixelFont', '>', 8);
        this.selectedIndex = 0;

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keyW)) {
            this.moveSelection(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keyS)) {
            this.moveSelection(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
            this.confirmSelection();
        }

        if (this.gamepad) {
            this.handleGamepadInput(12, 'up');
            this.handleGamepadInput(13, 'down');

            this.handleGamepadInput(1, 'A');
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
        switch(selectedOption) {
            case "Pre-Made Puzzle":
                this.scene.start('PuzzleScene');
                break;
            case "Random Seed":
                const randomSeed = this.generateRandomSeed();
                this.scene.start('PuzzleScene', { seed: randomSeed }); 
                break;
            case "Input Seed":
                // display input interface
                break;
        }
    }

    generateRandomSeed() {
        // Generate a random 4-digit number (1000 to 9999)
        return Math.floor(1000 + Math.random() * 9000);
    }
}
