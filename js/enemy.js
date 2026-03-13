// ============================================
// ENEMY — Goomba-style patrol enemies
// ============================================

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = TILE;
    this.height = TILE;
    this.vx = -50; // Walk left by default
    this.vy = 0;
    this.alive = true;
    this.deathTimer = 0;
    this.animTimer = 0;
    this.grounded = false;
  }

  update(dt, level) {
    if (!this.alive) {
      this.deathTimer += dt;
      return;
    }

    this.animTimer += dt;

    // Gravity
    this.vy += 800 * dt;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // --- Tile collisions ---

    // Bottom (ground)
    this.grounded = false;
    const bottomRow = Math.floor((this.y + this.height) / TILE);
    const leftCol = Math.floor((this.x + 4) / TILE);
    const rightCol = Math.floor((this.x + this.width - 4) / TILE);

    if (this.vy >= 0) {
      for (let c = leftCol; c <= rightCol; c++) {
        if (level.isSolid(c, bottomRow)) {
          this.y = (bottomRow - 1) * TILE;
          this.vy = 0;
          this.grounded = true;
          break;
        }
      }
    }

    // Sides (walls)
    const midRow = Math.floor((this.y + this.height / 2) / TILE);
    const edgeLeft = Math.floor(this.x / TILE);
    const edgeRight = Math.floor((this.x + this.width - 1) / TILE);

    if (this.vx < 0 && level.isSolid(edgeLeft, midRow)) {
      this.vx = Math.abs(this.vx);
    } else if (this.vx > 0 && level.isSolid(edgeRight, midRow)) {
      this.vx = -Math.abs(this.vx);
    }

    // Turn around at ledge edges (don't walk off platforms)
    if (this.grounded) {
      const aheadCol = this.vx < 0 ? leftCol - 1 : rightCol + 1;
      if (!level.isSolid(aheadCol, bottomRow)) {
        this.vx = -this.vx;
      }
    }

    // Remove if fallen off map
    if (this.y > level.height + 100) {
      this.alive = false;
      this.deathTimer = 999;
    }
  }

  stomp() {
    this.alive = false;
    this.deathTimer = 0;
  }

  get shouldRemove() {
    return !this.alive && this.deathTimer > 0.5;
  }

  render(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    if (!this.alive) {
      // Squashed goomba
      const deadSprite = Sprites.getGoombaDead();
      ctx.drawImage(deadSprite, sx, sy + TILE / 2, TILE, TILE / 2);
      return;
    }

    const frame = Math.floor(this.animTimer * 4) % 2;
    ctx.drawImage(Sprites.getGoomba(frame), sx, sy, TILE, TILE);
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  // Top zone for stomp detection
  getStompZone() {
    return { x: this.x, y: this.y, width: this.width, height: this.height / 2 };
  }
}
