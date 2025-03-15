import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 240,
  scene: [MainScene]
};

new Phaser.Game(config);
