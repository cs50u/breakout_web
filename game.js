// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 150,
  paddleHeight = 20,
  paddleSpeed = 6;
const ballSize = 20,
  ballSpeed = 2.0;
const brickHeight = 30,
  brickSpacing = 5;
const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

const paddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - paddleHeight - 10,
  width: paddleWidth,
  height: paddleHeight,
  dx: 0,
};
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 100,
  size: ballSize,
  speed: ballSpeed,
  dx: 2.5,
  dy: -2.5,
  moving: false,
};

const bricks = [];
function createBricks() {
  bricks.length = 0;

  const brickSpacing = 5;
  const maxColumns = Math.floor(
    (canvas.width + brickSpacing) / (60 + brickSpacing)
  ); // Allow exact fit
  const brickWidth = Math.floor(
    (canvas.width - brickSpacing * (maxColumns - 1)) / maxColumns
  );

  for (let row = 0; row < colors.length; row++) {
    for (let col = 0; col < maxColumns; col++) {
      bricks.push({
        x: col * (brickWidth + brickSpacing), // Start at 0, so no left gap
        y: row * (brickHeight + brickSpacing) + 50,
        width: brickWidth,
        height: brickHeight,
        color: colors[row],
      });
    }
  }
}

let gameState = "start";
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
  if (e.key === "ArrowRight") paddle.dx = paddleSpeed;
  if (e.key === "ArrowLeft") paddle.dx = -paddleSpeed;
  if (e.key === " ") {
    if (gameState === "start" || gameState === "paused") gameState = "playing";
    ball.moving = true;
  }
  if (e.key === "p") gameState = gameState === "paused" ? "playing" : "paused";
  if (e.key === "r") resetGame();
  if (e.key === "q") window.close();
}

function keyUp(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") paddle.dx = 0;
}

function update() {
  if (gameState === "playing") {
    paddle.x += paddle.dx;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width)
      paddle.x = canvas.width - paddle.width;

    if (ball.moving) {
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x <= 0 || ball.x + ball.size >= canvas.width) {
        ball.dx *= -1;
      }
      if (ball.y <= 0) ball.dy *= -1;

      if (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y + ball.size > paddle.y
      ) {
        ball.dy = -2.5;
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = 2.5 * (hitPos - 0.5) || 1;
      }

      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (
          ball.x < brick.x + brick.width &&
          ball.x + ball.size > brick.x &&
          ball.y < brick.y + brick.height &&
          ball.y + ball.size > brick.y
        ) {
          bricks.splice(i, 1);
          ball.dy *= -1;
          break;
        }
      }

      if (ball.y > canvas.height) gameState = "game_over";
      if (bricks.length === 0) gameState = "win";
    }
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.beginPath();
  ctx.arc(
    ball.x + ball.size / 2,
    ball.y + ball.size / 2,
    ball.size / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  bricks.forEach((brick) => {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  if (gameState === "start")
    ctx.fillText(
      "Press SPACE to start",
      canvas.width / 2 - 160,
      canvas.height / 2 + 40
    );
  if (gameState === "paused")
    ctx.fillText("PAUSED", canvas.width / 2 - 70, canvas.height / 2);
  if (gameState === "game_over")
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2 + 40);
  if (gameState === "win")
    ctx.fillText("YOU WIN!", canvas.width / 2 - 100, canvas.height / 2 + 40);
}

function resetGame() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2 + 100;
  ball.dx = Math.random() * 3 - 1.5; // Random horizontal speed
  ball.dy = 2.5; // Downward speed
  ball.moving = false;
  paddle.x = canvas.width / 2 - paddle.width / 2;
  createBricks();
  gameState = "start";
}

resetGame(); // Initialize the game
update(); // Start the loop
