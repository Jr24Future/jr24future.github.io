import { useEffect, useRef, useState } from "react";

type Props = {
  onSwitchGame?: () => void;
};

type Vec = { x: number; y: number };

type Tetromino = {
  name: "I" | "O" | "T" | "S" | "Z" | "J" | "L";
  id: number; 
  rotations: number[][][]; // 4 matrices of 4x4
};

const COLS = 10;
const ROWS = 20;
const CELL = 18;

const SOFT_DROP_BONUS = 1;
const HARD_DROP_BONUS = 2;

const SCORE_PER_LINES = [0, 100, 300, 500, 800];

// (id -> color)
const COLORS: Record<number, string> = {
  0: "rgba(0,0,0,0)",
  1: "rgba(56,189,248,0.95)", // I
  2: "rgba(234,179,8,0.95)", // O
  3: "rgba(168,85,247,0.95)", // T
  4: "rgba(34,197,94,0.95)", // S
  5: "rgba(239,68,68,0.95)", // Z
  6: "rgba(148,163,184,0.95)", // J
  7: "rgba(249,115,22,0.95)", // L
};

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function cloneBoard(b: number[][]) {
  return b.map((r) => r.slice());
}

function rand<T>(arr: T[]) {
  return arr[(Math.random() * arr.length) | 0];
}

const PIECES: Tetromino[] = [
  {
    name: "I",
    id: 1,
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
  },
  {
    name: "O",
    id: 2,
    rotations: [
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: "T",
    id: 3,
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: "S",
    id: 4,
    rotations: [
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: "Z",
    id: 5,
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: "J",
    id: 6,
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
  {
    name: "L",
    id: 7,
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
    ],
  },
];

function collides(board: number[][], shape: number[][], pos: Vec) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r]?.[c]) continue;
      const br = pos.y + r;
      const bc = pos.x + c;

      if (bc < 0 || bc >= COLS) return true;
      if (br >= ROWS) return true;

      if (br >= 0 && board[br][bc] !== 0) return true;
    }
  }
  return false;
}

function merge(board: number[][], pieceId: number, shape: number[][], pos: Vec) {
  const next = cloneBoard(board);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r]?.[c]) continue;
      const br = pos.y + r;
      const bc = pos.x + c;
      if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
        next[br][bc] = pieceId;
      }
    }
  }
  return next;
}

function clearLines(board: number[][]) {
  const kept: number[][] = [];
  let cleared = 0;

  for (let r = 0; r < ROWS; r++) {
    const full = board[r].every((v) => v !== 0);
    if (full) cleared++;
    else kept.push(board[r]);
  }

  const pad = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { board: [...pad, ...kept], cleared };
}

function levelToDropMs(level: number) {
  // Simple curve: starts 800ms, down to 120ms
  const base = 800;
  const min = 120;
  const ms = Math.floor(base * Math.pow(0.86, level));
  return Math.max(min, ms);
}

export default function TetrisGame({ onSwitchGame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // lightweight UI state
  const [runningUI, setRunningUI] = useState(false);
  const [pausedUI, setPausedUI] = useState(false);
  const [gameOverUI, setGameOverUI] = useState(false);
  
  const boardRef = useRef<number[][]>(createBoard());
  const pieceRef = useRef<Tetromino>(rand(PIECES));
  const rotRef = useRef(0);
  const posRef = useRef<Vec>({ x: 3, y: -1 });
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const accRef = useRef<number>(0);
  const dropMsRef = useRef<number>(levelToDropMs(0));
  const softDropHeldRef = useRef(false);
  function currentShape() {
    return pieceRef.current.rotations[rotRef.current];
  }

  function syncUI() {
    setRunningUI(runningRef.current);
    setPausedUI(pausedRef.current);
    setGameOverUI(gameOverRef.current);
  }

  function resetGame() {
    boardRef.current = createBoard();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 0;
    dropMsRef.current = levelToDropMs(0);
    pieceRef.current = rand(PIECES);
    rotRef.current = 0;
    posRef.current = { x: 3, y: -1 };
    lastTimeRef.current = 0;
    accRef.current = 0;
    runningRef.current = true;
    pausedRef.current = false;
    gameOverRef.current = false;
    syncUI();
  }

  function spawnNext(board: number[][]) {
    pieceRef.current = rand(PIECES);
    rotRef.current = 0;
    posRef.current = { x: 3, y: -1 };

    if (collides(board, currentShape(), posRef.current)) {
      gameOverRef.current = true;
      runningRef.current = false;
      pausedRef.current = false;
      syncUI();
    }
  }

  function lockPiece() {
    const merged = merge(
      boardRef.current,
      pieceRef.current.id,
      currentShape(),
      posRef.current
    );

    const { board: clearedBoard, cleared } = clearLines(merged);
    boardRef.current = clearedBoard;

    if (cleared > 0) {
      linesRef.current += cleared;
      scoreRef.current += SCORE_PER_LINES[cleared] * (levelRef.current + 1);

      const nextLevel = Math.floor(linesRef.current / 10);
      if (nextLevel !== levelRef.current) {
        levelRef.current = nextLevel;
        dropMsRef.current = levelToDropMs(levelRef.current);
      }

      syncUI();
    }

    spawnNext(boardRef.current);
  }

  function tryMove(dx: number, dy: number, grantDropScore = false) {
    if (!runningRef.current || pausedRef.current || gameOverRef.current) return;

    const nextPos = { x: posRef.current.x + dx, y: posRef.current.y + dy };
    if (!collides(boardRef.current, currentShape(), nextPos)) {
      posRef.current = nextPos;
      if (grantDropScore && dy > 0) {
        scoreRef.current += SOFT_DROP_BONUS;
      }
      return;
    }

    //lock if we cant move down
    if (dy === 1) lockPiece();
  }

  function tryRotate(dir: 1 | -1) {
    if (!runningRef.current || pausedRef.current || gameOverRef.current) return;

    const nextRot = (rotRef.current + (dir === 1 ? 1 : 3)) % 4;
    const nextShape = pieceRef.current.rotations[nextRot];

    // Basic wall kicks
    const { x, y } = posRef.current;
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const testPos = { x: x + k, y };
      if (!collides(boardRef.current, nextShape, testPos)) {
        rotRef.current = nextRot;
        posRef.current = testPos;
        return;
      }
    }
  }

  function hardDrop() {
    if (!runningRef.current || pausedRef.current || gameOverRef.current) return;

    let y = posRef.current.y;
    const x = posRef.current.x;
    const shape = currentShape();

    while (!collides(boardRef.current, shape, { x, y: y + 1 })) y++;

    const dropped = Math.max(0, y - posRef.current.y);
    scoreRef.current += dropped * HARD_DROP_BONUS;

    posRef.current = { x, y };
    lockPiece();
  }

  function computeGhostY() {
    let y = posRef.current.y;
    const x = posRef.current.x;
    const shape = currentShape();
    while (!collides(boardRef.current, shape, { x, y: y + 1 })) y++;
    return y;
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    //background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(2,6,23,0.65)";
    ctx.fillRect(0, 0, w, h);

    //Compute grid fit centered
    const gridW = COLS * CELL;
    const gridH = ROWS * CELL;
    const ox = Math.floor((w - gridW) / 2);
    const oy = Math.floor((h - gridH) / 2);
    // board frame
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(ox - 1, oy - 1, gridW + 2, gridH + 2);
    // subtle grid lines
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.beginPath();
    for (let c = 1; c < COLS; c++) {
      const x = ox + c * CELL;
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + gridH);
    }
    for (let r = 1; r < ROWS; r++) {
      const y = oy + r * CELL;
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + gridW, y);
    }
    ctx.stroke();
    // locked blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = boardRef.current[r][c];
        if (!v) continue;
        ctx.fillStyle = COLORS[v] ?? "rgba(226,232,240,0.9)";
        ctx.fillRect(ox + c * CELL, oy + r * CELL, CELL - 1, CELL - 1);
      }
    }
    // ghost piece
    if (runningRef.current && !pausedRef.current && !gameOverRef.current) {
      const shape = currentShape();
      const ghostY = computeGhostY();
      const id = pieceRef.current.id;
      ctx.fillStyle = (COLORS[id] ?? "rgba(226,232,240,0.5)").replace("0.95", "0.18");

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!shape[r]?.[c]) continue;
          const br = ghostY + r;
          const bc = posRef.current.x + c;
          if (br < 0) continue;
          ctx.fillRect(ox + bc * CELL, oy + br * CELL, CELL - 1, CELL - 1);
        }
      }
    }

    // active piece
    {
      const shape = currentShape();
      const id = pieceRef.current.id;
      ctx.fillStyle = COLORS[id] ?? "rgba(226,232,240,0.9)";
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!shape[r]?.[c]) continue;
          const br = posRef.current.y + r;
          const bc = posRef.current.x + c;
          if (br < 0) continue;
          ctx.fillRect(ox + bc * CELL, oy + br * CELL, CELL - 1, CELL - 1);
        }
      }
    }

    // HUD text
    ctx.fillStyle = "rgba(226,232,240,0.9)";
    ctx.font =
      '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    ctx.fillText(`score: ${scoreRef.current}`, 14, 20);
    ctx.fillText(`lines: ${linesRef.current}`, 14, 38);
    ctx.fillText(`level: ${levelRef.current}`, 14, 56);

    if (!runningRef.current && !gameOverRef.current) {
      ctx.fillStyle = "rgba(148,163,184,0.85)";
      ctx.fillText(`press play`, 14, 78);
    }

    if (pausedRef.current) {
      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.fillText(`paused`, 14, 78);
    }

    if (gameOverRef.current) {
      ctx.fillStyle = "rgba(239,68,68,0.92)";
      ctx.fillText(`game over`, 14, 78);
      ctx.fillStyle = "rgba(148,163,184,0.85)";
      ctx.fillText(`press play to restart`, 14, 96);
    }
  }

  function loop(t: number) {
    if (!canvasRef.current) return;

    //keeps UI responsive
    if (!lastTimeRef.current) lastTimeRef.current = t;
    const dt = t - lastTimeRef.current;
    lastTimeRef.current = t;

    if (runningRef.current && !pausedRef.current && !gameOverRef.current) {
      accRef.current += dt;

      // soft drop speeds gravity
      const interval = softDropHeldRef.current
        ? Math.max(40, Math.floor(dropMsRef.current * 0.08))
        : dropMsRef.current;

      while (accRef.current >= interval) {
        accRef.current -= interval;
        // gravity step
        tryMove(0, 1);
        if (softDropHeldRef.current) {
          scoreRef.current += SOFT_DROP_BONUS;
        }
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }

  function startOrRestart() {
    resetGame();
  }

  function togglePause() {
    if (!runningRef.current || gameOverRef.current) return;
    pausedRef.current = !pausedRef.current;
    syncUI();
  }

  //setup
  useEffect(() => {
    resizeCanvas();
    draw();

    const onResize = () => {
      resizeCanvas();
      draw();
    };
    window.addEventListener("resize", onResize, { passive: true });

    rafRef.current = requestAnimationFrame(loop);

    // Auto-pause on tab hidden
    const onVis = () => {
      if (document.hidden && runningRef.current && !gameOverRef.current) {
        pausedRef.current = true;
        setPausedUI(true);
      }
      // reset timing so it doesn't jump when coming back
      lastTimeRef.current = 0;
      accRef.current = 0;
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const editing =
        tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable;

      const isGameKey = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "p", "P", "z", "Z", "x", "X"].includes(
        e.key
      );

      if (isGameKey && !editing) e.preventDefault();

      if (e.key === "p" || e.key === "P") {
        togglePause();
        return;
      }

      if (!runningRef.current || gameOverRef.current) {
        if (e.key === " " || e.key === "Enter") startOrRestart();
        return;
      }

      if (pausedRef.current) return;

      if (e.key === "ArrowLeft") tryMove(-1, 0);
      else if (e.key === "ArrowRight") tryMove(1, 0);
      else if (e.key === "ArrowDown") {
        softDropHeldRef.current = true;
        // immediate nudge
        tryMove(0, 1, true);
      } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
        tryRotate(1);
      } else if (e.key === "z" || e.key === "Z") {
        tryRotate(-1);
      } else if (e.key === " ") {
        hardDrop();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") softDropHeldRef.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const playButtonLabel = gameOverUI
    ? "play"
    : runningUI
    ? pausedUI
      ? "resume"
      : "pause"
    : "play";

  const onPlayClick = () => {
    if (gameOverRef.current || !runningRef.current) {
      startOrRestart();
      return;
    }
    togglePause();
  };

  return (
    <div className="game-card">
      <div className="game-card__inner relative">
        <canvas
          ref={canvasRef}
          id="tetris-canvas"
          tabIndex={0}
          className="block max-w-full rounded-[18px] w-full h-[360px] md:h-[420px] bg-slate-900/70 border border-white/10 shadow-2xl"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="hidden sm:block text-sm text-slate-200/90">
            <p className="font-mono">// arrows move</p>
            <p className="font-mono">// up / x rotate</p>
            <p className="font-mono">// space hard-drop</p>
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn-primary" onClick={onPlayClick}>
              {playButtonLabel}
            </button>

            {onSwitchGame && (
              <button type="button" className="btn-outline" onClick={onSwitchGame}>
                switch game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}