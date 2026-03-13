// ============================================
// INPUT — Keyboard state tracking
// ============================================

const Input = {
  keys: {},
  pressed: {},

  init() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.pressed[e.code] = true;
      }
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  },

  // Is key currently held down?
  isDown(code) {
    return !!this.keys[code];
  },

  // Was key just pressed this frame? (single-shot)
  wasPressed(code) {
    if (this.pressed[code]) {
      this.pressed[code] = false;
      return true;
    }
    return false;
  },

  // Call at end of each frame
  endFrame() {
    this.pressed = {};
  },

  get left() { return this.isDown('ArrowLeft') || this.isDown('KeyA'); },
  get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
  get jump() { return this.isDown('Space') || this.isDown('ArrowUp') || this.isDown('KeyW'); },
  get jumpPressed() {
    return this.wasPressed('Space') || this.wasPressed('ArrowUp') || this.wasPressed('KeyW');
  },
  get enter() { return this.wasPressed('Enter'); },
};
