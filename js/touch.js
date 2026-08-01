const controlButtons = document.querySelectorAll("#controls button[data-key]");
for (const btn of controlButtons) {
  const key = btn.dataset.key;
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[key] = true;
  }, { passive: false });
  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys[key] = false;
  }, { passive: false });
  btn.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    keys[key] = false;
  }, { passive: false });
}

const fireBtn = document.getElementById("btn-fire");
fireBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (gameOver || gameWin) {
    location.reload();
  } else {
    keys.Space = true;
  }
}, { passive: false });
fireBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  keys.Space = false;
}, { passive: false });
fireBtn.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  keys.Space = false;
}, { passive: false });

document.getElementById("btn-pause").addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (!gameOver && !gameWin) paused = !paused;
}, { passive: false });

const touchIndicator = document.getElementById("hint");
const isTouch = window.matchMedia("(pointer: coarse)").matches;
if (isTouch) {
  touchIndicator.textContent = "拖动左摇杆区域移动 · 点右侧按钮开火";
}
