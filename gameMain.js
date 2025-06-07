/* global Phaser */
import { isOnPath } from './components/logic.js';
import { updateHealthBar } from './components/enemy.js';
const { ipcRenderer } = window.require('electron');
console.log('run js');

// Game variables
let gameState = {
  health: 100,
  gold: 100, // You can keep this if you want to display gold, but it won't be limited
  wave: 1,
  enemies: [],
  towers: [],
  bullets: [],
  // Remove enemySpawnTimer, waveEnemyCount, enemiesSpawned
  gameOver: false,
};

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 700,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};

const CELL_SIZE = 70; // 700px / 10 cells = 70px per cell

// Path for enemies to follow (adjusted for 500x500)
const path = [
  { x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 2 * CELL_SIZE + CELL_SIZE / 2 }, // (0,2)
  { x: 2 * CELL_SIZE + CELL_SIZE / 2, y: 2 * CELL_SIZE + CELL_SIZE / 2 }, // (2,2)
  { x: 2 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 }, // (2,1)
  { x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 }, // (5,1)
  { x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 }, // (5,7)
  { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 }, // (8,7)
  { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 }, // (8,1)
  { x: 9 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 }, // (9,1)
];

function preload() {
  // Create simple colored rectangles as sprites
  // this.add
  //   .graphics()
  //   .fillStyle(0x8b4513)
  //   .fillRect(0, 0, CELL_SIZE, CELL_SIZE)
  //   .generateTexture("tower", CELL_SIZE, CELL_SIZE);

  // Load the new tower image

  this.add
    .graphics()
    .fillStyle(0xff0000)
    .fillCircle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2)
    .generateTexture('enemy', CELL_SIZE, CELL_SIZE);

  this.add
    .graphics()
    .fillStyle(0xffffff)
    .fillCircle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 4)
    .generateTexture('bullet', CELL_SIZE / 2, CELL_SIZE / 2);

  this.add
    .graphics()
    .fillStyle(0x654321)
    .fillRect(0, 0, CELL_SIZE, CELL_SIZE)
    .generateTexture('grass', CELL_SIZE, CELL_SIZE);

  this.load.image('ice_enemy', 'public/assets/enemy1.png'); // Add this line
  this.load.image('tower', 'public/assets/tower2.png');
}

function create() {
  this.scene = this;

  // Create background grid (10x10)
  for (let x = 0; x < config.width; x += CELL_SIZE) {
    for (let y = 0; y < config.height; y += CELL_SIZE) {
      this.add.image(x, y, 'grass').setOrigin(0, 0).setAlpha(0.3);
    }
  }

  // Draw path
  const graphics = this.add.graphics();
  graphics.lineStyle(CELL_SIZE, 0x90ee90); // Path width is now CELL_SIZE (70px)
  graphics.beginPath();
  graphics.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    graphics.lineTo(path[i].x, path[i].y);
  }
  graphics.strokePath();
  // Groups for game objects
  this.enemies = this.add.group();
  this.towers = this.add.group();
  this.bullets = this.add.group();

  // Click handler for placing towers (snap to grid)
  this.input.on('pointerdown', (pointer) => {
    if (gameState.gameOver) return;

    // Snap to grid cell center
    const cellX = Math.floor(pointer.x / CELL_SIZE);
    const cellY = Math.floor(pointer.y / CELL_SIZE);
    const x = cellX * CELL_SIZE + CELL_SIZE / 2;
    const y = cellY * CELL_SIZE + CELL_SIZE / 2;

    if (!getTowerAt(x, y) && !isOnPath(x, y, path)) {
      createTower(this, x, y);
    }
  });
}

function update(time, delta) {
  if (gameState.gameOver) return;

  // Update enemies
  this.enemies.children.entries.forEach((enemy) => {
    updateEnemy(enemy, delta);
  });

  // Update bullets
  this.bullets.children.entries.forEach((bullet) => {
    updateBullet(bullet, delta);
  });

  // Update towers (shooting)
  this.towers.children.entries.forEach((tower) => {
    updateTower(this, tower, time);
  });

  // Remove wave completion check
  // if (
  //   gameState.enemiesSpawned >= gameState.waveEnemyCount &&
  //   this.enemies.children.size === 0
  // ) {
  //   nextWave();
  // }
}

function spawnEnemy(username, photoUrl) {
  if (gameState.gameOver) return; // Only limit by game over

  const enemy = this.enemies.create(path[0].x, path[0].y, 'ice_enemy');
  enemy.pathIndex = 0;
  enemy.pathProgress = 0;
  enemy.health = 50 + (gameState.wave - 1) * 10;
  enemy.maxHealth = enemy.health;
  enemy.speed = 50 + (gameState.wave - 1) * 5;
  enemy.value = 20;

  // Store TikTok username and photo
  enemy.tiktokUser = username || '';
  enemy.tiktokPhoto = photoUrl || '';

  // Health bar
  enemy.healthBar = this.add.graphics();

  // Add username text above enemy
  if (username) {
    enemy.usernameText = this.add
      .text(enemy.x, enemy.y - 40, username, {
        fontSize: '14px',
        fill: '#fff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setOrigin(0.5);
  }

  // Replace enemy sprite with photo if photoUrl exists
  if (photoUrl) {
    const userAvatarKey = 'enemyPhoto_' + Date.now() + Math.random(); // Use a unique key for each photo
    if (!this.textures.exists(userAvatarKey)) {
      this.load.image(userAvatarKey, photoUrl);
      this.load.once('complete', () => {
        // Remove the old sprite if it exists
        if (enemy.photoImage) enemy.photoImage.destroy();
        // Add the base ice_enemy sprite
        enemy.baseSprite = this.add
          .image(enemy.x, enemy.y, 'ice_enemy')
          .setDisplaySize(CELL_SIZE, CELL_SIZE)
          .setOrigin(0.5);
        // Add the photo overlay on top
        enemy.photoImage = this.add
          .image(enemy.x, enemy.y, userAvatarKey)
          .setDisplaySize(CELL_SIZE, CELL_SIZE)
          .setOrigin(0.5);
        // Hide the default enemy sprite (if any)
        enemy.setVisible(false);
      });
      this.load.start();
    } else {
      if (enemy.photoImage) enemy.photoImage.destroy();
      enemy.baseSprite = this.add
        .image(enemy.x, enemy.y, 'ice_enemy')
        .setDisplaySize(CELL_SIZE, CELL_SIZE)
        .setOrigin(0.5);
      enemy.photoImage = this.add
        .image(enemy.x, enemy.y, userAvatarKey)
        .setDisplaySize(CELL_SIZE, CELL_SIZE)
        .setOrigin(0.5);
      enemy.setVisible(false);
    }
  } else {
    // If no photo, fallback to default enemy sprite
    enemy.setTexture('enemy');
  }

  // Remove enemiesSpawned increment
  // gameState.enemiesSpawned++;
}

// In updateEnemy, update the photo position instead of the sprite:
function updateEnemy(enemy, delta) {
  if (!enemy.active) return;

  const currentPoint = path[enemy.pathIndex];
  const nextPoint = path[enemy.pathIndex + 1];

  if (!nextPoint) {
    if (enemy.usernameText) enemy.usernameText.destroy();
    if (enemy.photoImage) enemy.photoImage.destroy();
    enemy.healthBar.destroy();
    enemy.destroy();
    gameState.health -= 10;
    if (gameState.health <= 0) {
      gameOver();
    }
    return;
  }

  // Move towards next point
  const dx = nextPoint.x - currentPoint.x;
  const dy = nextPoint.y - currentPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  enemy.pathProgress += (enemy.speed * delta) / 1000;

  if (enemy.pathProgress >= distance) {
    enemy.pathIndex++;
    enemy.pathProgress = 0;
  }

  // Update position
  const progress = enemy.pathProgress / distance;
  enemy.x = currentPoint.x + dx * progress;
  enemy.y = currentPoint.y + dy * progress;

  // Update health bar
  updateHealthBar(enemy);

  // Update username text and photo position
  if (enemy.usernameText) {
    enemy.usernameText.x = enemy.x;
    enemy.usernameText.y = enemy.y - 40;
  }
  if (enemy.photoImage) {
    enemy.photoImage.x = enemy.x;
    enemy.photoImage.y = enemy.y;
  }
}

function createTower(scene, x, y) {
  const tower = scene.towers.create(x, y, 'tower');
  tower.setDisplaySize(CELL_SIZE, CELL_SIZE);
  tower.range = 100;
  tower.damage = 25;
  tower.fireRate = 500; // milliseconds
  tower.lastFired = 0;
}

function updateTower(scene, tower, time) {
  if (time - tower.lastFired < tower.fireRate) return;

  // Find nearest enemy in range
  let nearestEnemy = null;
  let nearestDistance = Infinity;

  scene.enemies.children.entries.forEach((enemy) => {
    const distance = Phaser.Math.Distance.Between(
      tower.x,
      tower.y,
      enemy.x,
      enemy.y
    );
    if (distance <= tower.range && distance < nearestDistance) {
      nearestEnemy = enemy;
      nearestDistance = distance;
    }
  });

  if (nearestEnemy) {
    createBullet(
      scene,
      tower.x,
      tower.y,
      nearestEnemy.x,
      nearestEnemy.y,
      tower.damage
    );
    tower.lastFired = time;
  }
}

function createBullet(scene, startX, startY, targetX, targetY, damage) {
  const bullet = scene.bullets.create(startX, startY, 'bullet');

  const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
  bullet.speed = 300;
  bullet.damage = damage;
  bullet.velocityX = Math.cos(angle) * bullet.speed;
  bullet.velocityY = Math.sin(angle) * bullet.speed;
}

function updateBullet(bullet, delta) {
  if (!bullet.active) return;

  bullet.x += (bullet.velocityX * delta) / 1000;
  bullet.y += (bullet.velocityY * delta) / 1000;

  // Check collision with enemies
  const scene = bullet.scene;
  scene.enemies.children.entries.forEach((enemy) => {
    if (
      Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 20
    ) {
      // Hit enemy
      enemy.health -= bullet.damage;
      bullet.destroy();

      if (enemy.health <= 0) {
        // Enemy died
        gameState.gold += enemy.value;
        enemy.healthBar.destroy();
        // Clear photo and name if exist
        if (enemy.usernameText) enemy.usernameText.destroy();
        if (enemy.photoImage) enemy.photoImage.destroy();
        enemy.destroy();
      }
    }
  });

  // Remove bullets that go off screen
  if (
    bullet.x < 0 ||
    bullet.x > config.width ||
    bullet.y < 0 ||
    bullet.y > config.height
  ) {
    bullet.destroy();
  }
}

function getTowerAt(x, y) {
  return gameState.towers.find(
    (tower) => Math.abs(tower.x - x) < 32 && Math.abs(tower.y - y) < 32
  );
}

function gameOver() {
  gameState.gameOver = true;
}

// Start the game
const game = new Phaser.Game(config);

let gridGraphics = null;
let gridVisible = false;

try {
  // TikTok chat integration
  ipcRenderer.on('tiktok-chat', (event, data) => {
    console.log('screen2', data);
    if (!gameState.gameOver) {
      const scene = game.scene.scenes[0];
      const photoUrl = typeof data.photo === 'string' ? data.photo : '';
      spawnEnemy.call(scene, data.user, photoUrl);
    }
  });

  ipcRenderer.on('clear-all-towers', () => {
    const scene = game.scene.scenes[0];
    scene.towers.clear(true, true); // Remove all tower sprites
    // If you keep a gameState.towers array, clear it too:
    if (gameState.towers) gameState.towers = [];
  });

  // Grid toggle integration
  ipcRenderer.on('toggle-grid', () => {
    console.log('Toggle grid received');

    const scene = game.scene.scenes[0];
    if (!gridGraphics) {
      gridGraphics = scene.add.graphics();
    }
    gridGraphics.clear();
    gridVisible = !gridVisible;
    if (gridVisible) {
      gridGraphics.lineStyle(1, 0x00ffff, 0.3);
      const cellW = config.width / 10;
      const cellH = config.height / 10;
      for (let i = 1; i < 10; i++) {
        // Vertical lines
        gridGraphics.lineBetween(i * cellW, 0, i * cellW, config.height);
        // Horizontal lines
        gridGraphics.lineBetween(0, i * cellH, config.width, i * cellH);
      }
    }
  });
} catch (e) {
  console.log(e);

  // Not running in Electron, ignore
}
