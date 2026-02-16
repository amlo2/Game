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
    scoreElement.innerHTML = `Score: ${score}`;
    restartBtn.style.display = 'none';
    gameRunning = true;
    createFood();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(main, 150);
}

function main() {
    changingDirection = false;
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
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > tileCount - 1;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > tileCount - 1;
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // Make sure food doesn't spawn on snake
    snake.forEach(function isFoodOnSnake(part) {
        if (part.x === food.x && part.y === food.y) createFood();
    });
}

function drawFood() {
    ctx.fillStyle = "#e74c3c";
    ctx.strokeStyle = "#c0392b";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

startGame();
