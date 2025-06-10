import { Scene } from 'phaser';

export const userPhotoProfile =
  'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/a53c43cafaaf23ac1e2132165016b1e8~tplv-tiktokx-cropcenter:100:100.webp?dr=14579&refresh_token=a89fb2e8&x-expires=1749654000&x-signature=Oj7pj%2FLBKeokNs2V9z58%2BgWNLb8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=fdd36af4&idc=my2';

export default class Game extends Scene {
  constructor() {
    super({ key: 'Game' });
  }

  create() {
    // World setup
    const worldSize = 1920;
    this.physics.world.setBounds(0, 0, worldSize, worldSize);

    this.background = this.add
      .tileSprite(0, 0, worldSize, worldSize, 'tiles', 65)
      .setOrigin(0)
      .setScale(2);

    this.generateGrid(worldSize);

    // Game state
    this.notification = '';
    this.spellCooldown = 0;
    this.gold = 0;
    this.xp = 0;
    this.xpToNext = 20;
    this.goldForBoss = 5000;
    this.bossSpawned = false;
    this.bossColorIndex = 0;

    // Create groups with physics
    this.corpses = this.add.group();
    this.enemies = this.physics.add.group();
    this.bosses = this.physics.add.group();
    this.collectables = this.physics.add.group();

    // Generate game objects
    this.generateObstacles();
    this.generateCollectables();
    this.player = this.generatePlayer();

    // Camera follow
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);

    // Create attack groups
    this.playerAttacks = this.generateAttacks('sword', 1);
    this.playerSpells = this.generateAttacks('spell', 1);
    this.bossAttacks = this.generateAttacks('spellParticle', 5, 2000, 300);

    // Generate enemies after player
    this.generateEnemies(100);

    // Setup audio
    this.setupAudio();

    // Setup controls
    this.setupControls();

    // UI
    this.createUI();
  }

  update() {
    if (!this.player.active) return;

    this.playerHandler();
    this.enemyHandler();
    this.bossHandler();
    this.updateUI();

    // Update collisions
    this.physics.collide(this.player, this.enemies, this.hit, null, this);
    this.physics.collide(this.player, this.bosses, this.hit, null, this);
    this.physics.collide(this.player, this.bossAttacks, this.hit, null, this);
    this.physics.collide(
      this.enemies,
      this.playerAttacks,
      this.hit,
      null,
      this
    );
    this.physics.collide(this.bosses, this.playerAttacks, this.hit, null, this);
  }

  setupControls() {
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      spell: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  createUI() {
    const style = { font: '16px Arial', fill: '#fff' };
    this.healthLabel = this.add.text(10, 10, '', style).setScrollFactor(0);
    this.goldLabel = this.add.text(10, 30, '', style).setScrollFactor(0);
    this.xpLabel = this.add.text(10, 50, '', style).setScrollFactor(0);
    this.notificationLabel = this.add
      .text(10, 70, '', style)
      .setScrollFactor(0);
  }

  updateUI() {
    this.healthLabel.setText(
      `Health: ${this.player.health} / ${this.player.vitality}`
    );
    this.goldLabel.setText(`Gold: ${this.gold}`);
    this.xpLabel.setText(
      `Level ${this.player.level} - XP: ${this.xp} / ${this.xpToNext}`
    );
    this.notificationLabel.setText(this.notification);
  }

  // ... existing helper methods converted to ES6 class methods ...
  // Note: Remove 'function' keyword and 'prototype' assignments
}
