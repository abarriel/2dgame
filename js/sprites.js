// ============================================
// SPRITES — All pixel-art drawn via Canvas
// No external images needed
// ============================================

const TILE = 32; // Tile size in pixels

const Sprites = {
  cache: {},

  // Create an offscreen canvas and draw pixels on it
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return { canvas: c, ctx: c.getContext('2d') };
  },

  // Draw a pixel grid from a 2D color array
  drawPixelGrid(ctx, grid, pixelSize, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const color = grid[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  },

  // ---- PLAYER SPRITES (Mario-like) ----

  // Color palette
  P: {
    R: '#E52521',   // Red (hat/shirt)
    B: '#0D47A1',   // Blue (overalls)
    S: '#FFB74D',   // Skin
    H: '#6D4C41',   // Hair/brown
    Y: '#FDD835',   // Yellow (buttons)
    W: '#FFFFFF',   // White
    K: '#212121',   // Black outline
    G: '#4CAF50',   // Green
  },

  getPlayerStand(big) {
    const key = 'player_stand_' + (big ? 'big' : 'small');
    if (this.cache[key]) return this.cache[key];

    const _ = null;
    const { R, B, S, H, Y, K } = this.P;

    let grid;
    if (!big) {
      // Small Mario — 12x16 pixels, rendered at 2x = 24x32
      grid = [
        [_,_,_,R,R,R,R,R,_,_,_,_],
        [_,_,R,R,R,R,R,R,R,R,_,_],
        [_,_,H,H,H,S,S,K,S,_,_,_],
        [_,H,S,H,S,S,S,K,S,S,S,_],
        [_,H,S,H,H,S,S,S,K,S,S,S],
        [_,H,H,S,S,S,S,K,K,K,K,_],
        [_,_,_,S,S,S,S,S,S,S,_,_],
        [_,_,R,R,B,R,R,R,_,_,_,_],
        [_,R,R,R,B,R,R,B,R,R,R,_],
        [R,R,R,R,B,B,B,B,R,R,R,R],
        [S,S,R,B,Y,B,B,Y,B,R,S,S],
        [S,S,S,B,B,B,B,B,B,S,S,S],
        [S,S,B,B,B,B,B,B,B,B,S,S],
        [_,_,B,B,B,_,_,B,B,B,_,_],
        [_,H,H,H,_,_,_,_,H,H,H,_],
        [H,H,H,H,_,_,_,_,H,H,H,H],
      ];
    } else {
      // Big Mario — 12x24 pixels, rendered at 2x = 24x48
      grid = [
        [_,_,_,_,R,R,R,R,R,_,_,_],
        [_,_,_,R,R,R,R,R,R,R,_,_],
        [_,_,R,R,R,R,R,R,R,R,R,_],
        [_,_,H,H,H,S,S,K,S,_,_,_],
        [_,H,S,H,S,S,S,K,S,S,S,_],
        [_,H,S,H,H,S,S,S,K,S,S,S],
        [_,H,H,S,S,S,S,K,K,K,_,_],
        [_,_,_,S,S,S,S,S,S,_,_,_],
        [_,_,R,R,R,R,R,R,R,R,_,_],
        [_,R,R,R,R,R,R,R,R,R,R,_],
        [R,R,R,R,R,R,R,R,R,R,R,R],
        [S,S,R,R,B,R,R,R,R,R,S,S],
        [S,S,R,R,B,R,R,B,R,R,S,S],
        [_,_,R,R,B,B,B,B,R,R,_,_],
        [_,_,B,B,Y,B,B,Y,B,B,_,_],
        [_,_,B,B,B,B,B,B,B,B,_,_],
        [_,_,B,B,B,B,B,B,B,B,_,_],
        [_,_,B,B,B,_,_,B,B,B,_,_],
        [_,_,R,R,R,_,_,R,R,R,_,_],
        [_,_,B,B,B,_,_,B,B,B,_,_],
        [_,_,B,B,B,_,_,B,B,B,_,_],
        [_,H,H,H,H,_,_,H,H,H,H,_],
        [_,H,H,H,H,_,_,H,H,H,H,_],
        [H,H,H,H,H,_,_,H,H,H,H,H],
      ];
    }

    const pxSize = 2;
    const w = grid[0].length * pxSize;
    const h = grid.length * pxSize;
    const { canvas, ctx } = this.createCanvas(w, h);
    this.drawPixelGrid(ctx, grid, pxSize);
    this.cache[key] = canvas;
    return canvas;
  },

  getPlayerWalk(big, frame) {
    const key = 'player_walk_' + (big ? 'big' : 'small') + '_' + frame;
    if (this.cache[key]) return this.cache[key];

    // Slightly modify the standing sprite for walk frames
    const base = this.getPlayerStand(big);
    const { canvas, ctx } = this.createCanvas(base.width, base.height);
    ctx.drawImage(base, 0, 0);

    // Simple walk animation: shift legs
    if (frame === 1) {
      // Redraw base then modify bottom pixels for leg movement
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      const h = canvas.height;
      if (!big) {
        ctx.clearRect(0, h - 6, canvas.width, 6);
        ctx.fillStyle = this.P.H;
        ctx.fillRect(2, h - 6, 6, 2);
        ctx.fillRect(14, h - 4, 8, 4);
        ctx.fillStyle = this.P.B;
        ctx.fillRect(4, h - 8, 6, 4);
        ctx.fillRect(14, h - 8, 6, 4);
      } else {
        ctx.clearRect(0, h - 8, canvas.width, 8);
        ctx.fillStyle = this.P.H;
        ctx.fillRect(2, h - 6, 8, 6);
        ctx.fillRect(16, h - 4, 8, 4);
        ctx.fillStyle = this.P.B;
        ctx.fillRect(4, h - 10, 6, 6);
        ctx.fillRect(14, h - 10, 6, 4);
      }
    }

    this.cache[key] = canvas;
    return canvas;
  },

  getPlayerJump(big) {
    const key = 'player_jump_' + (big ? 'big' : 'small');
    if (this.cache[key]) return this.cache[key];

    const base = this.getPlayerStand(big);
    const { canvas, ctx } = this.createCanvas(base.width, base.height);
    ctx.drawImage(base, 0, 0);

    // Modify legs to be spread apart for jump pose
    const h = canvas.height;
    if (!big) {
      ctx.clearRect(0, h - 8, canvas.width, 8);
      ctx.fillStyle = this.P.B;
      ctx.fillRect(0, h - 8, 6, 4);
      ctx.fillRect(16, h - 8, 6, 4);
      ctx.fillStyle = this.P.H;
      ctx.fillRect(0, h - 4, 6, 4);
      ctx.fillRect(18, h - 4, 6, 4);
    } else {
      ctx.clearRect(0, h - 12, canvas.width, 12);
      ctx.fillStyle = this.P.B;
      ctx.fillRect(0, h - 12, 8, 6);
      ctx.fillRect(16, h - 12, 8, 6);
      ctx.fillStyle = this.P.H;
      ctx.fillRect(0, h - 6, 8, 6);
      ctx.fillRect(18, h - 6, 8, 6);
    }

    this.cache[key] = canvas;
    return canvas;
  },

  // ---- TILE SPRITES ----

  getGroundTile() {
    if (this.cache.ground) return this.cache.ground;
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    // Brown ground block with brick pattern
    ctx.fillStyle = '#C84C09';
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = '#E07020';
    ctx.fillRect(1, 1, TILE - 2, TILE - 2);
    // Top highlight
    ctx.fillStyle = '#F0A050';
    ctx.fillRect(1, 1, TILE - 2, 3);
    // Darker bottom
    ctx.fillStyle = '#A04008';
    ctx.fillRect(1, TILE - 3, TILE - 2, 2);
    // Dot detail
    ctx.fillStyle = '#C06018';
    ctx.fillRect(4, 8, 2, 2);
    ctx.fillRect(14, 14, 2, 2);
    ctx.fillRect(24, 8, 2, 2);
    ctx.fillRect(10, 20, 2, 2);

    this.cache.ground = canvas;
    return canvas;
  },

  getBrickTile() {
    if (this.cache.brick) return this.cache.brick;
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    ctx.fillStyle = '#C84C09';
    ctx.fillRect(0, 0, TILE, TILE);

    // Brick pattern
    ctx.fillStyle = '#A03808';
    // Horizontal mortar lines
    ctx.fillRect(0, 7, TILE, 1);
    ctx.fillRect(0, 15, TILE, 1);
    ctx.fillRect(0, 23, TILE, 1);
    // Vertical mortar lines (offset per row)
    ctx.fillRect(15, 0, 1, 7);
    ctx.fillRect(7, 8, 1, 7);
    ctx.fillRect(23, 8, 1, 7);
    ctx.fillRect(15, 16, 1, 7);
    ctx.fillRect(7, 24, 1, 8);
    ctx.fillRect(23, 24, 1, 8);

    // Highlight on bricks
    ctx.fillStyle = '#E07020';
    for (let row = 0; row < 4; row++) {
      const y = row * 8 + 1;
      const offsets = row % 2 === 0 ? [0, 16] : [8, 24];
      for (const ox of offsets) {
        ctx.fillRect(ox + 1, y, 5, 1);
      }
    }

    this.cache.brick = canvas;
    return canvas;
  },

  getQuestionTile(frame = 0) {
    const key = 'question_' + frame;
    if (this.cache[key]) return this.cache[key];
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    // Yellow/gold block
    const bright = frame % 2 === 0 ? '#FFD54F' : '#FFC107';
    ctx.fillStyle = '#8D6E11';
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = bright;
    ctx.fillRect(1, 1, TILE - 2, TILE - 2);
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(1, 1, TILE - 2, 2);
    ctx.fillStyle = '#8D6E11';
    ctx.fillRect(1, TILE - 3, TILE - 2, 2);

    // Question mark
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(11, 6, 10, 3);
    ctx.fillRect(18, 9, 3, 6);
    ctx.fillRect(13, 13, 8, 3);
    ctx.fillRect(13, 16, 3, 3);
    ctx.fillRect(13, 22, 3, 3);

    this.cache[key] = canvas;
    return canvas;
  },

  getUsedBlockTile() {
    if (this.cache.usedBlock) return this.cache.usedBlock;
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    ctx.fillStyle = '#5D4037';
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.fillStyle = '#795548';
    ctx.fillRect(1, 1, TILE - 2, TILE - 2);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(3, 3, TILE - 6, TILE - 6);

    this.cache.usedBlock = canvas;
    return canvas;
  },

  // ---- COIN SPRITE ----

  getCoin(frame = 0) {
    const key = 'coin_' + frame;
    if (this.cache[key]) return this.cache[key];
    const { canvas, ctx } = this.createCanvas(16, 16);

    // Spinning coin animation: change width for rotation effect
    const widths = [12, 8, 4, 8];
    const w = widths[frame % 4];

    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.ellipse(8, 8, w / 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.ellipse(8, 8, w / 2 - 1, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    if (w > 6) {
      ctx.fillStyle = '#FFF9C4';
      ctx.beginPath();
      ctx.ellipse(7, 6, 1, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache[key] = canvas;
    return canvas;
  },

  // ---- ENEMY (GOOMBA) ----

  getGoomba(frame = 0) {
    const key = 'goomba_' + frame;
    if (this.cache[key]) return this.cache[key];
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    const _ = null;
    const B = '#6D4C41';
    const D = '#4E342E';
    const S = '#FFB74D';
    const W = '#FFFFFF';
    const K = '#212121';

    // Simple goomba: brown mushroom enemy, 16x16 at 2x
    const grid = [
      [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
      [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
      [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
      [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
      [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
      [_,B,B,K,K,W,B,B,B,B,W,K,K,B,B,_],
      [B,B,B,K,K,W,B,B,B,B,W,K,K,B,B,B],
      [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
      [B,B,B,B,B,B,B,D,D,B,B,B,B,B,B,B],
      [_,B,B,B,B,B,D,D,D,D,B,B,B,B,B,_],
      [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
      [_,_,_,S,S,S,S,S,S,S,S,S,S,_,_,_],
      [_,_,S,S,S,S,S,S,S,S,S,S,S,S,_,_],
      [_,_,S,S,_,_,S,S,S,S,_,_,S,S,_,_],
      [_,K,K,_,_,_,_,S,S,_,_,_,_,K,K,_],
      [K,K,K,K,_,_,_,_,_,_,_,_,K,K,K,K],
    ];

    // Slight feet offset for walk animation
    const { canvas: c2, ctx: ctx2 } = this.createCanvas(TILE, TILE);
    this.drawPixelGrid(ctx2, grid, 2);

    if (frame === 1) {
      // Shift feet slightly
      ctx.drawImage(c2, 1, 0);
    } else {
      ctx.drawImage(c2, 0, 0);
    }

    this.cache[key] = canvas;
    return canvas;
  },

  getGoombaDead() {
    if (this.cache.goombaDead) return this.cache.goombaDead;
    const { canvas, ctx } = this.createCanvas(TILE, TILE / 2);

    // Flattened goomba
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(2, 8, 28, 8);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(4, 10, 24, 4);
    // Eyes X'd
    ctx.fillStyle = '#212121';
    ctx.fillRect(8, 10, 2, 2);
    ctx.fillRect(12, 10, 2, 2);
    ctx.fillRect(20, 10, 2, 2);
    ctx.fillRect(24, 10, 2, 2);

    this.cache.goombaDead = canvas;
    return canvas;
  },

  // ---- MUSHROOM POWER-UP ----

  getMushroom() {
    if (this.cache.mushroom) return this.cache.mushroom;
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    // Red mushroom with white spots
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.ellipse(16, 14, 14, 12, 0, Math.PI, 0);
    ctx.fill();

    // White spots
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(10, 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(16, 4, 3, 0, Math.PI * 2); ctx.fill();

    // Stem
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(10, 14, 12, 10);
    ctx.fillStyle = '#FFE082';
    ctx.fillRect(12, 14, 8, 10);

    // Eyes
    ctx.fillStyle = '#212121';
    ctx.fillRect(12, 18, 3, 3);
    ctx.fillRect(19, 18, 3, 3);

    // Bottom
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(8, 24, 16, 4);

    this.cache.mushroom = canvas;
    return canvas;
  },

  // ---- STAR POWER-UP ----

  getStar(frame = 0) {
    const key = 'star_' + frame;
    if (this.cache[key]) return this.cache[key];
    const { canvas, ctx } = this.createCanvas(TILE, TILE);

    const colors = ['#FFD54F', '#FFC107', '#FFEB3B'];
    ctx.fillStyle = colors[frame % 3];

    // 5-point star shape
    ctx.beginPath();
    const cx = 16, cy = 16, spikes = 5, outerR = 13, innerR = 6;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 2 * 3) + (i * Math.PI / spikes);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#212121';
    ctx.fillRect(12, 14, 2, 3);
    ctx.fillRect(19, 14, 2, 3);

    // Shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10, 10, 2, 2);

    this.cache[key] = canvas;
    return canvas;
  },

  // ---- FLAG / FLAGPOLE ----

  getFlagPole() {
    if (this.cache.flagpole) return this.cache.flagpole;
    const { canvas, ctx } = this.createCanvas(TILE, TILE * 8);

    // Pole
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(14, 0, 4, TILE * 8);

    // Ball on top
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(16, 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Flag
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.moveTo(18, 10);
    ctx.lineTo(TILE, 10);
    ctx.lineTo(18, 30);
    ctx.closePath();
    ctx.fill();

    this.cache.flagpole = canvas;
    return canvas;
  },

  // ---- PARALLAX BACKGROUND ELEMENTS ----

  getCloud() {
    if (this.cache.cloud) return this.cache.cloud;
    const { canvas, ctx } = this.createCanvas(96, 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(24, 32, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(48, 24, 24, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(72, 32, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(36, 20, 16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(60, 20, 16, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    this.cache.cloud = canvas;
    return canvas;
  },

  getMountain() {
    if (this.cache.mountain) return this.cache.mountain;
    const { canvas, ctx } = this.createCanvas(160, 100);

    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(80, 10);
    ctx.lineTo(160, 100);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#43A047';
    ctx.beginPath();
    ctx.moveTo(30, 100);
    ctx.lineTo(80, 30);
    ctx.lineTo(130, 100);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    ctx.fillStyle = '#E8F5E9';
    ctx.beginPath();
    ctx.moveTo(65, 30);
    ctx.lineTo(80, 10);
    ctx.lineTo(95, 30);
    ctx.closePath();
    ctx.fill();

    this.cache.mountain = canvas;
    return canvas;
  },

  getHill() {
    if (this.cache.hill) return this.cache.hill;
    const { canvas, ctx } = this.createCanvas(200, 80);

    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.ellipse(100, 80, 100, 60, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.ellipse(100, 80, 80, 45, 0, Math.PI, 0);
    ctx.fill();

    this.cache.hill = canvas;
    return canvas;
  },

  // ---- PARTICLE ----

  getCoinParticle() {
    if (this.cache.coinParticle) return this.cache.coinParticle;
    const { canvas, ctx } = this.createCanvas(8, 8);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(2, 2, 2, 2);
    this.cache.coinParticle = canvas;
    return canvas;
  },

  _flipCounter: 0,

  // Flip a sprite horizontally
  flipH(sprite) {
    if (!sprite._flipId) {
      sprite._flipId = 'flip_' + (this._flipCounter++);
    }
    const key = sprite._flipId;
    if (this.cache[key]) return this.cache[key];
    const { canvas, ctx } = this.createCanvas(sprite.width, sprite.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, -sprite.width, 0);
    ctx.restore();
    this.cache[key] = canvas;
    return canvas;
  }
};
