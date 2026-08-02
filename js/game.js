const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const HUD = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  enemies: document.getElementById("enemies"),
};

const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === "KeyR" && (gameOver || gameWin)) {
    location.reload();
  }
  if (e.code === "KeyP" || e.code === "Escape") {
    if (!gameOver && !gameWin) paused = !paused;
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

const bullets = [];

function findSafeSpawn() {
  const size = CONFIG.tankSize;
  const cols = Math.floor(CONFIG.canvasWidth / CONFIG.gridSize);
  const rows = Math.floor(CONFIG.canvasHeight / CONFIG.gridSize);
  const defaultX = CONFIG.canvasWidth / 2 - size / 2;
  const defaultY = CONFIG.canvasHeight - size * 2;
  const midC = cols / 2;

  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * CONFIG.gridSize;
      const y = r * CONFIG.gridSize;
      if (x + size > CONFIG.canvasWidth || y + size > CONFIG.canvasHeight) continue;
      const dist = Math.abs(c - midC) + Math.abs(y - defaultY) / CONFIG.gridSize;
      candidates.push({ x, y, dist });
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);

  for (const cand of candidates) {
    if (rectHitsWall(cand.x, cand.y, size, size)) continue;
    if (rectHitsTank(cand.x, cand.y, size, size, getAllTanks(), player)) continue;
    return cand;
  }
  return { x: defaultX, y: defaultY };
}

function resetPlayer() {
  const spawn = findSafeSpawn();
  player.x = spawn.x;
  player.y = spawn.y;
  player.dir = DIR_UP;
  player.cooldown = 0;
  invincible = CONFIG.playerRespawnInvincible;
}

const player = new Tank(
  CONFIG.canvasWidth / 2 - CONFIG.tankSize / 2,
  CONFIG.canvasHeight - CONFIG.tankSize * 2,
  CONFIG.playerSpeed,
  "#2e7d32",
  true
);

const enemyAI = new EnemyAI();

for (let i = 0; i < CONFIG.enemyCount; i++) {
  enemyAI.spawn();
}

function getAllTanks() {
  return [player, ...enemyAI.enemies];
}

let lastTime = 0;
let lives = CONFIG.playerStartLives;
let score = 0;
let invincible = 0;
let gameOver = false;
let gameWin = false;
let paused = false;

function update(dt) {
  if (gameOver || gameWin || paused) return;

  if (keys.ArrowUp || keys.KeyW) player.dir = DIR_UP;
  else if (keys.ArrowDown || keys.KeyS) player.dir = DIR_DOWN;
  else if (keys.ArrowLeft || keys.KeyA) player.dir = DIR_LEFT;
  else if (keys.ArrowRight || keys.KeyD) player.dir = DIR_RIGHT;

  if (
    keys.ArrowUp || keys.KeyW || keys.ArrowDown || keys.KeyS ||
    keys.ArrowLeft || keys.KeyA || keys.ArrowRight || keys.KeyD
  ) {
    player.move(player.dir, player.speed, getAllTanks());
  }

  if (keys.Space && player.canFire()) {
    bullets.push(new Bullet(player));
    player.cooldown = 0.25;
  }

  player.update(dt);
  enemyAI.update(dt, getAllTanks());

  if (invincible > 0) invincible -= dt;

  for (const bullet of bullets) {
    bullet.update(dt);
  }

  for (const bullet of bullets) {
    if (bullet.dead) continue;
    const bx = bullet.x - bullet.size / 2;
    const by = bullet.y - bullet.size / 2;

    if (bullet.owner.isPlayer) {
      for (let i = enemyAI.enemies.length - 1; i >= 0; i--) {
        const enemy = enemyAI.enemies[i];
        if (rectsOverlap(bx, by, bullet.size, bullet.size, enemy.x, enemy.y, enemy.size, enemy.size)) {
          bullet.dead = true;
          enemyAI.enemies.splice(i, 1);
          score += CONFIG.scorePerKill;
          break;
        }
      }
      if (enemyAI.enemies.length === 0) gameWin = true;
    } else {
      if (
        invincible <= 0 &&
        rectsOverlap(bx, by, bullet.size, bullet.size, player.x, player.y, player.size, player.size)
      ) {
        bullet.dead = true;
        lives--;
        if (lives <= 0) {
          gameOver = true;
        } else {
          resetPlayer();
        }
      }
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].dead) bullets.splice(i, 1);
  }

  HUD.score.textContent = score;
  HUD.lives.textContent = lives;
  HUD.enemies.textContent = enemyAI.enemies.length;
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  drawMap();

  if (invincible <= 0 || Math.floor(invincible * 10) % 2 === 0) {
    player.draw();
  }
  enemyAI.draw();
  for (const bullet of bullets) {
    bullet.draw();
  }

  if (gameOver || gameWin) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    ctx.fillStyle = gameWin ? "#4caf50" : "#f44336";
    ctx.font = "bold 48px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(gameWin ? "胜利！" : "游戏结束", CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 - 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Microsoft YaHei";
    ctx.fillText(
      window.matchMedia("(pointer: coarse)").matches ? "点开火按钮重新开始" : "按 R 重新开始",
      CONFIG.canvasWidth / 2,
      CONFIG.canvasHeight / 2 + 30
    );
  } else if (paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText("暂停", CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2);
  }
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
