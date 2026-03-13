// ============================================
// COLLECTIBLE — Coins and power-up items
// ============================================

class Coin {
  constructor(col, row) {
    this.x = col * TILE + 8;
    this.y = row * TILE + 8;
    this.width = 16;
    this.height = 16;
    this.collected = false;
    this.animTimer = Math.random() * 4; // randomize start frame
    this.baseY = this.y;
    this.bobSpeed = 2 + Math.random();
  }

  update(dt) {
    this.animTimer += dt;
    // Gentle bobbing
    this.y = this.baseY + Math.sin(this.animTimer * this.bobSpeed) * 3;
  }

  render(ctx, camera) {
    if (this.collected) return;
    const frame = Math.floor(this.animTimer * 5) % 4;
    const sprite = Sprites.getCoin(frame);
    ctx.drawImage(sprite, this.x - camera.x, this.y - camera.y, 16, 16);
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = TILE;
    this.height = TILE;
    this.type = type; // 'mushroom' or 'star'
    this.vx = type === 'star' ? 0 : 60; // mushroom slides, star stays
    this.vy = 0;
    this.active = true;
    this.grounded = false;
    this.animTimer = 0;

    // Rise animation
    this.rising = true;
    this.riseOrigin = y;
    this.riseTarget = y - TILE;
  }

  update(dt, level) {
    if (!this.active) return;

    this.animTimer += dt;

    // Rise out of block
    if (this.rising) {
      this.y -= 80 * dt;
      if (this.y <= this.riseTarget) {
        this.y = this.riseTarget;
        this.rising = false;
      }
      return;
    }

    // Gravity
    this.vy += 800 * dt;
    this.y += this.vy * dt;
    this.x += this.vx * dt;

    // Tile collision
    const col = Math.floor((this.x + this.width / 2) / TILE);
    const row = Math.floor((this.y + this.height) / TILE);

    // Ground collision
    if (level.isSolid(col, row)) {
      this.y = (row - 1) * TILE;
      this.vy = 0;
      this.grounded = true;
    }

    // Wall collision
    const leftCol = Math.floor(this.x / TILE);
    const rightCol = Math.floor((this.x + this.width - 1) / TILE);
    const midRow = Math.floor((this.y + this.height / 2) / TILE);

    if (this.vx > 0 && level.isSolid(rightCol, midRow)) {
      this.vx = -this.vx;
    } else if (this.vx < 0 && level.isSolid(leftCol, midRow)) {
      this.vx = -this.vx;
    }

    // Star bouncing
    if (this.type === 'star' && this.grounded) {
      this.vy = -300;
      this.grounded = false;
    }

    // Remove if off screen bottom
    if (this.y > level.height + 100) {
      this.active = false;
    }
  }

  render(ctx, camera) {
    if (!this.active) return;
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    if (this.type === 'mushroom') {
      ctx.drawImage(Sprites.getMushroom(), sx, sy, TILE, TILE);
    } else {
      const frame = Math.floor(this.animTimer * 6) % 3;
      ctx.drawImage(Sprites.getStar(frame), sx, sy, TILE, TILE);
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

// Floating score/text particle
class ScorePopup {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.life = 0.8;
    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;
    this.y -= 60 * dt;
  }

  get alive() {
    return this.timer < this.life;
  }

  render(ctx, camera) {
    const alpha = 1 - this.timer / this.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x - camera.x, this.y - camera.y);
    ctx.restore();
  }
}
