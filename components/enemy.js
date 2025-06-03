export function updateHealthBar(enemy) {
  enemy.healthBar.clear();

  const barWidth = 30;
  const barHeight = 4;
  const healthPercent = enemy.health / enemy.maxHealth;

  // Background
  enemy.healthBar.fillStyle(0x000000);
  enemy.healthBar.fillRect(
    enemy.x - barWidth / 2,
    enemy.y - 20,
    barWidth,
    barHeight
  );

  // Health
  enemy.healthBar.fillStyle(
    healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000
  );
  enemy.healthBar.fillRect(
    enemy.x - barWidth / 2,
    enemy.y - 20,
    barWidth * healthPercent,
    barHeight
  );
}
