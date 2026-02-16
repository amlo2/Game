const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-board');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = 20;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
];
let enemySnake = [
    { x: 5, y: 15 },
    { x: 5, y: 16 },
    { x: 5, y: 17 }
];
let enemyDx = 0;
let enemyDy = -1;
let food = { x: 5, y: 5 };
let gameInterval;
let gameRunning = false;
let changingDirection = false;

// Event Listeners
window.addEventListener('keydown', handleKeyDown);
document.getElementById('up-btn').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('down-btn').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('left-btn').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('right-btn').addEventListener('click', () => changeDirection(1, 0));
restartBtn.addEventListener('click', startGame);

function handleKeyDown(event) {
    const keyPressed = event.key;

    if (keyPressed === 'ArrowLeft' || keyPressed === 'a') changeDirection(-1, 0);
    if (keyPressed === 'ArrowUp' || keyPressed === 'w') changeDirection(0, -1);
    if (keyPressed === 'ArrowRight' || keyPressed === 'd') changeDirection(1, 0);
    if (keyPressed === 'ArrowDown' || keyPressed === 's') changeDirection(0, 1);
}

function changeDirection(newDx, newDy) {
    if (changingDirection) return;
    changingDirection = true;

    // Prevent 180 degree turns
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (newDx === 1 && !goingLeft) { dx = 1; dy = 0; }
    else if (newDx === -1 && !goingRight) { dx = -1; dy = 0; }
    else if (newDx === 0 && newDy === -1 && !goingDown) { dx = 0; dy = -1; }
    else if (newDx === 0 && newDy === 1 && !goingUp) { dx = 0; dy = 1; }
    else { changingDirection = false; } // Reset if no change made
}

function startGame() {
    score = 0;
    dx = 0;
    dy = -1; // Start moving up
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    enemySnake = [
        { x: 5, y: 15 },
        { x: 5, y: 16 },
        { x: 5, y: 17 }
    ];
    enemyDx = 0;
    enemyDy = -1;
    scoreElement.innerHTML = `Score: ${score}`;
    restartBtn.style.display = 'none';
    gameRunning = true;
    createFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(main, 150);
}

function main() {
    changingDirection = false;

    moveEnemySnake();

    if (didEnemyDie()) {
        gameRunning = false;
        clearInterval(gameInterval);
        restartBtn.style.display = 'block';
        alert(`You Win! The enemy snake crashed! Your score: ${score}`);
        return;
    }

    if (didGameEnd()) {
        gameRunning = false;
        clearInterval(gameInterval);
        restartBtn.style.display = 'block';
        alert(`Game Over! Your score: ${score}`);
        return;
    }

    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
    drawEnemySnake();
}

function moveEnemySnake() {
    const head = enemySnake[0];
    const possibleMoves = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ].filter(move => !(move.dx === -enemyDx && move.dy === -enemyDy)); // Prevent 180 turns

    const safeMoves = possibleMoves.filter(move => {
        const nextX = head.x + move.dx;
        const nextY = head.y + move.dy;
        if (nextX < 0 || nextX >= tileCount || nextY < 0 || nextY >= tileCount) return false;
        if (enemySnake.some(part => part.x === nextX && part.y === nextY)) return false;
        if (snake.some(part => part.x === nextX && part.y === nextY)) return false;
        return true;
    });

    const marginOfError = 0.08; // 8% chance to make a mistake
    const makeMistake = Math.random() < marginOfError;

    if (safeMoves.length > 0 && !makeMistake) {
        safeMoves.sort((a, b) => {
            const distA = Math.abs(head.x + a.dx - food.x) + Math.abs(head.y + a.dy - food.y);
            const distB = Math.abs(head.x + b.dx - food.x) + Math.abs(head.y + b.dy - food.y);
            return distA - distB;
        });
        enemyDx = safeMoves[0].dx;
        enemyDy = safeMoves[0].dy;
    } else if (possibleMoves.length > 0) {
        // Pick a random move from possible moves (may include unsafe ones)
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        enemyDx = randomMove.dx;
        enemyDy = randomMove.dy;
    }

    const newHead = { x: enemySnake[0].x + enemyDx, y: enemySnake[0].y + enemyDy };
    enemySnake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        createFood();
    } else {
        enemySnake.pop();
    }
}

function didEnemyDie() {
    const head = enemySnake[0];
    // Hit walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;

    // Hit itself
    for (let i = 1; i < enemySnake.length; i++) {
        if (enemySnake[i].x === head.x && enemySnake[i].y === head.y) return true;
    }

    // Hit player
    if (snake.some(part => part.x === head.x && part.y === head.y)) return true;

    return false;
}

function clearCanvas() {
    ctx.fillStyle = "#34495e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.strokeStyle = '#2c3e50';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

function drawEnemySnake() {
    enemySnake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#f1c40f' : '#f39c12';
        ctx.strokeStyle = '#2c3e50';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreElement.innerHTML = `Score: ${score}`;
        createFood();
    } else {
        snake.pop();
    }
}

function didGameEnd() {
    // Player hits self
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }

    // Player hits enemy
    if (enemySnake.some(part => part.x === snake[0].x && part.y === snake[0].y)) return true;

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > tileCount - 1;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > tileCount - 1;
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // Make sure food doesn't spawn on player snake
    let onSnake = snake.some(part => part.x === food.x && part.y === food.y);
    // Make sure food doesn't spawn on enemy snake
    let onEnemy = enemySnake.some(part => part.x === food.x && part.y === food.y);

    if (onSnake || onEnemy) createFood();
}

function drawFood() {
    ctx.fillStyle = "#e74c3c";
    ctx.strokeStyle = "#c0392b";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

startGame();
