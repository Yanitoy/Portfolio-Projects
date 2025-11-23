// ===== CONFIG =====
const ROWS = 10;
const COLS = 10;
const MINES = 10;

// ===== STATE =====
let board = []; // 2D array of cells
let gameOver = false;
let cellsRevealed = 0;
let flagsPlaced = 0;

// Cell structure:
// {
//   mine: boolean,
//   adjacent: number,
//   revealed: boolean,
//   flagged: boolean
// }

const boardEl = document.getElementById("board");
const mineCountEl = document.getElementById("mine-count");
const statusTextEl = document.getElementById("status-text");
const resetBtn = document.getElementById("reset-btn");

resetBtn.addEventListener("click", initGame);

// Initialize when page loads
window.addEventListener("DOMContentLoaded", initGame);

function initGame() {
  board = [];
  gameOver = false;
  cellsRevealed = 0;
  flagsPlaced = 0;
  statusTextEl.textContent = "";
  mineCountEl.textContent = MINES;

  createEmptyBoard();
  placeMines();
  calculateAdjacents();
  renderBoard();
}

// Create empty board structure
function createEmptyBoard() {
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        mine: false,
        adjacent: 0,
        revealed: false,
        flagged: false
      });
    }
    board.push(row);
  }
}

// Randomly place mines
function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minesPlaced++;
    }
  }
}

// Calculate numbers for each cell
function calculateAdjacents() {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) {
        board[r][c].adjacent = 0;
        continue;
      }

      let count = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc].mine) {
          count++;
        }
      }
      board[r][c].adjacent = count;
    }
  }
}

// Check if coordinates are inside board
function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

// Draw board DOM
function renderBoard() {
  boardEl.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `cell-${r}-${c}`;

      cell.addEventListener("click", () => handleLeftClick(r, c));
      cell.addEventListener("contextmenu", (e) => handleRightClick(e, r, c));

      boardEl.appendChild(cell);
    }
  }
}

// Left-click handler (reveal)
function handleLeftClick(r, c) {
  if (gameOver) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;

  if (cell.mine) {
    revealMine(r, c);
    endGame(false);
  } else {
    revealCell(r, c);
    checkWin();
  }
}

// Right-click handler (flag)
function handleRightClick(e, r, c) {
  e.preventDefault();
  if (gameOver) return;

  const cell = board[r][c];
  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  const domCell = document.getElementById(`cell-${r}-${c}`);

  if (cell.flagged) {
    domCell.classList.add("flagged");
    domCell.textContent = "🚩";
    flagsPlaced++;
  } else {
    domCell.classList.remove("flagged");
    domCell.textContent = "";
    flagsPlaced--;
  }

  mineCountEl.textContent = MINES - flagsPlaced;
}

// Reveal a single cell, and if empty, flood fill
function revealCell(r, c) {
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cellsRevealed++;

  const domCell = document.getElementById(`cell-${r}-${c}`);
  domCell.classList.add("revealed");
  domCell.classList.remove("flagged");
  domCell.textContent = "";

  if (cell.adjacent > 0) {
    domCell.textContent = cell.adjacent;
    domCell.classList.add(`num-${cell.adjacent}`);
  }

  // If no adjacent mines, reveal neighbors
  if (cell.adjacent === 0) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc)) {
        revealCell(nr, nc);
      }
    }
  }
}

// Reveal all mines when you lose
function revealAllMines(hitRow, hitCol) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell.mine) {
        const domCell = document.getElementById(`cell-${r}-${c}`);
        domCell.classList.add("revealed", "mine");
        domCell.textContent = "💣";
        if (r === hitRow && c === hitCol) {
          domCell.classList.add("hit");
        }
      }
    }
  }
}

function revealMine(r, c) {
  revealAllMines(r, c);
}

// Check win condition
function checkWin() {
  const totalCells = ROWS * COLS;
  const nonMineCells = totalCells - MINES;

  if (cellsRevealed === nonMineCells) {
    endGame(true);
  }
}

// End game: won or lost
function endGame(won) {
  gameOver = true;
  if (won) {
    statusTextEl.textContent = "🎉 You cleared all the mines! GG!";
  } else {
    statusTextEl.textContent = "💥 Boom! Game over.";
  }

  // Disable further interaction by removing listeners
  // (simpler approach: ignore clicks via gameOver flag, which we already do)
}
