// ============================================
// CAMERA — Side-scrolling camera
// ============================================

class Camera {
  constructor(viewW, viewH, levelW, levelH) {
    this.x = 0;
    this.y = 0;
    this.viewW = viewW;
    this.viewH = viewH;
    this.levelW = levelW;
    this.levelH = levelH;
  }

  follow(target) {
    // Smoothly track player, biased slightly ahead
    const targetX = target.x + target.width / 2 - this.viewW / 2;
    this.x += (targetX - this.x) * 0.1;
    this.x = Math.max(0, Math.min(this.x, this.levelW - this.viewW));
    this.y = 0; // No vertical scrolling for this level
  }
}
