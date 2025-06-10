import { Game as PhaserGame, AUTO, Scale } from 'phaser';
import Boot from './scenes/Boot';
import Preloader from './scenes/Preloader';
import MainMenu from './scenes/MainMenu';
import Game from './scenes/Game';

const config = {
  type: AUTO,
  width: 512,
  height: 384,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, Game],
};

window.game = new PhaserGame(config);
