// Snake Game Easter Egg - Triggers on rapid 'v' key presses
(function() {
  'use strict';

  // Track 'v' key presses for Easter egg trigger
  let vPresses = [];
  const TRIGGER_COUNT = 7; // Number of 'v' presses needed
  const TRIGGER_WINDOW = 1500; // Time window in ms

  // Game state
  let gameActive = false;
  let gameContainer = null;
  let canvas = null;
  let ctx = null;
  let gameLoop = null;

  // Snake game variables
  let snake = [];
  let direction = { x: 0, y: 0 };
  let nextDirection = { x: 0, y: 0 };
  let food = { x: 0, y: 0 };
  let gridSize = 20;
  let tileCount = 25;
  let score = 0;
  let gameSpeed = 100;
  let isPaused = false;
  let gameOver = false;
  let gameStarted = false;

  // Listen for 'v' key presses
  document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'v' && !gameActive) {
      const now = Date.now();
      vPresses.push(now);
      
      // Remove old presses outside the time window
      vPresses = vPresses.filter(time => now - time < TRIGGER_WINDOW);
      
      // Check if we've hit the trigger count
      if (vPresses.length >= TRIGGER_COUNT) {
        vPresses = [];
        initGame();
      }
    }
  });

  function initGame() {
    if (gameActive) return;
    
    gameActive = true;
    createGameContainer();
    resetGame();
    startGameLoop();
  }

  function createGameContainer() {
    // Create overlay container
    gameContainer = document.createElement('div');
    gameContainer.id = 'snake-game-container';
    gameContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Urbanist', 'Courier New', monospace;
    `;

    // Create title
    const title = document.createElement('div');
    title.style.cssText = `
      color: #4ADE80;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
    `;
    title.textContent = '🐍 SNAKE GAME';

    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'snake-score';
    scoreDisplay.style.cssText = `
      color: #FFF;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    `;
    scoreDisplay.textContent = 'Score: 0';

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;
    canvas.style.cssText = `
      border: 3px solid #4ADE80;
      background: #1a1a1a;
      box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
      border-radius: 8px;
    `;
    ctx = canvas.getContext('2d');

    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      color: #AAA;
      font-size: 1rem;
      margin-top: 1.5rem;
      text-align: center;
      line-height: 1.6;
    `;
    instructions.innerHTML = `
      Press <span style="color: #4ADE80; font-weight: 600;">ARROW KEYS</span> to start and move<br>
      <span style="color: #4ADE80; font-weight: 600;">SPACE</span> to pause • <span style="color: #4ADE80; font-weight: 600;">ESC</span> to quit • <span style="color: #4ADE80; font-weight: 600;">R</span> to restart
    `;

    // Create game over message (hidden by default)
    const gameOverMsg = document.createElement('div');
    gameOverMsg.id = 'game-over-msg';
    gameOverMsg.style.cssText = `
      display: none;
      color: #FF6B6B;
      font-size: 2rem;
      font-weight: 700;
      margin-top: 1rem;
      text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
    `;
    gameOverMsg.textContent = 'GAME OVER!';

    // Append all elements
    gameContainer.appendChild(title);
    gameContainer.appendChild(scoreDisplay);
    gameContainer.appendChild(canvas);
    gameContainer.appendChild(instructions);
    gameContainer.appendChild(gameOverMsg);
    document.body.appendChild(gameContainer);

    // Add keyboard controls
    document.addEventListener('keydown', handleKeyPress);
  }

  function handleKeyPress(e) {
    if (!gameActive) return;

    switch(e.key) {
      case 'Escape':
        closeGame();
        break;
      case ' ':
        e.preventDefault();
        togglePause();
        break;
      case 'r':
      case 'R':
        if (gameOver) {
          resetGame();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!gameStarted) {
          gameStarted = true;
          nextDirection = { x: 0, y: -1 };
        } else if (direction.y === 0) {
          nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!gameStarted) {
          gameStarted = true;
          nextDirection = { x: 0, y: 1 };
        } else if (direction.y === 0) {
          nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (!gameStarted) {
          gameStarted = true;
          nextDirection = { x: -1, y: 0 };
        } else if (direction.x === 0) {
          nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!gameStarted) {
          gameStarted = true;
          nextDirection = { x: 1, y: 0 };
        } else if (direction.x === 0) {
          nextDirection = { x: 1, y: 0 };
        }
        break;
    }
  }

  function resetGame() {
    // Initialize snake in the middle
    snake = [
      { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) },
      { x: Math.floor(tileCount / 2) - 1, y: Math.floor(tileCount / 2) },
      { x: Math.floor(tileCount / 2) - 2, y: Math.floor(tileCount / 2) }
    ];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameSpeed = 100;
    isPaused = false;
    gameOver = false;
    gameStarted = false;
    
    placeFood();
    updateScore();
    
    const gameOverMsg = document.getElementById('game-over-msg');
    if (gameOverMsg) {
      gameOverMsg.style.display = 'none';
    }
  }

  function placeFood() {
    let validPosition = false;
    while (!validPosition) {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      // Check if food is not on snake
      validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  }

  function togglePause() {
    if (gameOver || !gameStarted) return;
    isPaused = !isPaused;
  }

  function updateScore() {
    const scoreDisplay = document.getElementById('snake-score');
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function startGameLoop() {
    let lastTime = 0;
    let accumulator = 0;

    function loop(currentTime) {
      if (!gameActive) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += deltaTime;

      while (accumulator >= gameSpeed) {
        if (!isPaused && !gameOver && gameStarted) {
          update();
        }
        accumulator -= gameSpeed;
      }

      draw();
      gameLoop = requestAnimationFrame(loop);
    }

    gameLoop = requestAnimationFrame(loop);
  }

  function update() {
    // Update direction
    direction = { ...nextDirection };

    // Calculate new head position
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      endGame();
      return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      score++;
      updateScore();
      placeFood();
      
      // Increase speed slightly with each food
      if (score % 5 === 0 && gameSpeed > 50) {
        gameSpeed -= 5;
      }
    } else {
      // Remove tail if no food eaten
      snake.pop();
    }
  }

  function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      // Gradient from head to tail
      const alpha = 1 - (index / snake.length) * 0.5;
      if (index === 0) {
        // Head - brighter green
        ctx.fillStyle = '#4ADE80';
      } else {
        ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
      }
      
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );

      // Add border to head
      if (index === 0) {
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
      }
    });

    // Draw food (apple)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add shine to apple
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2 - 2,
      food.y * gridSize + gridSize / 2 - 2,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px Urbanist, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    // Draw "waiting to start" overlay
    if (!gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#4ADE80';
      ctx.font = 'bold 36px Urbanist, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('READY?', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.fillStyle = '#AAA';
      ctx.font = '20px Urbanist, sans-serif';
      ctx.fillText('Press any arrow key to start', canvas.width / 2, canvas.height / 2 + 25);
    }
  }

  function endGame() {
    gameOver = true;
    const gameOverMsg = document.getElementById('game-over-msg');
    if (gameOverMsg) {
      gameOverMsg.style.display = 'block';
    }
  }

  function closeGame() {
    gameActive = false;
    isPaused = false;
    gameOver = false;
    
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
      gameLoop = null;
    }

    if (gameContainer && gameContainer.parentNode) {
      document.removeEventListener('keydown', handleKeyPress);
      gameContainer.remove();
      gameContainer = null;
      canvas = null;
      ctx = null;
    }
  }
})();

