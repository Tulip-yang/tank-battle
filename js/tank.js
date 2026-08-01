const DIR_UP = 0;
const DIR_RIGHT = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;

const DIR_DELTAS = {
  [DIR_UP]: { dx: 0, dy: -1 },
  [DIR_RIGHT]: { dx: 1, dy: 0 },
  [DIR_DOWN]: { dx: 0, dy: 1 },
  [DIR_LEFT]: { dx: -1, dy: 0 },
};

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
}

function rectHitsTank(x, y, w, h, tanks, exclude) {
  for (const tank of tanks) {
    if (tank === exclude) continue;
    if (rectsOverlap(x, y, w, h, tank.x, tank.y, tank.size, tank.size)) return true;
  }
  return false;
}

class Tank {
  constructor(x, y, speed, color, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.dir = DIR_UP;
    this.speed = speed;
    this.color = color;
    this.isPlayer = isPlayer;
    this.cooldown = 0;
    this.size = CONFIG.tankSize;
  }

  move(dir, distance, obstacles = []) {
    const delta = DIR_DELTAS[dir];
    const nx = this.x + delta.dx * distance;
    const ny = this.y + delta.dy * distance;
    if (rectHitsWall(nx, ny, this.size, this.size)) return false;
    if (rectHitsTank(nx, ny, this.size, this.size, obstacles, this)) return false;
    this.x = Math.max(0, Math.min(CONFIG.canvasWidth - this.size, nx));
    this.y = Math.max(0, Math.min(CONFIG.canvasHeight - this.size, ny));
    return true;
  }

  canFire() {
    return this.cooldown <= 0;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  draw() {
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    ctx.fillStyle = this.isPlayer ? "#ffd700" : "#dddddd";
    ctx.fillRect(cx - 4, cy - 4, 8, 8);

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let tx = cx;
    let ty = cy;
    if (this.dir === DIR_UP) ty = this.y;
    else if (this.dir === DIR_DOWN) ty = this.y + this.size;
    else if (this.dir === DIR_LEFT) tx = this.x;
    else tx = this.x + this.size;
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }
}
