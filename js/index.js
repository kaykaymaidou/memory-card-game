const app = new Vue({
  el: "#app",
  data: {
    // 记忆卡牌
    memoryCards: [],
    // 转动卡牌
    flippedCards: [],
    // 是否已经匹配完成
    complete: false,
    // 是否开始计时
    start: false,
    // 反转次数
    turns: 0,
    // 倒计时
    totalTime: {
      minutes: 0,
      seconds: 0,
    },
    // 计时器
    timer: null,
    // 卡片列表
    cards: [
      {
        name: "Apple",
        img: "apple.png",
      },
      {
        name: "Avocado",
        img: "avocado.png",
      },
      {
        name: "Pear",
        img: "pear.png",
      },
      {
        name: "Mongo",
        img: "mongo.png",
      },
      {
        name: "Strawberry",
        img: "strawberry.png",
      },
      {
        name: "Purple",
        img: "purple.png",
      },
    ],
  },
  created() {
    this.init()
  },
  methods: {
    // 初始化卡片
    init () {
      // 给每一个卡牌对象都放入一个翻转flip和匹配match标识, 默认值都是false [具体需要了解Vue2的数据监测原理]
      this.cards.forEach((card) => {
        Vue.set(card, "isFlipped", false);
        Vue.set(card, "isMatched", false);
      });
      // 定义记忆卡片为拼接两组卡片并洗牌
      this.memoryCards = _.shuffle(
        this.memoryCards.concat(
          _.cloneDeep(this.cards),
          _.cloneDeep(this.cards)
        )
      );
    },
    // 翻转卡牌方法
    flipCard(card) {
      // 若卡片以匹配成功或以翻转或已有两个卡片了, 则不翻
      if (card.isMatched || card.isFlipped || this.flippedCards.length === 2) {
        return;
      }

      // 若未开始则开始游戏
      if (!this.start) {
        this._startGame();
      }

      card.isFlipped = true;

      // 若翻转开片不足两个, 则可以继续翻
      if (this.flippedCards.length < 2) {
        this.flippedCards.push(card);
      }

      // 若翻转卡片已有两个, 则查看是否匹配
      if (this.flippedCards.length === 2) {
        this._match(card);
      }
    },
    // 匹配卡牌方法
    _match(card) {
      // 当翻了两张卡, 则记一次数
      this.turns++;
      // 若翻转的卡片的属性一致, 则匹配成功
      if (this.flippedCards[0].name === this.flippedCards[1].name) {
        // 设置延时翻转匹配成功卡片
        setTimeout(() => {
          this.flippedCards.forEach((card) => (card.isMatched = true));
          this.flippedCards = [];

          // 若所有的牌都匹配完了, 则表示完成
          if (this.memoryCards.every((card) => card.isMatched === true)) {
            clearInterval(this.timer);
            this.complete = true;
          }
        }, 400);
      } else {
        // 设置延时翻正匹配失败卡片
        setTimeout(() => {
          this.flippedCards.forEach((card) => {
            card.isFlipped = false;
          });
          this.flippedCards = [];
        }, 800);
      }
    },
    // 开始游戏
    _startGame() {
      this._tick();
      this.timer = setInterval(this._tick, 1000);
      this.start = true;
    },
    // 计时
    _tick() {
      if (this.totalTime.seconds !== 59) {
        this.totalTime.seconds++;
        return;
      }

      this.totalTime.minutes++;
      this.totalTime.seconds = 0;
    },
    // 重置卡片
    reset() {
      // 清除计时器
      clearInterval(this.timer);
      // 设置延时重置卡片
      setTimeout(() => {
        this.memoryCards = [];
        this.init();
        this.totalTime.minutes = 0;
        this.totalTime.seconds = 0;
        this.start = false;
        this.complete = false;
        this.turns = 0;
        this.flippedCards = [];
        this.timer = null;
      }, 600);
    },
  },
  computed: {
    // 计算分钟
    minutes() {
      if (this.totalTime.minutes < 10) {
        return "0" + this.totalTime.minutes;
      }
      return this.totalTime.minutes;
    },
    // 计算秒
    seconds() {
      if (this.totalTime.seconds < 10) {
        return "0" + this.totalTime.seconds;
      }
      return this.totalTime.seconds;
    },
  },
});