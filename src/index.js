import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';
import PuzzleScene from './scenes/PuzzleScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  scene: [PuzzleScene, MainScene]
};

new Phaser.Game(config);
