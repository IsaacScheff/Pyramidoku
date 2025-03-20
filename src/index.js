import Phaser from 'phaser';
import TitleScene from './scenes/TitleScene.js';
import PuzzleScene from './scenes/PuzzleScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 224,
  zoom: 3,  
  scene: [TitleScene, MainMenuScene, PuzzleScene]
};

new Phaser.Game(config);
