const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const timerElement = document.getElementById("timer");

canvas.width = 400;
canvas.height = 700;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    size: 20,
    speed: 4,
    dx: 0,
    dy: 0
};

let enemies = [];
let score = 0;
let gameInterval;
let enemyInterval;
let isGameOver = false;

function drawPlayer() {
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y < 0) player.y = 0;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        enemy.x += enemy.dx;
        
        if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) {
            enemy.dx *= -1;
        }
        
        if (enemy.y > canvas.height) {
            enemies.splice(enemies.indexOf(enemy), 1);
            score++;
        }
    });
}

function spawnEnemy() {
    let numEnemies = Math.floor(Math.random() * 6) + 1; // number of enemies
    for (let i = 0; i < numEnemies; i++) {
        let x = Math.random() * (canvas.width - 20);
        let dx = (Math.random() - 0.5) * 4;
        let isBlue = Math.random() < 0.5;
        let enemy = {
            x: x,
            y: 0,
            size: 20,
            color: isBlue ? "#0000FF" : "#FF0000",
            speed: isBlue ? 6 : 3,
            dx: dx
        };
        enemies.push(enemy);
    }
}

function detectCollision() {
    enemies.forEach(enemy => {
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            endGame();
        }
    });
}

function updateTimer() {
    timerElement.textContent = `Time: ${score}`;
}

function gameLoop() {
    if (isGameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveEnemies();
    detectCollision();
    drawPlayer();
    drawEnemies();
    score++;
    updateTimer();
}

function startGame() {
    resetGameState();
    isGameOver = false;
    gameInterval = setInterval(gameLoop, 1000 / 60);
    enemyInterval = setInterval(spawnEnemy, 500); // enemy spawn rate
}

function resetGameState() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    enemies = [];
    score = 0;
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(enemyInterval);
    isGameOver = true;
    alert(`Peli loppu! sun pisteet: ${score}`);
    startGame();
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
    if (e.key === "ArrowUp") player.dy = -player.speed;
    if (e.key === "ArrowDown") player.dy = player.speed;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player.dy = 0;
});

startGame();
