// ============================================
// UI — HUD, start screen, game over, win
// ============================================

const UI = {
  // Draw the HUD (top of screen during gameplay)
  renderHUD(ctx, game) {
    ctx.save();

    // Semi-transparent bar at top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, ctx.canvas.width, 36);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';

    // Coin icon + count
    const coinSprite = Sprites.getCoin(0);
    ctx.drawImage(coinSprite, 12, 10, 16, 16);
    ctx.fillText('x ' + game.coins, 34, 26);

    // Score
    ctx.fillText('SCORE: ' + String(game.score).padStart(6, '0'), 130, 26);

    // World
    ctx.fillText('WORLD 1-1', 380, 26);

    // Time
    const timeLeft = Math.max(0, Math.ceil(game.timeLeft));
    ctx.fillText('TIME: ' + timeLeft, 600, 26);

    // Star timer
    if (game.player && game.player.star) {
      const starTime = Math.ceil(game.player.starTimer);
      ctx.fillStyle = '#FFD54F';
      ctx.fillText('\u2605 ' + starTime, 720, 26);
    }

    ctx.restore();
  },

  // Start screen
  renderStartScreen(ctx, w, h, timer) {
    ctx.save();

    // Sky background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5C94FC');
    grad.addColorStop(1, '#87CEEB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Clouds
    ctx.drawImage(Sprites.getCloud(), 50, 60);
    ctx.drawImage(Sprites.getCloud(), 500, 90);
    ctx.drawImage(Sprites.getCloud(), 650, 40);

    // Hills
    ctx.drawImage(Sprites.getHill(), 0, h - 80);
    ctx.drawImage(Sprites.getHill(), 300, h - 70);
    ctx.drawImage(Sprites.getHill(), 600, h - 80);

    // Ground
    for (let x = 0; x < w; x += TILE) {
      ctx.drawImage(Sprites.getGroundTile(), x, h - 64, TILE, TILE);
      ctx.drawImage(Sprites.getGroundTile(), x, h - 32, TILE, TILE);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    ctx.font = 'bold 48px monospace';
    ctx.strokeText('SUPER PIXEL', w / 2, 130);
    ctx.fillText('SUPER PIXEL', w / 2, 130);
    ctx.strokeText('ADVENTURE', w / 2, 185);
    ctx.fillText('ADVENTURE', w / 2, 185);

    // Title shadow
    ctx.fillStyle = '#E53935';
    ctx.font = 'bold 50px monospace';
    ctx.fillText('SUPER PIXEL', w / 2 + 2, 132);
    ctx.fillText('ADVENTURE', w / 2 + 2, 187);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('SUPER PIXEL', w / 2, 130);
    ctx.fillText('ADVENTURE', w / 2, 185);

    // Player sprite preview
    const playerSprite = Sprites.getPlayerStand(false);
    ctx.drawImage(playerSprite, w / 2 - 24, 220, 48, 64);

    // Instructions
    const blink = Math.floor(timer * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#FFD54F';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('PRESS ENTER TO START', w / 2, 340);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.fillText('Arrow Keys / WASD = Move', w / 2, 390);
    ctx.fillText('Space / Arrow Up = Jump', w / 2, 410);

    ctx.fillStyle = '#FFB74D';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('1 LIFE  \u2022  COLLECT COINS  \u2022  REACH THE FLAG', w / 2, 445);

    ctx.restore();
  },

  // Game over screen
  renderGameOver(ctx, w, h, game, timer) {
    ctx.save();

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';

    // GAME OVER text
    ctx.fillStyle = '#E53935';
    ctx.font = 'bold 56px monospace';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('SCORE: ' + String(game.score).padStart(6, '0'), w / 2, h / 2);
    ctx.fillText('COINS: ' + game.coins, w / 2, h / 2 + 35);

    // Restart prompt
    const blink = Math.floor(timer * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#FFD54F';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('PRESS ENTER TO RETRY', w / 2, h / 2 + 100);
    }

    ctx.restore();
  },

  // Win screen
  renderWinScreen(ctx, w, h, game, timer) {
    ctx.save();

    // Golden overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';

    // YOU WIN text
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 56px monospace';
    ctx.fillText('YOU WIN!', w / 2, h / 2 - 80);

    // Stars decoration
    const starSize = 20 + Math.sin(timer * 4) * 5;
    ctx.font = starSize + 'px monospace';
    ctx.fillText('\u2605 \u2605 \u2605', w / 2, h / 2 - 30);

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('FINAL SCORE: ' + String(game.score).padStart(6, '0'), w / 2, h / 2 + 20);
    ctx.fillText('COINS: ' + game.coins + ' / ' + game.totalCoins, w / 2, h / 2 + 55);

    // Time bonus
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('TIME BONUS: +' + game.timeBonus, w / 2, h / 2 + 90);

    // Restart prompt
    const blink = Math.floor(timer * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#FFD54F';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('PRESS ENTER TO PLAY AGAIN', w / 2, h / 2 + 140);
    }

    ctx.restore();
  },
};
