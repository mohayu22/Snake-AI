const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Calculate canvas size with padding
const padding = 20;
const canvasWidth = window.innerWidth - padding * 2;
const canvasHeight = window.innerHeight - padding * 2;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const gridSize = 20;
const rows = Math.floor(canvasHeight / gridSize);
const cols = Math.floor(canvasWidth / gridSize);

let snake;
let food;
let direction;
let gameLoop;

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        startGame();
    }
});

function startGame() {
    snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    direction = { x: 0, y: 0 };
    placeFood();
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 50); // Increased interval for smoother performance
}

function placeFood() {
    let validFoodPosition = false;
    while (!validFoodPosition) {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        validFoodPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function aStarPathfinding(start, goal) {
    const openSet = [start];
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(start, 0);

    const fScore = new Map();
    fScore.set(start, heuristic(start, goal));

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.indexOf(current), 1);

        for (let neighbor of getNeighbors(current)) {
            const tentativeGScore = gScore.get(current) + 1;
            if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return null;
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        path.unshift(current);
    }
    return path;
}

function getNeighbors(node) {
    const possibleDirections = [
        { x: 0, y: -1 }, // up
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
        { x: 1, y: 0 }   // right
    ];

    return possibleDirections.map(direction => ({
        x: node.x + direction.x,
        y: node.y + direction.y
    })).filter(neighbor => 
        neighbor.x >= 0 && neighbor.x < cols &&
        neighbor.y >= 0 && neighbor.y < rows &&
        !snake.some((segment, index) => index > 0 && segment.x === neighbor.x && segment.y === neighbor.y)
    );
}

function getBestMove() {
    const start = snake[0];
    const path = aStarPathfinding(start, food);

    if (path && path.length > 1) {
        const nextStep = path[1];
        return { x: nextStep.x - start.x, y: nextStep.y - start.y };
    }

    // If no valid path, continue in the current direction or a default direction
    return direction;
}

function updateGame() {
    direction = getBestMove();

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check if the snake hits the boundary or itself
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameLoop);
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.fillStyle = '#f0f0f0'; // Match background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    ctx.fillStyle = 'green';
    for (const segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
}

startGame();
