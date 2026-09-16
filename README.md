# 🃏 Memory Card Game（记忆翻牌游戏）

一个基于 **Vue 2 + Bootstrap 4 + Lodash** 的经典记忆翻牌游戏。点击卡牌翻开图案，找出所有配对即可通关，同时记录你的**用时**与**翻牌回合数**。

项目源自 freeCodeCamp 的学习实践，重点在于理解 **Vue 2 响应式数据驱动 UI**、**Lodash 工具函数**以及**纯 CSS 3D 翻转动画**三者的配合，全程无需任何构建工具。

---

## 🎮 玩法说明

* **目标**：翻开两张图案相同的卡牌完成配对，配对完所有 12 张牌即通关。
* **操作**：鼠标点击卡牌即可翻开。
  * 两张相同 → 配对成功，卡牌变暗固定（`.matched`）
  * 两张不同 → 停顿约 0.8 秒后自动翻回背面
* **计分**：
  * `Turns`：翻牌回合数，每翻开两张牌记 1 次
  * `Total Time`：从第一次点击开始计时，通关后停止
* **Restart**：随时重开一局（游戏未开始时按钮不可用）
* **通关**：所有卡牌匹配成功后，计时停止，顶部数据条变为绿色。

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vue.js | 2.x（CDN `vue/dist/vue.js`） | 响应式状态管理，数据驱动视图 |
| Lodash | 4.17.15 | `_.shuffle` 洗牌、`_.cloneDeep` 深拷贝 |
| Bootstrap | 4.4.1 | 栅格布局与顶部数据条样式 |
| CSS3 | — | `perspective` + `rotateY` 实现 3D 翻牌动画 |

---

## 🚀 快速开始

无需安装依赖，也无需构建：

1. 克隆仓库

   ```bash
   git clone https://github.com/kaykaymaidou/memory-card-game.git
   ```

2. 直接双击打开 `index.html`，或用 VS Code 的 **Live Server** 插件运行。

> 卡牌图片与样式均使用相对路径，无需本地服务器也能正常运行。

---

## 📂 项目结构

```
.
├── index.html          # 页面结构 + CDN 引入 + Vue 模板
├── css/
│   └── index.css       # 翻牌 3D 动画与页面样式
├── js/
│   └── index.js        # 游戏核心逻辑（单个 Vue 实例）
├── images/             # 6 种水果图案 + 牌背 card_bg.png
└── README.md
```

---

## 🧠 核心实现解析

### 1. 牌堆生成：深拷贝 + 洗牌

12 张牌由 6 种水果各复制一份得来。这里必须用 `_.cloneDeep`，否则两份卡牌会引用同一批对象，翻牌时会"联动"。

```js
this.memoryCards = _.shuffle(
  this.memoryCards.concat(
    _.cloneDeep(this.cards),
    _.cloneDeep(this.cards)
  )
);
```

### 2. 响应式状态：为什么用 `Vue.set`

Vue 2 通过 `Object.defineProperty` 实现响应式，**初始化后才新增的属性无法被追踪**。因此 `isFlipped` / `isMatched` 必须用 `Vue.set` 声明：

```js
this.cards.forEach((card) => {
  Vue.set(card, "isFlipped", false);
  Vue.set(card, "isMatched", false);
});
```

### 3. 翻牌守卫

三种情况直接拒绝翻牌，避免动画错乱和重复计数：

```js
if (card.isMatched || card.isFlipped || this.flippedCards.length === 2) {
  return;
}
```

### 4. 配对判定与延时回调

凑齐两张牌后进入 `_match()`，通过 `setTimeout` 留出动画时间：

* 配对成功：**400ms** 后标记 `isMatched`，并判断是否全部完成
* 配对失败：**800ms** 后翻回背面

```js
if (this.flippedCards[0].name === this.flippedCards[1].name) {
  setTimeout(() => {
    this.flippedCards.forEach((card) => (card.isMatched = true));
    this.flippedCards = [];

    if (this.memoryCards.every((card) => card.isMatched === true)) {
      clearInterval(this.timer);
      this.complete = true;
    }
  }, 400);
} else {
  setTimeout(() => {
    this.flippedCards.forEach((card) => (card.isFlipped = false));
    this.flippedCards = [];
  }, 800);
}
```

### 5. 计时器

首次点击卡牌才启动计时（而非页面加载时），`setInterval` 每秒调用 `_tick()` 进位：

```js
_startGame() {
  this._tick();
  this.timer = setInterval(this._tick, 1000);
  this.start = true;
}
```

`minutes` / `seconds` 使用 `computed` 做补零显示，保证始终是两位数字。

### 6. 重置游戏

`reset()` 先清除计时器，延时 **600ms** 等待最后一张牌的动画播完，再重建牌堆并清零所有状态。

### 7. 纯 CSS 3D 翻牌动画

翻牌效果完全由 CSS 完成，JS 只负责切换类名：

```css
.flip-container {
  perspective: 1000px;          /* 提供 3D 透视空间 */
}

.front, .back {
  backface-visibility: hidden;  /* 隐藏元素背面 */
  transition: 0.6s;
  transform-style: preserve-3d;
}

.back {
  transform: rotateY(-180deg);  /* 背面初始翻转 180° */
  position: absolute;
}

.flip-container.flipped .back  { transform: rotateY(0deg); }
.flip-container.flipped .front { transform: rotateY(180deg); }

.matched { opacity: 0.3; }      /* 配对成功后变暗 */
```

---

## 🔮 可扩展方向

* **难度分级**：把 `cards` 数组做成可配置的 6 / 8 / 12 组，支持简单 / 普通 / 困难。
* **最高纪录**：用 `localStorage` 保存最少回合数与最短用时。
* **自定义牌面**：支持上传图片替换 `images/` 下的水果图案。
* **音效与动效**：翻牌音效、配对成功的粒子特效。
* **逻辑健壮性**：`reset()` 时若有尚未执行的 `setTimeout` 回调，仍会操作已被清空的 `flippedCards`，建议统一收集定时器句柄并在重置时清理。
* **工程化**：改用 Vue 3 + Vite，用 Composition API 拆分逻辑。

---

## 📚 学习来源

* [freeCodeCamp](https://www.freecodecamp.org/) — 项目原型与思路
* [Vue 2 官方文档 - 深入响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)
* [Lodash 文档 - `_.shuffle` / `_.cloneDeep`](https://www.lodashjs.com/)

---

Happy Coding! 🍎🥑🍐
