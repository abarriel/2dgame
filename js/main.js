// ============================================
// MAIN — Game loop, state machine, init
// ============================================

const CANVAS_W = 800;
const CANVAS_H = 480;
const TIME_LIMIT = 120; // seconds

const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
  WIN: 'win',
};

const Game = {
  canvas: null,
  ctx: null,
  state: GameState.MENU,
  stateTimer: 0,
  lastTime: 0,

  // Game objects
  level: null,
  player: null,
  camera: null,
  enemies: [],
  coins: [],
  powerUps: [],
  popups: [],

  // Score
  score: 0,
  coinCount: 0,
  totalCoins: 0,
  timeLeft: TIME_LIMIT,
  timeBonus: 0,

  // Alias for UI (getter name must not conflict with coinItems)
  get coins() { return this.coinCount; },

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    Input.init();
    this.lastTime = performance.now();

    // Start game loop
    requestAnimationFrame((t) => this.loop(t));
  },

  // Reset everything for a new game
  resetGame() {
    this.level = new Level();
    this.player = new Player(3 * TILE, 11 * TILE);
    this.camera = new Camera(CANVAS_W, CANVAS_H, this.level.width, this.level.height);

    // Spawn coins
    this.coinItems = [];
    for (const cp of this.level.coinPositions) {
      this.coinItems.push(new Coin(cp.col, cp.row));
    }
    this.totalCoins = this.coinItems.length;

    // Spawn enemies
    this.enemies = [];
    for (const es of this.level.enemySpawns) {
      this.enemies.push(new Enemy(es.x, es.y));
    }

    // Power-ups in play
    this.powerUps = [];
    this.popups = [];

    // Score
    this.score = 0;
    this.coinCount = 0;
    this.timeLeft = TIME_LIMIT;
    this.timeBonus = 0;

    // Hook: when player hits a question block
    this.player._onBlockHit = (col, row) => {
      this.onBlockHit(col, row);
    };
  },

  // Called when player hits a ? block from below
  onBlockHit(col, row) {
    const pu = this.level.getPowerUp(col, row);
    if (pu) {
      // Spawn power-up
      const px = col * TILE;
      const py = row * TILE;
      this.powerUps.push(new PowerUp(px, py, pu.type));
      this.popups.push(new ScorePopup(px + TILE / 2, py, pu.type === 'star' ? '\u2605 STAR!' : 'MUSHROOM!'));
    } else {
      // Spawn a coin from the block
      this.coinCount++;
      this.score += 100;
      this.popups.push(new ScorePopup(col * TILE + TILE / 2, row * TILE, '+100'));
    }
  },

  // AABB collision check
  rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },

  // Main game loop
  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // Cap at 50ms
    this.lastTime = time;
    this.stateTimer += dt;

    this.update(dt);
    this.render();
    Input.endFrame();

    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    switch (this.state) {
      case GameState.MENU:
        if (Input.enter) {
          this.state = GameState.PLAYING;
          this.stateTimer = 0;
          this.resetGame();
        }
        break;

      case GameState.PLAYING:
        this.updatePlaying(dt);
        break;

      case GameState.GAMEOVER:
        if (Input.enter && this.stateTimer > 0.5) {
          this.state = GameState.PLAYING;
          this.stateTimer = 0;
          this.resetGame();
        }
        break;

      case GameState.WIN:
        if (Input.enter && this.stateTimer > 1) {
          this.state = GameState.MENU;
          this.stateTimer = 0;
        }
        break;
    }
  },

  updatePlaying(dt) {
    // Timer
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.player.die();
    }

    // Update level (animations)
    this.level.update(dt);

    // Update player
    this.player.update(dt, this.level);

    // Update camera
    this.camera.follow(this.player);

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.level);
    }
    // Remove dead enemies after delay
    this.enemies = this.enemies.filter(e => !e.shouldRemove);

    // Update coins
    for (const coin of this.coinItems) {
      if (!coin.collected) coin.update(dt);
    }

    // Update power-ups
    for (const pu of this.powerUps) {
      pu.update(dt, this.level);
    }
    this.powerUps = this.powerUps.filter(pu => pu.active);

    // Update popups
    for (const p of this.popups) p.update(dt);
    this.popups = this.popups.filter(p => p.alive);

    // --- COLLISIONS ---

    if (!this.player.dead && !this.player.won) {
      const pb = this.player.getBounds();

      // Player vs coins
      for (const coin of this.coinItems) {
        if (coin.collected) continue;
        if (this.rectsOverlap(pb, coin.getBounds())) {
          coin.collected = true;
          this.coinCount++;
          this.score += 100;
          this.popups.push(new ScorePopup(coin.x + 8, coin.y, '+100'));
        }
      }

      // Player vs power-ups
      for (const pu of this.powerUps) {
        if (!pu.active || pu.rising) continue;
        if (this.rectsOverlap(pb, pu.getBounds())) {
          pu.active = false;
          if (pu.type === 'mushroom') {
            this.player.collectMushroom();
            this.score += 500;
            this.popups.push(new ScorePopup(pu.x + TILE / 2, pu.y, '+500'));
          } else if (pu.type === 'star') {
            this.player.collectStar();
            this.score += 1000;
            this.popups.push(new ScorePopup(pu.x + TILE / 2, pu.y, '\u2605 +1000'));
          }
        }
      }

      // Player vs enemies
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const eb = enemy.getBounds();
        if (this.rectsOverlap(pb, eb)) {
          // Check if player is stomping (falling onto enemy from above)
          const playerBottom = this.player.y + this.player.height;
          const enemyTop = enemy.y;
          const fallingOnto = this.player.vy > 0 && playerBottom - enemyTop < 16;

          if (this.player.star) {
            // Star power: insta-kill
            enemy.stomp();
            this.score += 200;
            this.popups.push(new ScorePopup(enemy.x + TILE / 2, enemy.y, '+200'));
          } else if (fallingOnto) {
            // Stomp!
            enemy.stomp();
            this.player.vy = -280; // Bounce
            this.score += 200;
            this.popups.push(new ScorePopup(enemy.x + TILE / 2, enemy.y, '+200'));
          } else {
            // Hit by enemy
            this.player.hitByEnemy();
          }
        }
      }

      // Player vs flagpole (win condition)
      const flagX = this.level.flagCol * TILE;
      if (this.player.x + this.player.width >= flagX && this.player.x <= flagX + TILE) {
        this.winGame();
      }
    }

    // Check for death -> game over transition
    if (this.player.dead && this.player.deathTimer > 2.5) {
      this.state = GameState.GAMEOVER;
      this.stateTimer = 0;
    }
  },

  winGame() {
    this.player.win();
    this.timeBonus = Math.floor(this.timeLeft) * 10;
    this.score += this.timeBonus;
    this.state = GameState.WIN;
    this.stateTimer = 0;
  },

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    switch (this.state) {
      case GameState.MENU:
        UI.renderStartScreen(ctx, CANVAS_W, CANVAS_H, this.stateTimer);
        break;

      case GameState.PLAYING:
      case GameState.GAMEOVER:
      case GameState.WIN:
        this.renderGame(ctx);

        if (this.state === GameState.GAMEOVER) {
          UI.renderGameOver(ctx, CANVAS_W, CANVAS_H, this, this.stateTimer);
        } else if (this.state === GameState.WIN) {
          UI.renderWinScreen(ctx, CANVAS_W, CANVAS_H, this, this.stateTimer);
        }
        break;
    }
  },

  renderGame(ctx) {
    // Level (background + tiles)
    this.level.render(ctx, this.camera);

    // Coins
    for (const coin of this.coinItems) {
      if (!coin.collected) coin.render(ctx, this.camera);
    }

    // Power-ups
    for (const pu of this.powerUps) {
      pu.render(ctx, this.camera);
    }

    // Enemies
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.camera);
    }

    // Player
    this.player.render(ctx, this.camera);

    // Popups
    for (const p of this.popups) {
      p.render(ctx, this.camera);
    }

    // HUD (always on top)
    if (this.state === GameState.PLAYING) {
      UI.renderHUD(ctx, this);
    }
  },
};

// Boot the game
window.addEventListener('load', () => {
  Game.init();
});
