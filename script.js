const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-board');
const restartBtn = document.getElementById('restart-btn');
const selectionScreen = document.getElementById('selection-screen');
const modeScreen = document.getElementById('mode-screen');
const gameUI = document.getElementById('game-ui');
const startBtn = document.getElementById('start-btn');
const modeNextBtn = document.getElementById('mode-next-btn');
const snakeOptions = document.querySelectorAll('.snake-option');
const modeOptions = document.querySelectorAll('.mode-option');

const gridSize = 20;
const tileCount = 20;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [];
let gameInterval;
let gameRunning = false;
let changingDirection = false;

const snakeTypes = {
    balanced: {
        colorHead: '#4ecca3',
        colorBody: '#45b293',
        speed: 150,
        scoreMult: 1,
        initialSize: 3
    },
    speed: {
        colorHead: '#3498db',
        colorBody: '#2980b9',
        speed: 80,
        scoreMult: 1,
        initialSize: 3
    },
    score: {
        colorHead: '#9b59b6',
        colorBody: '#8e44ad',
        speed: 180,
        scoreMult: 2,
        initialSize: 3
    },
    ghost: {
        colorHead: '#ecf0f1',
        colorBody: '#bdc3c7',
        speed: 150,
        scoreMult: 1,
        initialSize: 1
    }
};

let selectedType = 'balanced';
let selectedMode = 'normal';

const images = {
    apple: new Image(),
    snakeHeadGreen: new Image(),
    snakeHeadBlue: new Image(),
    snakeHeadPurple: new Image(),
    snakeHeadWhite: new Image(),
    snakeBodyGreen: new Image(),
    snakeBodyBlue: new Image(),
    snakeBodyPurple: new Image(),
    snakeBodyWhite: new Image(),
    enemyHead: new Image(),
    enemyBody: new Image(),
    obstacle: new Image(),
    portal1: new Image(),
    portal2: new Image()
};

images.apple.src = 'https://img.icons8.com/color/48/apple.png';
images.snakeHeadGreen.src = 'https://img.icons8.com/color/48/snake.png';
images.snakeHeadBlue.src = 'https://img.icons8.com/color/48/anaconda.png';
images.snakeHeadPurple.src = 'https://img.icons8.com/color/48/dragon.png';
images.snakeHeadWhite.src = 'https://img.icons8.com/color/48/ghost.png';
images.snakeBodyGreen.src = 'https://img.icons8.com/emoji/48/green-circle-emoji.png';
images.snakeBodyBlue.src = 'https://img.icons8.com/emoji/48/blue-circle-emoji.png';
images.snakeBodyPurple.src = 'https://img.icons8.com/emoji/48/purple-circle-emoji.png';
images.snakeBodyWhite.src = 'https://img.icons8.com/emoji/48/white-circle-emoji.png';
images.enemyHead.src = 'https://img.icons8.com/color/48/python.png';
images.enemyBody.src = 'https://img.icons8.com/emoji/48/orange-circle-emoji.png';
images.obstacle.src = 'https://img.icons8.com/color/48/brick.png';
images.portal1.src = 'https://img.icons8.com/color/48/spiral.png';
images.portal2.src = 'https://img.icons8.com/color/48/spiral.png';

// Game state for modes
let enemies = [];
let foods = [];
let obstacles = [];
let portals = [];

// Event Listeners
window.addEventListener('keydown', handleKeyDown);
document.getElementById('up-btn').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('down-btn').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('left-btn').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('right-btn').addEventListener('click', () => changeDirection(1, 0));

restartBtn.addEventListener('click', () => {
    gameUI.style.display = 'none';
    modeScreen.style.display = 'flex';
});

modeOptions.forEach(option => {
    option.addEventListener('click', () => {
        modeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedMode = option.dataset.mode;
    });
});

modeNextBtn.addEventListener('click', () => {
    modeScreen.style.display = 'none';
    selectionScreen.style.display = 'flex';
});

snakeOptions.forEach(option => {
    option.addEventListener('click', () => {
        snakeOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedType = option.dataset.type;
    });
});

startBtn.addEventListener('click', startGame);

// Initialize selection
document.querySelector('[data-type="balanced"]').classList.add('selected');
document.querySelector('[data-mode="normal"]').classList.add('selected');

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
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    if (newDx === 1 && !goingLeft) { dx = 1; dy = 0; }
    else if (newDx === -1 && !goingRight) { dx = -1; dy = 0; }
    else if (newDx === 0 && newDy === -1 && !goingDown) { dx = 0; dy = -1; }
    else if (newDx === 0 && newDy === 1 && !goingUp) { dx = 0; dy = 1; }
    else { changingDirection = false; }
}

function startGame() {
    const config = snakeTypes[selectedType];
    score = 0;
    dx = 0;
    dy = -1;
    snake = [];
    for (let i = 0; i < config.initialSize; i++) {
        snake.push({ x: 10, y: 10 + i });
    }
    enemies = [];
    foods = [];
    obstacles = [];
    portals = [];

    if (selectedMode === 'open') {
        for (let i = 0; i < 3; i++) {
            enemies.push({
                body: [{ x: 5 + i * 5, y: 15 }, { x: 5 + i * 5, y: 16 }, { x: 5 + i * 5, y: 17 }],
                dx: 0, dy: -1, dead: false
            });
        }
        for (let i = 0; i < 5; i++) createFood();
    } else {
        enemies.push({
            body: [{ x: 5, y: 15 }, { x: 5, y: 16 }, { x: 5, y: 17 }],
            dx: 0, dy: -1, dead: false
        });
        createFood();
    }

    if (selectedMode === 'obstacles') {
        for (let i = 0; i < 10; i++) {
            let obsX, obsY;
            do {
                obsX = Math.floor(Math.random() * tileCount);
                obsY = Math.floor(Math.random() * tileCount);
            } while (isOccupied(obsX, obsY));
            obstacles.push({ x: obsX, y: obsY });
        }
    }

    if (selectedMode === 'portals') {
        for (let i = 0; i < 2; i++) {
            let p1, p2;
            do { p1 = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) }; } while (isOccupied(p1.x, p1.y));
            do { p2 = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) }; } while (isOccupied(p2.x, p2.y));
            portals.push({ p1, p2 });
        }
    }

    scoreElement.innerHTML = `Score: ${score}`;
    selectionScreen.style.display = 'none';
    modeScreen.style.display = 'none';
    gameUI.style.display = 'flex';
    restartBtn.style.display = 'none';
    gameRunning = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(main, config.speed);
}

function isOccupied(x, y) {
    if (snake.some(p => p.x === x && p.y === y)) return true;
    if (enemies.some(e => e.body.some(p => p.x === x && p.y === y))) return true;
    if (foods.some(f => f.x === x && f.y === y)) return true;
    if (obstacles.some(o => o.x === x && o.y === y)) return true;
    if (portals.some(p => (p.p1.x === x && p.p1.y === y) || (p.p2.x === x && p.p2.y === y))) return true;
    return false;
}

function main() {
    changingDirection = false;
    enemies.forEach(moveEnemySnake);
    if (didAnyEnemyDie()) {
        gameRunning = false;
        clearInterval(gameInterval);
        restartBtn.style.display = 'block';
        alert(`You Win! An enemy snake crashed! Your score: ${score}`);
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
    drawObstacles();
    drawPortals();
    drawFoods();
    advanceSnake();
    drawSnake();
    drawEnemies();
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.drawImage(images.obstacle, obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
    });
}

function drawPortals() {
    portals.forEach(p => {
        ctx.drawImage(images.portal1, p.p1.x * gridSize, p.p1.y * gridSize, gridSize, gridSize);
        ctx.drawImage(images.portal2, p.p2.x * gridSize, p.p2.y * gridSize, gridSize, gridSize);
    });
}

function drawFoods() {
    foods.forEach(drawFoodAt);
}

function drawFoodAt(food) {
    ctx.drawImage(images.apple, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function drawEnemies() {
    enemies.forEach(drawEnemySnake);
}

function moveEnemySnake(enemy) {
    if (enemy.dead) return;
    const head = enemy.body[0];
    const possibleMoves = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ].filter(move => !(move.dx === -enemy.dx && move.dy === -enemy.dy));
    const safeMoves = possibleMoves.filter(move => {
        let nextX = head.x + move.dx;
        let nextY = head.y + move.dy;
        if (selectedMode === 'open') {
            nextX = (nextX + tileCount) % tileCount;
            nextY = (nextY + tileCount) % tileCount;
        } else {
            if (nextX < 0 || nextX >= tileCount || nextY < 0 || nextY >= tileCount) return false;
        }
        if (obstacles.some(o => o.x === nextX && o.y === nextY)) return false;
        if (enemies.some(e => e.body.some(part => part.x === nextX && part.y === nextY))) return false;
        if (snake.some(part => part.x === nextX && part.y === nextY)) return false;
        return true;
    });
    const marginOfError = 0.08;
    const makeMistake = Math.random() < marginOfError;
    let nearestFood = foods[0];
    if (foods.length > 1) {
        let minDist = Infinity;
        foods.forEach(f => {
            const d = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
            if (d < minDist) { minDist = d; nearestFood = f; }
        });
    }
    if (safeMoves.length > 0 && !makeMistake && nearestFood) {
        safeMoves.sort((a, b) => {
            const nextAX = (head.x + a.dx + tileCount) % tileCount;
            const nextAY = (head.y + a.dy + tileCount) % tileCount;
            const nextBX = (head.x + b.dx + tileCount) % tileCount;
            const nextBY = (head.y + b.dy + tileCount) % tileCount;
            const distA = Math.abs(nextAX - nearestFood.x) + Math.abs(nextAY - nearestFood.y);
            const distB = Math.abs(nextBX - nearestFood.x) + Math.abs(nextBY - nearestFood.y);
            return distA - distB;
        });
        enemy.dx = safeMoves[0].dx;
        enemy.dy = safeMoves[0].dy;
    } else if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        enemy.dx = randomMove.dx;
        enemy.dy = randomMove.dy;
    }
    let newHead = { x: enemy.body[0].x + enemy.dx, y: enemy.body[0].y + enemy.dy };
    if (selectedMode === 'open') {
        newHead.x = (newHead.x + tileCount) % tileCount;
        newHead.y = (newHead.y + tileCount) % tileCount;
    }
    if (selectedMode === 'portals') {
        portals.forEach(p => {
            if (newHead.x === p.p1.x && newHead.y === p.p1.y) newHead = { x: p.p2.x, y: p.p2.y };
            else if (newHead.x === p.p2.x && newHead.y === p.p2.y) newHead = { x: p.p1.x, y: p.p1.y };
        });
    }
    enemy.body.unshift(newHead);
    const foodIndex = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (foodIndex !== -1) {
        foods.splice(foodIndex, 1);
        createFood();
    } else {
        enemy.body.pop();
    }
}

function didAnyEnemyDie() {
    return enemies.some(enemy => {
        if (enemy.dead) return false;
        const head = enemy.body[0];
        if (selectedMode !== 'open') {
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
        }
        if (obstacles.some(o => o.x === head.x && o.y === head.y)) return true;
        for (let i = 1; i < enemy.body.length; i++) {
            if (enemy.body[i].x === head.x && enemy.body[i].y === head.y) return true;
        }
        if (enemies.some(e => e !== enemy && e.body.some(p => p.x === head.x && p.y === head.y))) return true;
        if (snake.some(part => part.x === head.x && part.y === head.y)) return true;
        return false;
    });
}

function clearCanvas() {
    ctx.fillStyle = "#0f3460";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(233, 69, 96, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize); ctx.stroke();
    }
}

function drawRoundedRect(x, y, size, radius, fillStyle, strokeStyle) {
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawSnake() {
    const config = snakeTypes[selectedType];
    let bodyImage, headImage;
    switch(selectedType) {
        case 'speed':
            bodyImage = images.snakeBodyBlue;
            headImage = images.snakeHeadBlue;
            break;
        case 'score':
            bodyImage = images.snakeBodyPurple;
            headImage = images.snakeHeadPurple;
            break;
        case 'ghost':
            bodyImage = images.snakeBodyWhite;
            headImage = images.snakeHeadWhite;
            break;
        default:
            bodyImage = images.snakeBodyGreen;
            headImage = images.snakeHeadGreen;
    }

    snake.forEach((part, index) => {
        const isHead = index === 0;
        if (isHead) {
            drawRotatedImage(headImage, part.x, part.y, dx, dy);
        } else {
            // Tint the body if possible, but for now just use the image
            ctx.drawImage(bodyImage, part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        }
    });
}

function drawEnemySnake(enemy) {
    if (enemy.dead) return;
    enemy.body.forEach((part, index) => {
        const isHead = index === 0;
        if (isHead) {
            drawRotatedImage(images.enemyHead, part.x, part.y, enemy.dx, enemy.dy);
        } else {
            ctx.drawImage(images.enemyBody, part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        }
    });
}

function drawRotatedImage(image, x, y, currentDx, currentDy) {
    ctx.save();
    ctx.translate((x + 0.5) * gridSize, (y + 0.5) * gridSize);

    let angle = 0;
    if (currentDx === 1) angle = Math.PI / 2;
    else if (currentDx === -1) angle = -Math.PI / 2;
    else if (currentDy === 1) angle = Math.PI;
    else angle = 0; // Up is 0

    ctx.rotate(angle);
    ctx.drawImage(image, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
}


function advanceSnake() {
    let newHead = { x: snake[0].x + dx, y: snake[0].y + dy };
    if (selectedMode === 'open') {
        newHead.x = (newHead.x + tileCount) % tileCount;
        newHead.y = (newHead.y + tileCount) % tileCount;
    }
    if (selectedMode === 'portals') {
        portals.forEach(p => {
            if (newHead.x === p.p1.x && newHead.y === p.p1.y) newHead = { x: p.p2.x, y: p.p2.y };
            else if (newHead.x === p.p2.x && newHead.y === p.p2.y) newHead = { x: p.p1.x, y: p.p1.y };
        });
    }
    snake.unshift(newHead);
    const foodIndex = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (foodIndex !== -1) {
        foods.splice(foodIndex, 1);
        const config = snakeTypes[selectedType];
        score += 10 * config.scoreMult;
        scoreElement.innerHTML = `Score: ${score}`;
        createFood();
    } else {
        snake.pop();
    }
}

function didGameEnd() {
    const head = snake[0];
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    if (enemies.some(e => e.body.some(part => part.x === head.x && part.y === head.y))) return true;
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) return true;
    if (selectedMode !== 'open') {
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    }
    return false;
}

function createFood() {
    let newFood;
    let valid = false;
    while (!valid) {
        newFood = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        valid = !isOccupied(newFood.x, newFood.y);
    }
    foods.push(newFood);
}
