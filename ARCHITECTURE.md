# 坦克大战 架构文档

> 本文档面向后期维护者：说明系统如何运转、各模块职责、数据流、常见改动怎么做。

## 1. 技术栈

| 项 | 说明 |
|----|------|
| 语言 | 原生 JavaScript（ES6+，无框架、无构建工具） |
| 渲染 | HTML5 Canvas 2D |
| 界面 | HTML + CSS（含移动端虚拟按键） |
| 运行方式 | 纯静态页面，浏览器直接打开 `index.html`，或部署到 GitHub Pages |

## 2. 文件结构与职责

```
tank-battle/
├── index.html      页面入口：DOM 结构、脚本加载顺序（有严格依赖）
├── css/style.css   页面样式 + 移动端触屏按键布局
├── README.md       用户使用说明
└── js/
    ├── config.js   所有游戏参数（速度/尺寸/数量），改难度只动这里
    ├── map.js      地图数据（二维数组）+ 地图绘制 + 地形碰撞检测
    ├── tank.js     通用坦克类 Tank + 坦克碰撞检测辅助
    ├── bullet.js   子弹类 Bullet
    ├── enemy.js    敌方 AI：出生、思考决策、调用 Tank 能力
    ├── game.js     主循环、键盘输入、碰撞判定、计分、游戏状态机
    └── touch.js    移动端虚拟按键 → 映射到键盘输入系统
```

### 脚本加载顺序（重要）
`index.html` 中 `<script>` 必须按此顺序，因为后面的脚本依赖前面的全局定义：

```
config.js → map.js → tank.js → bullet.js → enemy.js → game.js → touch.js
```

所有文件共享一个全局作用域（普通 script 标签，非模块），全局暴露的关键对象：
- `CONFIG`（config.js）
- `Tank` / `Bullet` / `EnemyAI` 类
- `mapData`、`drawMap`、`rectHitsWall`（map.js）
- `bullets` 数组、`player`、`enemyAI`、`keys`、`paused`、`gameOver`、`gameWin`（game.js）

## 3. 核心架构概念

### 3.1 游戏主循环（game.js:166）
```
requestAnimationFrame(loop)
  loop:
    dt = 本帧时间差（秒，封顶 0.05 防止切后台跳变）
    update(dt)   → 改数据（输入、移动、碰撞、计分、状态）
    draw()       → 读数据画画面
```
**原则：update 只改数据，draw 只读数据。** 调试时先看 update 有没有改错，再看 draw 有没有画错。

### 3.2 数据与表现分离
- `mapData` 是"真相"：砖墙被子弹打中时 `mapData[row][col] = TILE_EMPTY`，绘制永远读数组
- 想自定义地图：直接改 `map.js` 里的 `mapData` 二维数组（0=空地 1=砖墙 2=钢墙）

### 3.3 坦克类复用（tank.js）
`Tank` 同时被玩家和敌人使用，区别仅靠构造参数：
- 玩家：`new Tank(x, y, CONFIG.playerSpeed, "#2e7d32", true)`
- 敌人：`new Tank(x, y, CONFIG.enemySpeed, "#b71c1c")`（第5参省略=false）
`Tank.move()` 内置"先试再走"碰撞检测，撞墙或撞坦克返回 `false`。

### 3.4 输入系统（键盘与触屏统一）
- 键盘（game.js）：keydown/keyup 维护 `keys` 对象，`keys.ArrowUp` 等为 bool
- 触屏（touch.js）：虚拟按键按下/松开时直接读写同一个 `keys` 对象
- 游戏逻辑只读 `keys`，不知道输入来自键盘还是触屏 → 新增输入方式不影响游戏逻辑

### 3.5 碰撞检测层级
1. **坦克 vs 地图**：`rectHitsWall`（map.js）——移动前检查目标矩形覆盖的格子
2. **坦克 vs 坦克**：`rectHitsTank`（tank.js）——`getAllTanks()` 提供全场坦克列表
3. **子弹 vs 地图**：`Bullet.update` 内——砖墙打碎（改 mapData），钢墙穿不过
4. **子弹 vs 坦克**：game.js:92 起——按 `bullet.owner.isPlayer` 分流，我方子弹打敌人、敌方子弹打我

### 3.6 游戏状态机（game.js）
```
运行中 → 玩家生命归零 → gameOver = true
运行中 → 敌人全灭     → gameWin  = true
任意态  → 按 P/Esc    → paused 切换
gameOver/gameWin 时按 R（或触屏开火键）→ location.reload()
```
`update()` 开头 `if (gameOver || gameWin || paused) return;` 冻结逻辑，`draw()` 末尾画覆盖层。

## 4. 计时与参数约定

- **所有时间单位统一为"秒"**：`dt` 是秒，冷却 `cooldown`、无敌 `invincible` 都以秒递减
  - ⚠️ 历史教训：冷却曾被误设成帧数值 15（单位混乱），导致只能射击一次
- 游戏参数全部在 `config.js`，改游戏难度 = 改这一个文件

## 5. 常见改动指南

| 需求 | 改哪里 |
|------|--------|
| 调整移动速度/射速/敌人数 | `config.js` |
| 设计新关卡地图 | `map.js` 的 `mapData` 数组 |
| 改坦克颜色/外形 | `tank.js` 的 `draw()` |
| 加新敌人行为（如追踪玩家） | `enemy.js` 的 `update()` 决策逻辑 |
| 加道具/新物体 | 新建类 + 在 game.js 的 update/draw 挂载 + 数组管理 |
| 改计分规则 | game.js 中 `score` 相关逻辑 |
| 加音效 | 用 `new Audio()` 或 `<audio>`，在触发点调用 |

## 6. 已知限制与后续建议

- **无多人/多关卡**：单关单局，胜利后需手动重开
- **敌人 AI 为纯随机**：不会主动追踪玩家，可升级为"朝玩家方向"决策
- **全局作用域模式**：简单项目够用；若规模变大，建议迁移到 ES Modules（import/export）
- **无资产文件**：所有图形由 Canvas 代码绘制，无法替换贴图

## 7. 开发/部署流程

```bash
# 本地开发：直接双击 index.html 或用任意静态服务器
python -m http.server 8000   # 然后访问 localhost:8000

# 发布（GitHub Pages，自动部署）
git add -A
git commit -m "改动说明"
git push
# 等 1-2 分钟构建，访问 https://tulip-yang.github.io/tank-battle/
```
