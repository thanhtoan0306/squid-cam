export function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0)
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
  );
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

export function isOnPath(x, y, path) {
  // Simple check if position is too close to path
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const distance = distanceToLineSegment(
      x,
      y,
      start.x,
      start.y,
      end.x,
      end.y
    );
    if (distance < 40) return true;
  }
  return false;
}

export function updateBullet(bullet, delta) {
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
