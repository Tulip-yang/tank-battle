class Bullet {
  constructor(tank) {
    const delta = DIR_DELTAS[tank.dir];
    this.dir = tank.dir;
    this.size = 6;
    this.speed = CONFIG.bulletSpeed;
    this.dead = false;
    this.owner = tank;
    this.x = tank.x + tank.size / 2 + delta.dx * (tank.size / 2);
    this.y = tank.y + tank.size / 2 + delta.dy * (tank.size / 2);
  }

  update(dt) {
    const delta = DIR_DELTAS[this.dir];
    this.x += delta.dx * this.speed * dt * 60;
    this.y += delta.dy * this.speed * dt * 60;

    if (
      this.x < 0 || this.x > CONFIG.canvasWidth ||
      this.y < 0 || this.y > CONFIG.canvasHeight
    ) {
      this.dead = true;
      return;
    }

    const col = Math.floor(this.x / CONFIG.gridSize);
    const row = Math.floor(this.y / CONFIG.gridSize);
    const tile = tileAt(col, row);
    if (tile === TILE_BRICK) {
      mapData[row][col] = TILE_EMPTY;
      this.dead = true;
    } else if (tile === TILE_STEEL) {
      this.dead = true;
    }
  }

  draw() {
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
