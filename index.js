const GRAVITY = 0.1;
const BUBBLE_RATIO = 30;
const GROUND_HEIGHT = 70;
const CONTROLS_HEIGHT = 70;

const COLORS = {
  1: "#a3c1ad",
  2: "#4a3c31",
  3: "#d2691e",
  4: "#708090",
  5: "#fff8dc",
  6: "#2e8b57",
  7: "#e6e6fa",
  8: "#8b0000",
  9: "#b8860b",
  10: "#556b2f",
  11: "#da70d6",
  12: "#20b2aa",
  13: "#bc8f8f",
  14: "#4b0082",
  15: "#cd853f",
};

const COLORS_KEYS_LENGTH = Object.keys(COLORS).length;

const container = document.getElementById("container");
const containerRect = container.getBoundingClientRect();

const playBtn = document.getElementById("play");
const numBubbles = document.getElementById("num-bubbles");
const numBubblesText = document.getElementById("num-bubbles-text");
const DEFAULT_BUBBLES_QUANTITY = Number(numBubbles.value);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = containerRect.width;
canvas.height = containerRect.height;

const groundY = canvas.height - GROUND_HEIGHT;

let animationFrameId = undefined;

const bubbleData = [];
const levelBubblesLength = { 0: DEFAULT_BUBBLES_QUANTITY };
const INIT_IN_LEVEL = 0;

for (
  let i = 0;
  i < levelBubblesLength[INIT_IN_LEVEL] ?? DEFAULT_BUBBLES_QUANTITY;
  i++
) {
  const bubble = newBubble();
  bubbleData.push(bubble);
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS_KEYS_LENGTH) + 1];
}

function newBubble() {
  return {
    x:
      Math.random() * (canvas.width - BUBBLE_RATIO - BUBBLE_RATIO) +
      BUBBLE_RATIO,
    y: 0 + CONTROLS_HEIGHT + BUBBLE_RATIO * 2,
    vx: (1.5 + Math.random()) * (Math.random() < 0.5 ? 1 : -1),
    vy: Math.random() * (1.5 + 1) - 1,
    gravity: GRAVITY,
    color: randomColor(),
  };
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
        a.color = randomColor();

        b.x -= separationX;
        b.y -= separationY;
        b.vx += impactVx;
        b.vy += impactVy;
        b.color = randomColor();
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

numBubbles.addEventListener("change", (event) => {
  const value = Number(event.target.value);

  if (value < bubbleData.length) {
    bubbleData.splice(value, bubbleData.length - value);
  } else {
    const bubblesToAdd = value - bubbleData.length;
    for (let i = 0; i < bubblesToAdd; i++) {
      const bubble = newBubble();
      bubbleData.push(bubble);
    }
  }

  numBubblesText.textContent = ` (${value})`;
});

window.addEventListener("keydown", (event) => {
  if (event.key == " " || event.code == "Space") {
    event.preventDefault();
    togglePlay();
  }
});

const observer = new ResizeObserver((entries) => {
  for (const entrie of entries) {
    canvas.width = entrie.contentRect.width;
    canvas.height = entrie.contentRect.height;
    drawState();
    drawBubbles();
  }
});
observer.observe(container);

animationFrameId = requestAnimationFrame(moveBubble);
