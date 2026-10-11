const container = document.getElementById("container");
const containerRect = container.getBoundingClientRect();

const playBtn = document.getElementById("play");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = containerRect.width;
canvas.height = containerRect.height;

const GRAVITY = 0.1;
const BUBBLE_RATIO = 30;
const GROUND_HEIGHT = 50;
const CONTROLS_HEIGHT = 70;

const groundY = canvas.height - GROUND_HEIGHT;

let animationFrameId = undefined;

const bubbleData = [];
const levelBubblesLength = { 0: 3 };
const INIT_IN_LEVEL = 0;

for (let i = 0; i < levelBubblesLength[INIT_IN_LEVEL] ?? 1; i++) {
  const randomX =
    Math.random() * (canvas.width - BUBBLE_RATIO - BUBBLE_RATIO) + BUBBLE_RATIO;
  const y = 0 + CONTROLS_HEIGHT + BUBBLE_RATIO * 2;
  const randomVx = (1.5 + Math.random()) * (Math.random() < 0.5 ? 1 : -1);
  const randomVy = Math.random() * (1.5 + 1) - 1;

  bubbleData.push({
    x: randomX,
    y,
    vx: randomVx,
    vy: randomVy,
    gravity: GRAVITY,
    color: "#f5f5f5",
  });
}

function updatePhysics(bubble) {
  bubble.vy += GRAVITY;

  if (bubble.y + bubble.vy + BUBBLE_RATIO >= groundY) {
    bubble.vy = -11;
  }
  if (bubble.y + bubble.vy - BUBBLE_RATIO < CONTROLS_HEIGHT) {
    bubble.vy = 1;
  }
  if (
    bubble.x + bubble.vx + BUBBLE_RATIO >= canvas.width ||
    bubble.x - BUBBLE_RATIO <= 0
  ) {
    bubble.vx *= -1;
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

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const xSquare = dx ** 2;
      const ySquare = dy ** 2;
      const c = xSquare + ySquare;
      const squareRoot = Math.sqrt(c);

      if (squareRoot <= BUBBLE_RATIO * 2) {
        const normalX = dx / squareRoot;
        const normalY = dy / squareRoot;

        const aNormalV = a.vx * normalX + a.vy * normalY;
        const bNormalV = b.vx * normalX + b.vy * normalY;

        const impactForce = aNormalV - bNormalV;
        const impactVx = impactForce * normalX;
        const impactVy = impactForce * normalY;

        const overlap = BUBBLE_RATIO * 2 - squareRoot;
        const separationX = (overlap / 2) * normalX;
        const separationY = (overlap / 2) * normalY;

        a.x += separationX;
        a.y += separationY;
        a.vx -= impactVx;
        a.vy -= impactVy;

        b.x -= separationX;
        b.y -= separationY;
        b.vx += impactVx;
        b.vy += impactVy;
      }
    }
  }

  drawBubbles();
  animationFrameId = requestAnimationFrame(moveBubble);
}

function drawBubbles() {
  for (let i = 0; i < bubbleData.length; i++) {
    const bubble = bubbleData[i];
    drawBubble(bubble.x, bubble.y, bubble.color);
  }
}

function drawState() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);

  ctx.strokeStyle = "#f5f5f5";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawBubble(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, BUBBLE_RATIO, 0, Math.PI * 2);
  ctx.fillStyle = color;
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
  if (event.key == " " || event.code == "Space") {
    event.preventDefault();
    togglePlay();
  }
});

const observer = new ResizeObserver((entries) => {
  for (const entrie of entries) {
    const width = entrie.contentRect.width;
    const height = entrie.contentRect.height;

    canvas.width = width;
    canvas.height = height;

    drawState();
    drawBubbles();
  }
});

observer.observe(container);

animationFrameId = requestAnimationFrame(moveBubble);
