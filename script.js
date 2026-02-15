/* ============================= */
/* 🎮 VARIABLES Y ELEMENTOS DOM */
/* ============================= */

const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const gameOverText = document.getElementById("gameOver");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

/* ============================= */
/* 🎯 VARIABLES DEL JUEGO */
/* ============================= */

let score = 0;
let speed = 3;
let level = 1;
let obstacleSpawnRate = 1000;
let gameActive = false;

let obstacleInterval;
let scoreInterval;

/* ============================= */
/* 🎨 COLORES POR NIVEL */
/* ============================= */

const levelBackgrounds = ["#111","#0d1b2a","#1b263b","#240046","#3a0ca3","#560bad","#9d0208"];
const levelShadows = [
  "0 0 40px rgba(255,255,255,0.6)",
  "0 0 60px rgba(0,150,255,0.9)",
  "0 0 70px rgba(0,255,150,0.9)",
  "0 0 80px rgba(255,0,255,0.9)",
  "0 0 90px rgba(255,140,0,0.9)",
  "0 0 100px rgba(255,255,0,0.9)",
  "0 0 120px rgba(255,0,0,1)"
];

/* ============================= */
/* 🔘 BOTONES */
/* ============================= */

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
exitBtn.addEventListener("click", endGame);

/* ============================= */
/* 🚀 INICIAR JUEGO */
/* ============================= */

function startGame() {
  resetGame();
  gameActive = true;

  // Intervalo que crea obstáculos constantemente
  obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);

  // Intervalo que aumenta puntaje
  scoreInterval = setInterval(() => {
    score++;
    scoreDisplay.textContent = score;
    checkLevelUp();
  }, 200);
}

/* ============================= */
/* 📈 SUBIR NIVEL */
/* ============================= */

function checkLevelUp() {
  let newLevel = Math.floor(score / 100) + 1;

  if (newLevel !== level) {
    level = newLevel;
    levelDisplay.textContent = level;

    // Aumenta dificultad
    speed += 1;
    obstacleSpawnRate = Math.max(300, obstacleSpawnRate - 100);

    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);

    changeVisuals();
  }
}

/* ============================= */
/* 🎨 CAMBIO VISUAL POR NIVEL */
/* ============================= */

function changeVisuals() {
  const index = level % levelBackgrounds.length;

  // Cambia fondo
  game.style.background = levelBackgrounds[index];

  // Cambia sombra
  game.style.boxShadow = levelShadows[index];
}

/* ===================================================== */
/* 🎮 CONTROL TECLADO (SOLO FUNCIONA EN PC) */
/* ===================================================== */

document.addEventListener("keydown", (e) => {
  if (!gameActive) return;

  const gameWidth = game.clientWidth;
  const playerWidth = player.offsetWidth;
  let currentLeft = player.offsetLeft;

  // Flecha izquierda
  if (e.key === "ArrowLeft") {
    currentLeft -= gameWidth * 0.05;
  }

  // Flecha derecha
  if (e.key === "ArrowRight") {
    currentLeft += gameWidth * 0.05;
  }

  // Evita que salga del área
  currentLeft = Math.max(0, Math.min(gameWidth - playerWidth, currentLeft));

  player.style.left = currentLeft + "px";
});

/* ===================================================== */
/* 📱 CONTROL MÓVIL (FUNCIONA CON EL DEDO) */
/* ===================================================== */

let isTouching = false;

// Cuando el usuario toca la pantalla
game.addEventListener("touchstart", () => {
  if (!gameActive) return;
  isTouching = true;
});

// Cuando deja de tocar
game.addEventListener("touchend", () => {
  isTouching = false;
});

// Cuando mueve el dedo
game.addEventListener("touchmove", (e) => {
  if (!gameActive || !isTouching) return;

  e.preventDefault(); // Evita que la pantalla haga scroll

  const touch = e.touches[0];
  const rect = game.getBoundingClientRect();

  const gameWidth = game.clientWidth;
  const playerWidth = player.offsetWidth;

  // Centra el jugador donde está el dedo
  let newLeft = touch.clientX - rect.left - playerWidth / 2;

  newLeft = Math.max(0, Math.min(gameWidth - playerWidth, newLeft));

  player.style.left = newLeft + "px";

}, { passive: false });

/* ===================================================== */
/* 🚧 CREACIÓN Y MOVIMIENTO DE OBSTÁCULOS */
/* ===================================================== */

function createObstacle() {
  if (!gameActive) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  const gameWidth = game.clientWidth;
  const obstacleWidth = gameWidth * 0.08;

  // Posición aleatoria horizontal
  let obstacleX = Math.random() * (gameWidth - obstacleWidth);
  obstacle.style.left = obstacleX + "px";
  obstacle.style.top = "0px";

  game.appendChild(obstacle);

  let obstacleY = 0;

  const fall = setInterval(() => {

    if (!gameActive) {
      clearInterval(fall);
      obstacle.remove();
      return;
    }

    // Movimiento hacia abajo
    obstacleY += speed;
    obstacle.style.top = obstacleY + "px";

    /* 🎯 DETECCIÓN DE COLISIÓN */
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      obstacleRect.bottom > playerRect.top &&
      obstacleRect.left < playerRect.right &&
      obstacleRect.right > playerRect.left
    ) {
      endGame();
    }

    // Si sale de pantalla
    if (obstacleY > game.clientHeight) {
      clearInterval(fall);
      obstacle.remove();
    }

  }, 20);
}

/* ============================= */
/* 💀 FIN DEL JUEGO */
/* ============================= */

function endGame() {
  gameActive = false;
  clearInterval(obstacleInterval);
  clearInterval(scoreInterval);
  gameOverText.textContent = "GAME OVER";
}

/* ============================= */
/* 🔄 RESET */
/* ============================= */

function resetGame() {

  clearInterval(obstacleInterval);
  clearInterval(scoreInterval);

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  score = 0;
  speed = 3;
  level = 1;
  obstacleSpawnRate = 1000;

  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  gameOverText.textContent = "";

  game.style.background = levelBackgrounds[0];
  game.style.boxShadow = levelShadows[0];

  player.style.left = "45%";
}
