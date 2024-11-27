const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const timerElement = document.getElementById("timer");
const highscoreElement = document.getElementById("highscore")
const lastscoreElement = document.getElementById("lastscore");

canvas.width = 400;
canvas.height = 700;


function updateHighScore() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
    }
    highscoreElement.textContent = `Highscore: ${highscore}`;
}

function updateLastScore() {
    lastscore = score;
    localStorage.setItem("lastscore", lastscore); // Vapaaehtoinen tallennus
    document.getElementById("lastscore").textContent = `Last Score: ${lastscore}`;
}


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
let highscore = 0; //highscore
let lastscore = 0;
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
        if (enemy.color === "#FFFFFF") {
            // Valkoinen vihollinen liikkuu vaakasuunnassa
            enemy.x += enemy.dx;

            // Poistetaan valkoinen vihollinen, kun se menee ulos kanvaksesta
            if (enemy.x < -enemy.size || enemy.x > canvas.width + enemy.size) {
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        } else {
            // Muut viholliset liikkuvat pystysuunnassa
            enemy.y += enemy.speed;
            enemy.x += enemy.dx;

            // Kimmoke reunoista (vain siniset ja punaiset)
            if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) {
                enemy.dx *= -1;
            }

            // Poistetaan vihollinen, kun se poistuu kanvaksen alareunasta
            if (enemy.y > canvas.height) {
                enemies.splice(enemies.indexOf(enemy), 1);
                score++;
            }
        }
    });
}


function spawnEnemy() {
    let numEnemies = Math.floor(Math.random() * 6) + 1; // number of enemies
    for (let i = 0; i < numEnemies; i++) {
        let x = Math.random() * (canvas.width - 20);
        let dx = (Math.random() - 0.5) * 4; // vaakasuuntainen nopeus
        let isBlue = Math.random() < 0.4; // Siniset ovat harvinaisempia kuin punaiset
        let isWhite = Math.random() < 0.1; // Valkoiset viholliset ovat hyvin harvinaisia

        if (isWhite) {
            // Valkoisen vihollisen ominaisuudet
            let startX = Math.random() < 0.5 ? 0 : canvas.width - 20; // Alkaa vasemmalta tai oikealta
            let horizontalSpeed = Math.random() * 2 + 2; // Vaakasuuntainen nopeus 2–4
            let direction = startX === 0 ? 1 : -1; // Liikesuunta: oikealle (1) tai vasemmalle (-1)

            let whiteEnemy = {
                x: startX,
                y: Math.random() * (canvas.height - 20), // Satunnainen korkeus
                size: 20,
                color: "#FFFFFF",
                speed: horizontalSpeed * direction, // Vaakasuuntainen liike
                dx: horizontalSpeed * direction // Liike nopeus ja suunta
            };
            enemies.push(whiteEnemy);
        } else {
            // Muut viholliset (siniset ja punaiset)
            let verticalSpeed = isBlue
                ? Math.floor(Math.random() * 3) + 7 // Sininen: 7–9
                : Math.floor(Math.random() * 3) + 3; // Punainen: 3–5

            let enemy = {
                x: x,
                y: 0,
                size: 20,
                color: isBlue ? "#0000FF" : "#FF0000",
                speed: verticalSpeed, // pystysuuntainen nopeus
                dx: dx
            };
            enemies.push(enemy);
        }
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
    enemyInterval = setInterval(spawnEnemy, 500); //enemy spawn rate speed
}

function resetGameState() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    enemies = [];
    score = 0;
    highscore = localStorage.getItem("highscore") || 0;
    highscoreElement.textContent = `Highscore: ${highscore}`;
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(enemyInterval);
    isGameOver = true;
    updateHighScore();
    updateLastScore();
    timerElement.textContent = "Game Over! Press R to Restart.";
}

// Kuuntele näppäimistöä pelin ohjaamiseen
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") player.dx = -player.speed;
    if (e.key === "ArrowRight" || e.key === "d") player.dx = player.speed;
    if (e.key === "ArrowUp" || e.key === "w") player.dy = -player.speed;
    if (e.key === "ArrowDown" || e.key === "s") player.dy = player.speed;

    if (e.key === "Shift") {
        // Kasvata nopeutta tomii oudosti
        player.speed *= 2;
    }

    // Tarkista, painaako pelaaja "R"-näppäintä
    if ((e.key === "r" || e.key === "R" || e.key === "Enter") && isGameOver) {
        startGame();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player.dy = 0;

    if (e.key === "a" || e.key === "d") player.dx = 0;
    if (e.key === "w" || e.key === "s") player.dy = 0;
    if (e.key === "Shift") {
        // Palauta normaali nopeus tomii oudosti
        player.speed /= 2;
    }
});

// Aloita peli automaattisesti
startGame();
