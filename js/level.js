// ============================================
// LEVEL — Tile map data and rendering
// ============================================

// Tile types
const T = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  USED: 4,
  PIPE_TL: 5,
  PIPE_TR: 6,
  PIPE_BL: 7,
  PIPE_BR: 8,
  FLAG: 9,
};

// Level is 60 tiles wide x 15 tiles tall
// Canvas is 800x480 = 25x15 tiles visible
const LEVEL_COLS = 70;
const LEVEL_ROWS = 15;

class Level {
  constructor() {
    this.cols = LEVEL_COLS;
    this.rows = LEVEL_ROWS;
    this.tileSize = TILE; // from sprites.js = 32
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    // Build tile map
    this.map = this.buildMap();

    // Coin positions (grid coords)
    this.coinPositions = [];
    // Enemy spawn positions (pixel coords)
    this.enemySpawns = [];
    // Power-up positions and types
    this.powerUpBlocks = []; // { col, row, type: 'mushroom'|'star' }
    // Flag position
    this.flagCol = 65;

    this.placeEntities();

    // Parallax background elements
    this.clouds = [
      { x: 100, y: 40 }, { x: 350, y: 70 }, { x: 600, y: 30 },
      { x: 900, y: 60 }, { x: 1200, y: 45 }, { x: 1600, y: 70 },
      { x: 1900, y: 35 },
    ];
    this.mountains = [
      { x: 50, y: 380 }, { x: 500, y: 380 }, { x: 1000, y: 380 },
      { x: 1500, y: 380 }, { x: 2000, y: 380 },
    ];
    this.hills = [
      { x: 0, y: 400 }, { x: 300, y: 410 }, { x: 700, y: 400 },
      { x: 1100, y: 410 }, { x: 1500, y: 400 }, { x: 1800, y: 410 },
    ];

    this.questionAnimTimer = 0;
  }

  buildMap() {
    // Initialize empty
    const map = [];
    for (let r = 0; r < this.rows; r++) {
      map[r] = new Array(this.cols).fill(T.EMPTY);
    }

    // Ground: rows 13-14 (bottom 2 rows)
    for (let c = 0; c < this.cols; c++) {
      // Gaps in ground for pits
      if ((c >= 18 && c <= 19) || (c >= 40 && c <= 41) || (c >= 55 && c <= 56)) {
        continue; // pit
      }
      map[13][c] = T.GROUND;
      map[14][c] = T.GROUND;
    }

    // --- Floating platforms and blocks ---

    // Early brick/question cluster (columns 8-12, row 9)
    map[9][8] = T.BRICK;
    map[9][9] = T.BRICK;
    map[9][10] = T.QUESTION; // mushroom
    map[9][11] = T.BRICK;
    map[9][12] = T.BRICK;

    // Single question block (col 5, row 9)
    map[9][5] = T.QUESTION; // coin

    // Step platforms before first pit (col 15-17, staircase)
    map[12][15] = T.GROUND;
    map[11][16] = T.GROUND;
    map[12][16] = T.GROUND;
    map[10][17] = T.GROUND;
    map[11][17] = T.GROUND;
    map[12][17] = T.GROUND;

    // Platform over first pit (col 18-19)
    map[8][18] = T.BRICK;
    map[8][19] = T.BRICK;
    map[8][20] = T.BRICK;

    // After pit: question blocks high up (col 22-24, row 6)
    map[6][22] = T.QUESTION;
    map[6][24] = T.QUESTION; // star

    // Mid-section platforms (col 26-30, row 10)
    map[10][26] = T.BRICK;
    map[10][27] = T.BRICK;
    map[10][28] = T.QUESTION;
    map[10][29] = T.BRICK;
    map[10][30] = T.BRICK;

    // Elevated platform (col 32-35, row 7)
    map[7][32] = T.BRICK;
    map[7][33] = T.BRICK;
    map[7][34] = T.BRICK;
    map[7][35] = T.BRICK;

    // Staircase before second pit (col 37-39)
    map[12][37] = T.GROUND;
    map[11][38] = T.GROUND;
    map[12][38] = T.GROUND;
    map[10][39] = T.GROUND;
    map[11][39] = T.GROUND;
    map[12][39] = T.GROUND;

    // Platform over second pit
    map[8][40] = T.BRICK;
    map[8][41] = T.BRICK;
    map[8][42] = T.BRICK;

    // Post-second-pit section (col 43-50)
    map[10][44] = T.QUESTION;
    map[10][46] = T.BRICK;
    map[10][47] = T.QUESTION;
    map[10][48] = T.BRICK;

    // High platform (col 50-52, row 6)
    map[6][50] = T.BRICK;
    map[6][51] = T.BRICK;
    map[6][52] = T.BRICK;

    // Staircase before third pit (col 53-54)
    map[12][53] = T.GROUND;
    map[11][54] = T.GROUND;
    map[12][54] = T.GROUND;

    // Bridge over third pit (col 55-56)
    map[9][55] = T.BRICK;
    map[9][56] = T.BRICK;
    map[9][57] = T.BRICK;

    // Final staircase to flag (col 58-64)
    for (let i = 0; i < 7; i++) {
      for (let r = 12 - i; r <= 12; r++) {
        map[r][58 + i] = T.GROUND;
      }
    }

    // Flagpole at col 65
    map[5][this.cols - 5] = T.FLAG;

    return map;
  }

  placeEntities() {
    // Coins (grid positions)
    this.coinPositions = [
      // Floating coins early
      { col: 3, row: 11 }, { col: 4, row: 11 }, { col: 5, row: 11 },
      // Coins above first brick cluster
      { col: 9, row: 7 }, { col: 10, row: 7 }, { col: 11, row: 7 },
      // Coins over first pit
      { col: 18, row: 6 }, { col: 19, row: 6 }, { col: 20, row: 6 },
      // Coins after pit
      { col: 22, row: 11 }, { col: 23, row: 11 }, { col: 24, row: 11 },
      // Coins above mid-section
      { col: 27, row: 8 }, { col: 28, row: 8 }, { col: 29, row: 8 },
      // Coins on elevated platform
      { col: 32, row: 5 }, { col: 33, row: 5 }, { col: 34, row: 5 },
      // Coins after second pit
      { col: 44, row: 8 }, { col: 46, row: 8 }, { col: 48, row: 8 },
      // High coins
      { col: 50, row: 4 }, { col: 51, row: 4 }, { col: 52, row: 4 },
      // Near flag
      { col: 60, row: 9 }, { col: 61, row: 8 }, { col: 62, row: 7 },
    ];

    // Enemies (pixel x, y)
    this.enemySpawns = [
      { x: 7 * TILE, y: 12 * TILE },
      { x: 14 * TILE, y: 12 * TILE },
      { x: 25 * TILE, y: 12 * TILE },
      { x: 30 * TILE, y: 12 * TILE },
      { x: 35 * TILE, y: 12 * TILE },
      { x: 45 * TILE, y: 12 * TILE },
      { x: 49 * TILE, y: 12 * TILE },
      { x: 57 * TILE, y: 12 * TILE },
    ];

    // Power-ups inside question blocks (col, row, type)
    this.powerUpBlocks = [
      { col: 10, row: 9, type: 'mushroom' },
      { col: 24, row: 6, type: 'star' },
      { col: 47, row: 10, type: 'mushroom' },
    ];
  }

  // Get tile at grid position
  getTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return T.EMPTY;
    return this.map[row][col];
  }

  // Set tile
  setTile(col, row, type) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.map[row][col] = type;
    }
  }

  // Is tile solid? (for collision)
  isSolid(col, row) {
    const t = this.getTile(col, row);
    return t === T.GROUND || t === T.BRICK || t === T.QUESTION || t === T.USED ||
           t === T.PIPE_TL || t === T.PIPE_TR || t === T.PIPE_BL || t === T.PIPE_BR;
  }

  // Check if a question block has a power-up
  getPowerUp(col, row) {
    return this.powerUpBlocks.find(p => p.col === col && p.row === row);
  }

  update(dt) {
    this.questionAnimTimer += dt;
  }

  // Render the level
  render(ctx, camera) {
    // --- PARALLAX BACKGROUND ---
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#5C94FC');
    grad.addColorStop(1, '#87CEEB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, camera.viewW, camera.viewH);

    // Mountains (slow parallax - 0.2x)
    for (const m of this.mountains) {
      const sx = m.x - camera.x * 0.2;
      if (sx > -200 && sx < camera.viewW + 200) {
        ctx.drawImage(Sprites.getMountain(), sx, m.y - camera.y * 0.2);
      }
    }

    // Hills (medium parallax - 0.4x)
    for (const h of this.hills) {
      const sx = h.x - camera.x * 0.4;
      if (sx > -200 && sx < camera.viewW + 200) {
        ctx.drawImage(Sprites.getHill(), sx, h.y - camera.y * 0.4);
      }
    }

    // Clouds (slow parallax - 0.15x)
    for (const c of this.clouds) {
      const sx = c.x - camera.x * 0.15;
      if (sx > -100 && sx < camera.viewW + 100) {
        ctx.drawImage(Sprites.getCloud(), sx, c.y);
      }
    }

    // --- TILES ---
    const startCol = Math.floor(camera.x / this.tileSize);
    const endCol = Math.ceil((camera.x + camera.viewW) / this.tileSize);
    const startRow = 0;
    const endRow = this.rows;

    const qFrame = Math.floor(this.questionAnimTimer * 3) % 2;

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.getTile(c, r);
        if (tile === T.EMPTY || tile === T.FLAG) continue;

        const sx = c * this.tileSize - camera.x;
        const sy = r * this.tileSize - camera.y;

        let sprite;
        switch (tile) {
          case T.GROUND:  sprite = Sprites.getGroundTile(); break;
          case T.BRICK:   sprite = Sprites.getBrickTile(); break;
          case T.QUESTION: sprite = Sprites.getQuestionTile(qFrame); break;
          case T.USED:    sprite = Sprites.getUsedBlockTile(); break;
        }

        if (sprite) {
          ctx.drawImage(sprite, sx, sy, this.tileSize, this.tileSize);
        }
      }
    }

    // --- FLAGPOLE ---
    const flagX = this.flagCol * this.tileSize - camera.x;
    const flagY = 5 * this.tileSize - camera.y;
    ctx.drawImage(Sprites.getFlagPole(), flagX, flagY, TILE, TILE * 8);
  }
}
