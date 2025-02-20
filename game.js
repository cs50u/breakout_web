// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 100,
  paddleHeight = 20,
  paddleSpeed = 6;
const ballSize = 20,
  ballSpeed = 3;
const brickWidth = 60,
  brickHeight = 30,
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
  dx: 3,
  dy: -3,
  moving: false,
};

const bricks = [];
function createBricks() {
  bricks.length = 0;
  const brickAreaWidth = Math.floor(canvas.width - brickSpacing);
  const brickColumns = Math.floor(brickAreaWidth / (brickWidth + brickSpacing));
  for (let row = 0; row < colors.length; row++) {
    for (let col = 0; col < brickColumns; col++) {
      bricks.push({
        x: col * (brickWidth + brickSpacing) + brickSpacing,
        y: row * (brickHeight + brickSpacing) + 50,
        width: brickWidth,
        height: brickHeight,
        color: colors[row],
      });
    }
  }
}
createBricks();

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
        ball.x = Math.max(
          ball.size / 2,
          Math.min(ball.x, canvas.width - ball.size / 2)
        );
      }
      if (ball.y <= 0) ball.dy *= -1;

      if (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y + ball.size > paddle.y
      ) {
        ball.dy = -3; // Fixed speed
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = 3 * (hitPos - 0.5) || 1; // Prevent 0 horizontal speed
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
  ctx.font = "32px Arial";
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
  ball.dx = 3;
  ball.dy = -3;
  ball.moving = false;
  paddle.x = canvas.width / 2 - paddle.width / 2;
  createBricks();
  gameState = "start";
}

update();
