// ============================================
// PLAYER — Physics, states, animation
// ============================================

class Player {
  constructor(x, y) {
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 32;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left
    this.grounded = false;
    this.jumpHeld = false;
    this.jumpTimer = 0;

    // States
    this.big = false;
    this.star = false;
    this.starTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.won = false;

    // Animation
    this.animTimer = 0;
    this.walkFrame = 0;

    // Physics constants
    this.accel = 600;
    this.friction = 500;
    this.maxSpeed = 200;
    this.jumpForce = -420;
    this.gravity = 1000;
    this.maxFallSpeed = 600;
    this.jumpHoldGravity = 500; // Lower gravity while holding jump
  }

  update(dt, level) {
    if (this.dead) {
      this.deathTimer += dt;
      // Death animation: bounce up then fall
      this.vy += 800 * dt;
      this.y += this.vy * dt;
      return;
    }

    if (this.won) return;

    this.animTimer += dt;

    // Star timer
    if (this.star) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.star = false;
      }
    }

    // Invincibility timer (after getting hit)
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // --- Horizontal movement ---
    if (Input.left) {
      this.vx -= this.accel * dt;
      this.facing = -1;
    } else if (Input.right) {
      this.vx += this.accel * dt;
      this.facing = 1;
    } else {
      // Apply friction
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - this.friction * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + this.friction * dt);
      }
    }

    // Clamp speed
    this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));

    // --- Jumping ---
    if (Input.jumpPressed && this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
      this.jumpHeld = true;
      this.jumpTimer = 0;
    }

    if (this.jumpHeld && Input.jump && this.jumpTimer < 0.2) {
      this.jumpTimer += dt;
      // Use reduced gravity while holding jump (for variable height)
    } else {
      this.jumpHeld = false;
    }

    // --- Gravity ---
    const grav = (this.jumpHeld && this.vy < 0) ? this.jumpHoldGravity : this.gravity;
    this.vy += grav * dt;
    this.vy = Math.min(this.vy, this.maxFallSpeed);

    // --- Apply velocity ---
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // --- Tile collisions ---
    this.resolveCollisions(level);

    // --- Fall off map = death ---
    if (this.y > level.height + 50) {
      this.die();
    }

    // Clamp to level left edge
    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }

    // Walk animation
    if (this.grounded && Math.abs(this.vx) > 10) {
      this.walkFrame = Math.floor(this.animTimer * 8) % 2;
    } else {
      this.walkFrame = 0;
    }
  }

  resolveCollisions(level) {
    const ts = level.tileSize;
    this.grounded = false;

    // Determine tiles we overlap
    const left = Math.floor(this.x / ts);
    const right = Math.floor((this.x + this.width - 1) / ts);
    const top = Math.floor(this.y / ts);
    const bottom = Math.floor((this.y + this.height - 1) / ts);

    // Vertical collision (bottom - landing)
    if (this.vy >= 0) {
      const footRow = Math.floor((this.y + this.height) / ts);
      for (let c = left; c <= right; c++) {
        if (level.isSolid(c, footRow)) {
          this.y = footRow * ts - this.height;
          this.vy = 0;
          this.grounded = true;
          break;
        }
      }
    }

    // Vertical collision (top - hitting head)
    if (this.vy < 0) {
      const headRow = Math.floor(this.y / ts);
      const leftC = Math.floor((this.x + 2) / ts);
      const rightC = Math.floor((this.x + this.width - 3) / ts);
      for (let c = leftC; c <= rightC; c++) {
        if (level.isSolid(c, headRow)) {
          this.y = (headRow + 1) * ts;
          this.vy = 0;

          // Hit a question block?
          if (level.getTile(c, headRow) === T.QUESTION) {
            this.hitQuestionBlock(c, headRow, level);
          }
          break;
        }
      }
    }

    // Horizontal collision (recalculate after vertical resolution)
    const newTop = Math.floor((this.y + 4) / ts);
    const newBottom = Math.floor((this.y + this.height - 2) / ts);

    // Right side
    if (this.vx > 0) {
      const rightCol = Math.floor((this.x + this.width) / ts);
      for (let r = newTop; r <= newBottom; r++) {
        if (level.isSolid(rightCol, r)) {
          this.x = rightCol * ts - this.width;
          this.vx = 0;
          break;
        }
      }
    }

    // Left side
    if (this.vx < 0) {
      const leftCol = Math.floor(this.x / ts);
      for (let r = newTop; r <= newBottom; r++) {
        if (level.isSolid(leftCol, r)) {
          this.x = (leftCol + 1) * ts;
          this.vx = 0;
          break;
        }
      }
    }
  }

  hitQuestionBlock(col, row, level) {
    level.setTile(col, row, T.USED);
    // This will be handled by main.js to spawn power-ups or coins
    if (this._onBlockHit) {
      this._onBlockHit(col, row);
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.deathTimer = 0;
    this.vy = -350; // Bounce up
    this.vx = 0;
  }

  hitByEnemy() {
    if (this.star || this.invincible) return false; // Protected

    if (this.big) {
      // Shrink instead of dying
      this.big = false;
      this.height = 32;
      this.invincible = true;
      this.invincibleTimer = 1.5;
      return false;
    }

    this.die();
    return true;
  }

  collectMushroom() {
    if (!this.big) {
      this.big = true;
      this.height = 48;
      this.y -= 16; // Adjust position so we don't clip into ground
    }
  }

  collectStar() {
    this.star = true;
    this.starTimer = 8; // 8 seconds of invincibility
  }

  // Flag reached
  win() {
    this.won = true;
    this.vx = 0;
    this.vy = 0;
  }

  render(ctx, camera) {
    if (this.dead && this.deathTimer > 2) return; // Stop rendering after death

    // Invincibility flicker
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      return; // Skip rendering every other frame for flicker
    }

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    // Get the right sprite
    let sprite;
    if (!this.grounded && !this.won) {
      sprite = Sprites.getPlayerJump(this.big);
    } else if (Math.abs(this.vx) > 10) {
      sprite = Sprites.getPlayerWalk(this.big, this.walkFrame);
    } else {
      sprite = Sprites.getPlayerStand(this.big);
    }

    // Flip if facing left
    if (this.facing === -1) {
      sprite = Sprites.flipH(sprite);
    }

    // Star power: tint/flash effect
    if (this.star) {
      ctx.save();
      const starFlash = Math.floor(this.animTimer * 15) % 3;
      if (starFlash === 0) ctx.filter = 'hue-rotate(90deg)';
      else if (starFlash === 1) ctx.filter = 'hue-rotate(180deg)';
      else ctx.filter = 'hue-rotate(270deg)';
    }

    ctx.drawImage(sprite, sx, sy, this.width, this.big ? 48 : 32);

    if (this.star) {
      ctx.restore();
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
