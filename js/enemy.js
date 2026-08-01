const ENEMY_SPAWN_COLS = [1, 5, 9, 13, 17];

class EnemyAI {
  constructor() {
    this.enemies = [];
    this.thinkTimer = 0;
  }

  spawn() {
    const occupied = new Set(
      this.enemies.map((e) => Math.floor(e.x / CONFIG.gridSize))
    );
    const free = ENEMY_SPAWN_COLS.filter((c) => !occupied.has(c));
    if (free.length === 0) return;
    const col = free[Math.floor(Math.random() * free.length)];
    const x = col * CONFIG.gridSize;
    const y = 0;
    const tank = new Tank(x, y, CONFIG.enemySpeed, "#b71c1c");
    tank.dir = DIR_DOWN;
    this.enemies.push(tank);
  }

  update(dt, obstacles = []) {
    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) {
      this.thinkTimer = 0.5 + Math.random() * 1.5;
      for (const enemy of this.enemies) {
        if (Math.random() < 0.5) {
          const dirs = [DIR_UP, DIR_RIGHT, DIR_DOWN, DIR_LEFT].filter((d) => d !== enemy.dir);
          enemy.dir = dirs[Math.floor(Math.random() * dirs.length)];
        }
        if (Math.random() < 0.3 && enemy.canFire()) {
          bullets.push(new Bullet(enemy));
          enemy.cooldown = 1;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.move(enemy.dir, enemy.speed, obstacles)) {
        const dirs = [DIR_UP, DIR_RIGHT, DIR_DOWN, DIR_LEFT];
        enemy.dir = dirs[Math.floor(Math.random() * dirs.length)];
      }
      enemy.update(dt);
    }
  }

  draw() {
    for (const enemy of this.enemies) {
      enemy.draw();
    }
  }
}
