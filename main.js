const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const platformWidth = 30;
const platformCount = 200; // liczba słupów
const spacing =150;
const worldWidth = platformCount * spacing + 500;
const platforms = [];

let player = {
  x: 50,
  y: 200,
  width: 30,
  height: 40,
  dx: 0,
  dy: 0,
  grounded: false,
  speed: 4,
  jumpForce: -10,
  jumpCount: 0,
  maxJumps: 0
};

let cameraX = 0;
let score = 0;

let keys = {
  left: false,
  right: true,
  jump: false
};

function drawPlayer() {
  ctx.fillStyle = "Yellow";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}


function drawPlayer() {
  ctx.fillStyle = "Yellow";
  ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Punkty: " + score, 20, 30);
}

function updateCamera() {
  const center = canvas.width / 2;
  if (player.x > center) {
    cameraX = player.x - center;
  } else {
    cameraX = 0;
  }

  // Ograniczenie maksymalne
  const maxScroll = worldWidth - canvas.width;
  if (cameraX > maxScroll) {
    cameraX = maxScroll;
  }
}




function handleCollisions() {
  player.grounded = false;

  for (let platform of platforms) {
    const colliding =
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y < platform.y + platform.height &&
      player.y + player.height > platform.y;

 if (colliding) {
  // Każde zderzenie z platformą kończy grę
  endGame();
  return;
}

  }
  // Kolizja z górną krawędzią mapy
if (player.y < 0) {
 endGame();
  return;
}


  // Podłoga
  if (player.y + player.height >= canvas.height) {
  endGame();
  return;
  }
}





function applyGravity() {
  if (!player.grounded) {
    if (player.dy < 0) {
      // Wznoszenie — mniejsza grawitacja, np. 0.3
      player.dy += 0.6;
    } else {
      // Opadanie — większa grawitacja, np. 0.7
      player.dy += 0.35;
    }
  }

  player.y += player.dy;
}



function movement() {
  player.dx = 0;

  if (keys.left) {
    player.dx = -player.speed;
  }
  if (keys.right) {
    player.dx = player.speed;
  }
  player.x += player.dx;

  // Zatrzymanie gracza na krawędziach canvasu

if (player.x + player.width > worldWidth) {
  player.x = worldWidth - player.width;
}

}

let gameOver = false;

function update() {

  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movement();
  applyGravity();
  handleCollisions();

  updateCamera();

  drawPlatform();
  drawPlayer();
  requestAnimationFrame(update);
  updateScore();
drawScore();

}

function updateScore() {
  for (let platform of platforms) {
    if (!platform.passed && (player.x > platform.x + platform.width)) {
      score++;
      platform.passed = true;
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Punkty: " + (score / 2), 20, 30);
}


function endGame() {
  gameOver = true;
  document.getElementById("resetBtn").style.display = "block";
}

function resetGame() {
  player.x = 50;
  player.y = 380;
  player.dx = 0;
  player.dy = 0;
  player.jumpCount = 0;
  cameraX = 0;
  gameOver = false;
  document.getElementById("resetBtn").style.display = "none";

    platforms.length = 0;
  for (let i = 0; i < platformCount; i++) {
    const x = i * spacing + canvas.width /2;
const gap = 200;

const heightBottom = Math.floor(Math.random() * 150) + 50;
const heightTop = canvas.height - heightBottom - gap;

if (heightTop < 30) heightTop = 30;

    platforms.push({
      x: x,
      y: canvas.height - heightBottom,
      width: platformWidth,
      height: heightBottom
    });

    platforms.push({
      x: x,
      y: 0,
      width: platformWidth,
      height: heightTop
    });

  }
  score = 0;
platforms.forEach(p => p.passed = false);


  update();
}


function drawPlatform() {
  ctx.fillStyle = "green";
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
  });
}




// Obsługa klawiszy
document.addEventListener("keydown", (e) => {
  if ((e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space")) {
    player.dy = player.jumpForce;
    player.jumpCount++;
  }
});


document.getElementById("resetBtn").addEventListener("click", resetGame);



resetGame();

update();
