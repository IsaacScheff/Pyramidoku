export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel_font.png', 'assets/font/pixel.xml');
        this.load.image('logo', 'assets/images/PyramidokuFullLogo.png');
    }
    create() {    
        let playText = this.add.bitmapText(this.scale.width / 2, this.scale.height / 2 + 60, 'pixelFont', 'PRESS START', 8).setOrigin(0.5);
        this.time.addEvent({
            delay: 400, // milliseconds delay between toggles
            callback: () => {
                playText.visible = !playText.visible;  
            },
            loop: true
        });
        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.startKey.on('down', () => {
            this.scene.start('MainMenuScene');
        });

        this.add.bitmapText(this.scale.width / 2, 10, 'pixelFont', 'An Isaac Wolf Game', 8).setOrigin(0.5);
        this.add.bitmapText(this.scale.width / 2, 210, 'pixelFont', 'Music by Prestune', 8).setOrigin(0.5);

        this.logo = this.add.sprite(128, 100, 'logo');
    }
}