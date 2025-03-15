import Phaser from 'phaser';

const BACKGROUND_COLOR = "ac7c00"

class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PuzzleScene' });
  }

  preload() {
    this.load.image('PyramidBackground', 'assets/images/PyramidokuPuzzleBackground.png');
  }

  create() {
      this.add.image(128, 110, 'PyramidBackground');
      this.cameras.main.setBackgroundColor(BACKGROUND_COLOR);
  }

  update() {
  }
}

export default PuzzleScene;
