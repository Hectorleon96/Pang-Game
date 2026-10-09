const playBtn = document.getElementById("play");

let animationFrameId = undefined;

const GRAVITY = 0.17;
const BUBBLE_RATIO = 25;
const GROUND_HEIGHT = 25;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height;

const sueloY = canvas.height - GROUND_HEIGHT;

const levelBubblesLength = { 0: 2 };
const INIT_IN_LEVEL = 0;

const bubbleData = [];

for (let i = 0; i < levelBubblesLength[INIT_IN_LEVEL] ?? 1; i++) {
  const randomX =
    Math.random() * (canvas.width - BUBBLE_RATIO - BUBBLE_RATIO) + BUBBLE_RATIO;
  const randomY =
    Math.random() * (canvas.height - BUBBLE_RATIO) -
    BUBBLE_RATIO +
    canvas.height / 3;

  const randomVx = (1.5 + Math.random()) * (Math.random() < 0.5 ? 1 : -1);
  const randomVy = Math.random() * (1.5 + 1) - 1;
  bubbleData.push({
    x: randomX,
    y: randomY,
    vx: randomVx,
    vy: randomVy,
    gravity: GRAVITY,
  });
}

function updatePhysics(bubble) {
  bubble.vy += GRAVITY;

  if (bubble.y + bubble.vy + BUBBLE_RATIO >= sueloY) {
    bubble.vy = -8;
  }
  if (
    bubble.x + bubble.vx + BUBBLE_RATIO >= canvas.width ||
    bubble.x - BUBBLE_RATIO <= 0
  ) {
    bubble.vx *= -1; // new_velocity = velocity * -1
  }

  bubble.y += bubble.vy;
  bubble.x += bubble.vx;
}

function moveBubble() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawState();

  for (let i = 0; i < bubbleData.length; i++) {
    updatePhysics(bubbleData[i]);
  }

  for (let i = 0; i < bubbleData.length; i++) {
    const a = bubbleData[i];

    for (let j = i + 1; j < bubbleData.length; j++) {
      const b = bubbleData[j];

      const dX = a.x - b.x;
      const dY = a.y - b.y;
      const xSquare = dX ** 2;
      const ySquare = dY ** 2;
      const c = xSquare + ySquare;
      const squareRoot = Math.sqrt(c);

      if (squareRoot <= BUBBLE_RATIO * 2) {
        console.log(`Bubbles ${i} and ${j} are touched`);
      }
    }
  }

  for (let i = 0; i < bubbleData.length; i++) {
    const bubble = bubbleData[i];
    drawBubble(bubble.x, bubble.y);
  }

  animationFrameId = requestAnimationFrame(moveBubble);
}

function drawState() {
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, sueloY);
  ctx.lineTo(canvas.width, sueloY);

  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawBubble(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, BUBBLE_RATIO, 0, Math.PI * 2);
  ctx.fillStyle = "#800000";
  ctx.fill();
}

function togglePlay() {
  if (playBtn.textContent === "Pause") {
    pause();
  } else {
    play();
  }
}

function play() {
  playBtn.textContent = "Pause";
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(moveBubble);
}

function pause() {
  playBtn.textContent = "Play";
  cancelAnimationFrame(animationFrameId);
  animationFrameId = undefined;
}

playBtn.addEventListener("click", togglePlay);

window.addEventListener("keydown", (event) => {
  event.preventDefault();

  if (event.key == " " || event.code == "Space") {
    togglePlay();
  }
});

animationFrameId = requestAnimationFrame(moveBubble);
