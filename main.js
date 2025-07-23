const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const platformWidth = 30;
const platformCount = 200; // liczba słupów
const spacing =150;
const worldWidth = platformCount * spacing + 500;
const platforms = [];
const jumpSound = new Audio("sounds/jump.mp3");
const deathSound = new Audio("sounds/death.mp3");



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
  maxJumps: 9999
};

let cameraX = 0;
let score = 0;
let waitingToStart = true;
let isRunning = false;

let keys = {
  left: false,
  right: true,
  jump: false
};



function drawPlayer() {
  ctx.fillStyle = "Yellow";
  ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
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

function updateScore() {
  for (let platform of platforms) {
    if (!platform.passed && (player.x > platform.x + platform.width)) {
      score++;
      platform.passed = true;
      
      if (score % 5 === 0){
      player.speed += 0.1;
      }
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
    deathSound.currentTime = 0;
    deathSound.play();
  document.getElementById("resetBtn").style.display = "block";
}

function resetGame() {
  player.x = 50;
  player.y = 380;
  player.dx = 0;
  player.dy = 0;
  player.speed = 4;
  player.jumpCount = 0;
  cameraX = 0;
  gameOver = false;
  waitingToStart = true;

    platforms.length = 0;
  for (let i = 0; i < platformCount; i++) {
    const x = i * spacing + canvas.width /2;
const gap = 200;

const heightBottom = Math.floor(Math.random() * 150) + 50;
const heightTop = canvas.height - heightBottom - gap;

if (heightTop < 30) heightTop = 30;

const greenCapHeight = 10;

    platforms.push({
      x: x,
      y: canvas.height - heightBottom - greenCapHeight,
      width: platformWidth,
      height: heightBottom + greenCapHeight
    });

    platforms.push({
      x: x,
      y: 0,
      width: platformWidth,
      height: heightTop + greenCapHeight
    });

  }
  score = 0;
platforms.forEach(p => p.passed = false);


}



function drawPlatform() {
  platforms.forEach(platform => {
    const x = platform.x - cameraX;
    const y = platform.y;
    const w = platform.width;
    const h = platform.height;

    if (y === 0) {
      // górny komin - odwrócony
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.fillStyle = "#228B22";
      ctx.fillRect(-w / 2 - 5, -h / 2 - 10, w + 10, 10);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.stroke();

      ctx.restore();
    } else {
      // dolny komin - normalnie
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = "#228B22";
      ctx.fillRect(x - 5, y - 10, w + 10, 10);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
  });
}


function drawStartMessage() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Wciśnij SPACJĘ, aby rozpocząć.", canvas.width / 2 - 160, canvas.height / 2);
}
//Głośność skoku
jumpSound.volume = 0.05;

// Obsługa klawiszy

document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") {
    if (waitingToStart) {
      waitingToStart = false;
    } else {
      if (player.jumpCount < player.maxJumps) {
        player.dy = player.jumpForce;
        player.jumpCount++;
        jumpSound.currentTime = 0;
        jumpSound.play();
      }
    }
  }
});

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space' && document.activeElement.tagName === 'BUTTON') {
    event.preventDefault();
  }
});

let botEnabled = false; 

const toggleBotBtn = document.getElementById("toggleBotBtn");

toggleBotBtn.addEventListener("click", () => {
  botEnabled = !botEnabled;
  toggleBotBtn.textContent = botEnabled ? "Wyłącz bota" : "Włącz bota";
});


function botController() {
  if (!botEnabled || gameOver || waitingToStart) return;

  const lookahead = 140;

  // Skok przy dolnej przeszkodzie (kominie dolnym)
  const nextBottomObstacle = platforms.find(p =>
    p.x > player.x && p.x - player.x < lookahead && p.y > 0
  );

  if (nextBottomObstacle) {
    const gapTop = nextBottomObstacle.y;
    const playerCenterY = player.y + player.height / 2;

    if (playerCenterY > gapTop - 50 && player.jumpCount < player.maxJumps) {
      player.dy = player.jumpForce;
      player.jumpCount++;
      jumpSound.currentTime = 0;
      jumpSound.play();
      return;
    }
  }

  // Skok gdy za blisko do dołu mapy 
  const floorThreshold = canvas.height - player.height - 20;
  if (player.y > floorThreshold && player.jumpCount < player.maxJumps) {
    player.dy = player.jumpForce;
    player.jumpCount++;
    jumpSound.currentTime = 0;
    jumpSound.play();
    return;
  }
}




// Pętla gry
function update() {
  if (gameOver) return;
  if (!isRunning) isRunning = true;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (waitingToStart) {
    drawPlatform();
    drawPlayer();
    drawStartMessage();
    requestAnimationFrame(update);
    return;
  }

  botController();

  movement();
  applyGravity();
  handleCollisions();
  updateCamera();
  drawPlatform();
  drawPlayer();
  updateScore();
  drawScore();

  requestAnimationFrame(update);
}



document.getElementById("resetBtn").addEventListener("click", resetGame);



resetGame();


update();

