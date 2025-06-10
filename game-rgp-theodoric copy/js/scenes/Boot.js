import { Scene } from 'phaser';

export default class Boot extends Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  init() {
    // Set device-specific settings
    this.scale.pageAlignHorizontally = true;
  }

  preload() {
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('preloaderBar', 'assets/images/preload-bar.png');
  }

  create() {
    this.scene.start('Preloader');
  }
}
