const cols = 10;
const rows = 10;
const minesCount = 10;

const cellSize = 40;
let isGameOver = false;

const matrix = Array.from({ length: cols }, () =>
  Array.from({ length: rows }, () => 0)
);

const visibleCells = Array.from({ length: cols }, (_, i) => i).reduce(
  (acc, val) => ({ ...acc, [val]: {} }),
  {}
);

const plantMines = () => {
  for (let i = 0; i < minesCount; i++) {
    let [x, y] = getRandomCoords();

    do {
      [x, y] = getRandomCoords();
    } while (isMine(x, y));

    matrix[y][x] = -1;
  }
};

const placeClues = () => {
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < rows; x++) {
      if (isMine(x, y)) continue;
      matrix[y][x] = getMinesCountAroundCell(x, y);
    }
  }
};

function setup() {
  textSize(16);
  textAlign(CENTER, CENTER);

  createCanvas(400, 400);

  plantMines();
  placeClues();

  window.game = {
    matrix,
    visibleCells,
  };
}

function draw() {
  background(0);
  strokeWeight(1);
  stroke(255);

  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < rows; x++) {
      const cell = matrix[y][x];
      const l = cellSize * x,
        t = cellSize * y;

      noFill();

      if (isVisible(x, y) || isGameOver) {
        if (isEmpty(x, y)) {
          fill(100);
        } else if (isMine(x, y)) {
          fill(255, 0, 0);
        } else {
          // Draw text
          text(cell, l + 16, t + 24);
        }
      }

      rect(l, t, cellSize, cellSize);
    }
  }
}

/** Events */

function mouseClicked() {
  if (isGameOver) return;

  const x = floor(mouseX / cellSize);
  const y = floor(mouseY / cellSize);

  if (isMine(x, y)) {
    isGameOver = true;
    setTimeout(() => alert("game over"));
    return;
  }

  expandEmptyCells(x, y);

  const visibleCellsCount = Object.values(visibleCells).reduce(
    (acc, val) => (acc += Object.keys(val).length),
    0
  );

  if (visibleCellsCount >= rows * cols - minesCount) {
    isGameOver = true;

    setTimeout(() => alert("you win"));
  }
}

/** Utilities */

const getRandomCoords = () => [floor(random(0, rows)), floor(random(0, cols))];

const isMine = (x, y) => matrix[y]?.[x] === -1;
const isClue = (x, y) => (matrix[y]?.[x] ?? 0) > 0;
const isEmpty = (x, y) => !matrix[y]?.[x];
const isOutOfBounds = (x, y) => x < 0 || x >= rows || y >= cols || y < 0;

const isVisible = (x, y) => visibleCells[y][x] === true;

const getMinesCountAroundCell = (x, y) => {
  let c = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;

      c += Number(isMine(x + dx, y + dy));
    }
  }

  return c;
};

const expandEmptyCells = (x, y) => {
  if (isOutOfBounds(x, y) || isVisible(x, y) || isMine(x, y)) return;

  visibleCells[y][x] = true;

  if (isClue(x, y)) return;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dx) continue;

      expandEmptyCells(x + dx, y + dy);
    }
  }
};
