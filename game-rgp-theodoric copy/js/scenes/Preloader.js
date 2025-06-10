import { Scene } from 'phaser';

export default class Preloader extends Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
    // Add loading splash screen
    this.splash = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'logo'
    );
    this.splash.setOrigin(0.5);

    this.preloadBar = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 128,
      'preloaderBar'
    );
    this.preloadBar.setOrigin(0.5);

    // Set up loading bar
    this.load.on('progress', (value) => {
      this.preloadBar.setScale(value, 1);
    });

    // Load game assets
    this.load.image('playButton', 'assets/images/play.png');
    this.load.image('flame', 'assets/images/flame.png');
    this.load.image('sword', 'assets/images/sword.png');
    this.load.image('levelParticle', 'assets/images/level-particle.png');
    this.load.image('spellParticle', 'assets/images/spell-particle.png');

    this.load.spritesheet('tiles', 'assets/images/tiles.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('things', 'assets/images/things.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('characters', 'assets/images/characters.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('dead', 'assets/images/dead.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('potions', 'assets/images/potions.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('dragons', 'assets/images/dragons.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('fireball', 'assets/images/fireball.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('spell', 'assets/images/spell.png', {
      frameWidth: 12,
      frameHeight: 12,
    });

    // Load audio
    this.load.audio('openingMusic', 'assets/sound/opening.ogg');
    this.load.audio('overworldMusic', 'assets/sound/overworld.ogg');
    this.load.audio('attackSound', 'assets/sound/attack.wav');
    this.load.audio('playerSound', 'assets/sound/player.wav');
    this.load.audio('skeletonSound', 'assets/sound/skeleton.wav');
    this.load.audio('slimeSound', 'assets/sound/slime.wav');
    this.load.audio('batSound', 'assets/sound/bat.wav');
    this.load.audio('ghostSound', 'assets/sound/ghost.wav');
    this.load.audio('spiderSound', 'assets/sound/spider.wav');
    this.load.audio('goldSound', 'assets/sound/gold.wav');
    this.load.audio('potionSound', 'assets/sound/potion.ogg');
    this.load.audio('levelSound', 'assets/sound/level.ogg');
    this.load.audio('fireballSound', 'assets/sound/fireball.wav');
    this.load.audio('dragonSound', 'assets/sound/dragon.wav');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
