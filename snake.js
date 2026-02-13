const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const DEFAULT_TICK_MS = 300;
const MIN_TICK_MS = 60;
const MAX_TICK_MS = 300;
const DEFAULT_PLAYER_NAME = "Player";
const LEADERBOARD_KEY = "snake_leaderboard_v1";
const PLAYER_NAME_KEY = "snake_player_name_v1";
const MAX_RANKINGS = 10;

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
const speedRange = document.getElementById("speed-range");
const speedValueEl = document.getElementById("speed-value");
const playerNameInput = document.getElementById("player-name");
const savePlayerBtn = document.getElementById("save-player-btn");
const currentPlayerEl = document.getElementById("current-player");
const rankingListEl = document.getElementById("ranking-list");
const clearRankingBtn = document.getElementById("clear-ranking-btn");

let state = createInitialState();
let tickHandle = null;
let tickMs = DEFAULT_TICK_MS;
let currentPlayerName = DEFAULT_PLAYER_NAME;
let hasRecordedCurrentRound = false;
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

function readLeaderboard() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && typeof item.name === "string" && Number.isFinite(item.score))
      .map((item) => ({
        name: item.name.trim().slice(0, 20) || DEFAULT_PLAYER_NAME,
        score: Math.max(0, Math.floor(item.score)),
        at: typeof item.at === "number" ? item.at : Date.now(),
      }));
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function sortRankings(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.at - b.at;
  });
}

function renderRankingBoard() {
  if (!rankingListEl) {
    return;
  }
  const entries = sortRankings(readLeaderboard()).slice(0, MAX_RANKINGS);
  rankingListEl.innerHTML = "";

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-rank";
    li.textContent = "No scores yet.";
    rankingListEl.appendChild(li);
    return;
  }

  for (const entry of entries) {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.score}`;
    rankingListEl.appendChild(li);
  }
}

function normalizePlayerName(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return DEFAULT_PLAYER_NAME;
  }
  return trimmed.slice(0, 20);
}

function setCurrentPlayerName(name) {
  currentPlayerName = normalizePlayerName(name);
  if (playerNameInput) {
    playerNameInput.value = currentPlayerName;
  }
  if (currentPlayerEl) {
    currentPlayerEl.textContent = currentPlayerName;
  }
  window.localStorage.setItem(PLAYER_NAME_KEY, currentPlayerName);
}

function loadCurrentPlayerName() {
  const stored = window.localStorage.getItem(PLAYER_NAME_KEY);
  setCurrentPlayerName(stored || DEFAULT_PLAYER_NAME);
}

function recordScoreIfNeeded() {
  if (!state.isGameOver || hasRecordedCurrentRound) {
    return;
  }
  const entries = readLeaderboard();
  entries.push({
    name: currentPlayerName,
    score: state.score,
    at: Date.now(),
  });
  const nextEntries = sortRankings(entries).slice(0, MAX_RANKINGS);
  saveLeaderboard(nextEntries);
  hasRecordedCurrentRound = true;
  renderRankingBoard();
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
  recordScoreIfNeeded();
}

function tick() {
  state = stepState(state);
  render();
}

function startLoop() {
  if (tickHandle) {
    clearInterval(tickHandle);
  }
  tickHandle = setInterval(tick, tickMs);
}

function setGameSpeed(nextTickMs) {
  const parsed = Number(nextTickMs);
  if (!Number.isFinite(parsed)) {
    return;
  }
  const clamped = Math.max(MIN_TICK_MS, Math.min(MAX_TICK_MS, Math.round(parsed)));
  tickMs = clamped;
  if (speedRange && String(speedRange.value) !== String(clamped)) {
    speedRange.value = String(clamped);
  }
  if (speedValueEl) {
    speedValueEl.textContent = String(clamped);
  }
  startLoop();
}

function restart() {
  state = createInitialState();
  hasRecordedCurrentRound = false;
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
savePlayerBtn.addEventListener("click", () => {
  setCurrentPlayerName(playerNameInput.value);
});
playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    setCurrentPlayerName(playerNameInput.value);
  }
});
clearRankingBtn.addEventListener("click", () => {
  saveLeaderboard([]);
  renderRankingBoard();
});

for (const btn of controlBtns) {
  btn.addEventListener("click", () => handleDirectionInput(btn.dataset.dir));
}

if (speedRange) {
  speedRange.addEventListener("input", (event) => {
    setGameSpeed(event.target.value);
  });
}

buildBoard();
loadCurrentPlayerName();
setGameSpeed(DEFAULT_TICK_MS);
renderRankingBoard();
render();

if (typeof window !== "undefined") {
  window.SnakeCore = SnakeCore;
  window.setSnakeSpeed = setGameSpeed;
}
