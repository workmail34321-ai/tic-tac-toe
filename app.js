const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreEls = {
  X: document.getElementById("score-x"),
  O: document.getElementById("score-o"),
  D: document.getElementById("score-d"),
};

let board, turn, over;
const scores = { X: 0, O: 0, D: 0 };
const mode = () => document.querySelector('input[name="mode"]:checked').value;

const cells = Array.from({ length: 9 }, (_, i) => {
  const b = document.createElement("button");
  b.className = "cell";
  b.setAttribute("aria-label", `Cell ${i + 1}`);
  b.addEventListener("click", () => play(i));
  boardEl.appendChild(b);
  return b;
});

function winner(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line };
  }
  return b.every(Boolean) ? { player: "D" } : null;
}

function render(result) {
  cells.forEach((cell, i) => {
    cell.textContent = board[i] || "";
    cell.className = "cell" + (board[i] ? " " + board[i].toLowerCase() : "");
    cell.disabled = over || !!board[i];
    if (result?.line?.includes(i)) cell.classList.add("win");
  });
  if (result) {
    statusEl.textContent = result.player === "D" ? "It's a draw!" : `${result.player} wins!`;
  } else {
    statusEl.textContent = mode() === "ai" && turn === "O" ? "Computer is thinking…" : `${turn}'s turn`;
  }
  for (const k in scores) scoreEls[k].textContent = scores[k];
}

function play(i) {
  if (over || board[i]) return;
  if (mode() === "ai" && turn === "O") return;
  move(i);
  if (!over && mode() === "ai") {
    render();
    setTimeout(() => move(bestMove(board)), 350);
  }
}

function move(i) {
  board[i] = turn;
  const result = winner(board);
  if (result) {
    over = true;
    scores[result.player]++;
  } else {
    turn = turn === "X" ? "O" : "X";
  }
  render(result);
}

// Minimax for the computer (plays O). Unbeatable.
function bestMove(b) {
  let best = -Infinity, choice = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = "O";
    const s = minimax(b, false, 0);
    b[i] = null;
    if (s > best) { best = s; choice = i; }
  }
  return choice;
}

function minimax(b, maximizing, depth) {
  const r = winner(b);
  if (r) return r.player === "O" ? 10 - depth : r.player === "X" ? depth - 10 : 0;
  let best = maximizing ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = maximizing ? "O" : "X";
    const s = minimax(b, !maximizing, depth + 1);
    b[i] = null;
    best = maximizing ? Math.max(best, s) : Math.min(best, s);
  }
  return best;
}

function newRound() {
  board = Array(9).fill(null);
  turn = "X";
  over = false;
  render();
}

document.getElementById("restart").addEventListener("click", newRound);
document.getElementById("reset").addEventListener("click", () => {
  scores.X = scores.O = scores.D = 0;
  newRound();
});
document.querySelectorAll('input[name="mode"]').forEach((r) =>
  r.addEventListener("change", () => {
    scores.X = scores.O = scores.D = 0;
    newRound();
  })
);

newRound();
