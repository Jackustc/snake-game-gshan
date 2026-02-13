const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const TICK_MS = 120;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function keyForPos(pos) {
  return `${pos.x},${pos.y}`;
}

function isOutOfBounds(pos, width, height) {
  return pos.x < 0 || pos.y < 0 || pos.x >= width || pos.y >= height;
}

function getNextHead(head, direction) {
  const delta = DIRECTIONS[direction];
  return { x: head.x + delta.x, y: head.y + delta.y };
}

function placeFood(snake, width, height, rng = Math.random) {
  const taken = new Set(snake.map(keyForPos));
  const candidates = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pos = { x, y };
      if (!taken.has(keyForPos(pos))) {
        candidates.push(pos);
      }
    }
  }
  if (candidates.length === 0) {
    return null;
  }
  const idx = Math.floor(rng() * candidates.length);
  return candidates[idx];
}

function createInitialState(width = GRID_WIDTH, height = GRID_HEIGHT, rng = Math.random) {
  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const snake = [
    center,
    { x: center.x - 1, y: center.y },
    { x: center.x - 2, y: center.y },
  ];
  return {
    width,
    height,
    snake,
    direction: "right",
    pendingDirection: "right",
    food: placeFood(snake, width, height, rng),
    score: 0,
    isGameOver: false,
    isPaused: false,
  };
}

function setDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }
  if (OPPOSITE[state.direction] === nextDirection) {
    return state;
  }
  return { ...state, pendingDirection: nextDirection };
}

function stepState(state, rng = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.pendingDirection;
  const nextHead = getNextHead(state.snake[0], direction);

  if (isOutOfBounds(nextHead, state.width, state.height)) {
    return { ...state, direction, isGameOver: true };
  }

  const willGrow = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = willGrow ? state.snake : state.snake.slice(0, -1);
  const selfHit = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (selfHit) {
    return { ...state, direction, isGameOver: true };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willGrow) {
    nextSnake.pop();
  }

  const nextFood = willGrow ? placeFood(nextSnake, state.width, state.height, rng) : state.food;
  const nextScore = willGrow ? state.score + 1 : state.score;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: nextScore,
    isGameOver: nextFood === null ? true : false,
  };
}

function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }
  return { ...state, isPaused: !state.isPaused };
}

const SnakeCore = {
  createInitialState,
  setDirection,
  stepState,
  placeFood,
  isOutOfBounds,
  getNextHead,
  togglePause,
};

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn");
const controlBtns = document.querySelectorAll("[data-dir]");

let state = createInitialState();
let tickHandle = null;
const cellEls = [];

function buildBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < state.width * state.height; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function getCellIdx(pos, width) {
  return pos.y * width + pos.x;
}

function render() {
  for (const cell of cellEls) {
    cell.className = "cell";
  }

  for (const segment of state.snake) {
    const idx = getCellIdx(segment, state.width);
    if (cellEls[idx]) {
      cellEls[idx].classList.add("snake");
    }
  }

  if (state.food) {
    const foodIdx = getCellIdx(state.food, state.width);
    if (cellEls[foodIdx]) {
      cellEls[foodIdx].classList.add("food");
    }
  }

  scoreEl.textContent = String(state.score);
  if (state.isGameOver) {
    statusEl.textContent = "Game Over";
  } else if (state.isPaused) {
    statusEl.textContent = "Paused";
  } else {
    statusEl.textContent = "Running";
  }
  pauseBtn.textContent = state.isPaused ? "Resume" : "Pause";
}

function tick() {
  state = stepState(state);
  render();
}

function startLoop() {
  if (tickHandle) {
    clearInterval(tickHandle);
  }
  tickHandle = setInterval(tick, TICK_MS);
}

function restart() {
  state = createInitialState();
  render();
  startLoop();
}

function handleDirectionInput(nextDirection) {
  state = setDirection(state, nextDirection);
}

function handleKeyboard(event) {
  const key = event.key.toLowerCase();
  const keyMap = {
    arrowup: "up",
    arrowdown: "down",
    arrowleft: "left",
    arrowright: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  if (key === " " || key === "p") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = keyMap[key];
  if (direction) {
    event.preventDefault();
    handleDirectionInput(direction);
  }
}

document.addEventListener("keydown", handleKeyboard);
restartBtn.addEventListener("click", restart);
pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

for (const btn of controlBtns) {
  btn.addEventListener("click", () => handleDirectionInput(btn.dataset.dir));
}

buildBoard();
render();
startLoop();

if (typeof window !== "undefined") {
  window.SnakeCore = SnakeCore;
}

export { SnakeCore };
