const TILE_EMPTY = 0;
const TILE_BRICK = 1;
const TILE_STEEL = 2;

const mapData = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function tileAt(col, row) {
  if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) {
    return TILE_STEEL;
  }
  return mapData[row][col];
}

function rectHitsWall(x, y, w, h) {
  const left = x;
  const right = x + w - 1;
  const top = y;
  const bottom = y + h - 1;
  const c1 = Math.floor(left / CONFIG.gridSize);
  const c2 = Math.floor(right / CONFIG.gridSize);
  const r1 = Math.floor(top / CONFIG.gridSize);
  const r2 = Math.floor(bottom / CONFIG.gridSize);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (tileAt(c, r) !== TILE_EMPTY) return true;
    }
  }
  return false;
}

function drawMap() {
  for (let row = 0; row < mapData.length; row++) {
    for (let col = 0; col < mapData[row].length; col++) {
      const tile = mapData[row][col];
      if (tile === TILE_EMPTY) continue;

      const x = col * CONFIG.gridSize;
      const y = row * CONFIG.gridSize;

      if (tile === TILE_BRICK) {
        ctx.fillStyle = "#b5651d";
        ctx.fillRect(x, y, CONFIG.gridSize, CONFIG.gridSize);
        ctx.strokeStyle = "#7a3d0e";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, CONFIG.gridSize - 2, CONFIG.gridSize - 2);
      } else if (tile === TILE_STEEL) {
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(x, y, CONFIG.gridSize, CONFIG.gridSize);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 6, y + 6, CONFIG.gridSize - 12, CONFIG.gridSize - 12);
      }
    }
  }
}
