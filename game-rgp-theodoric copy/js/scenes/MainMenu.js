import { Scene } from 'phaser';

export default class MainMenu extends Scene {
  constructor() {
    super({ key: 'MainMenu' });
    this.highestScore = 0;
  }

  init(data) {
    const score = data.score || 0;
    this.highestScore = Math.max(score, this.highestScore);
  }

  create() {
    // Background music
    this.music = this.sound.add('openingMusic', { loop: true });
    // this.music.play();

    // Scrolling background
    this.background = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      'tiles',
      92
    );
    this.background.setOrigin(0, 0);

    // Logo
    this.splash = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'logo'
    );
    this.splash.setOrigin(0.5);

    // High score text
    const scoreText = `High score: ${this.highestScore}`;
    this.score = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height - 50,
        scoreText,
        {
          font: '15px Arial',
          fill: '#fff',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Instructions
    const instructions =
      'Move: WASD Keys   Attack: Hold Left-Mouse Button   Spell: Spacebar';
    this.instructions = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height - 25,
        instructions,
        {
          font: '15px Arial',
          fill: '#fff',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Play button
    this.playButton = this.add
      .image(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        'playButton'
      )
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.startGame());
  }

  update() {
    // Scroll background
    this.background.tilePositionX += 0.5;
  }

  startGame() {
    this.music.stop();
    this.scene.start('Game');
  }
}
