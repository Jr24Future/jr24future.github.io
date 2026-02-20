import { useEffect, useRef } from "react";

type Props = {
  playerName?: string; // for the downloadable card
  siteLabel?: string; // fallback handle on the card
  onSwitchGame?: () => void; // NEW: lets parent switch to another game (ex: Tetris)
};

export default function SnakeGame({
  playerName = "player",
  siteLabel = "your-handle",
  onSwitchGame,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startBtnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayTitleRef = useRef<HTMLHeadingElement | null>(null);
  const overlayMsgRef = useRef<HTMLParagraphElement | null>(null);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const startBtn = startBtnRef.current!;
    const overlay = overlayRef.current!;
    const overlayTitle = overlayTitleRef.current!;
    const overlayMessage = overlayMsgRef.current!;
    const continueBtn = continueBtnRef.current!;
    const downloadCard = downloadRef.current!;

    // overlay hidden on mount
    overlay.classList.add("hidden");

    // ===================== MINI ARCADE (Snake) =====================
    type Point = { x: number; y: number };

    const CELL = 18,
      GRID = 18,
      TICK = 95;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf: number | null = null;
    let running = false;

    let paused = false;
    let resumeGame: (() => void) | null = null;
    let isCountingDown = false;

    function countdownResume(seconds = 3, done: () => void) {
      if (isCountingDown) return;
      isCountingDown = true;

      const container = canvas.parentElement!;
      container.style.position = "relative";

      const overlayDiv = document.createElement("div");
      overlayDiv.className = "countdown-overlay";
      const bubble = document.createElement("div");
      bubble.className = "countdown-bubble";
      overlayDiv.appendChild(bubble);
      container.appendChild(overlayDiv);

      let n = seconds;
      const tick = () => {
        if (n === 0) {
          overlayDiv.remove();
          isCountingDown = false;
          done();
          return;
        }
        bubble.textContent = String(n);
        bubble.style.transform = "scale(1)";
        bubble.style.opacity = "1";
        setTimeout(() => {
          bubble.style.transform = "scale(.92)";
          bubble.style.opacity = ".85";
        }, 50);

        n--;
        setTimeout(tick, 1000);
      };
      tick();
    }

    type GameKind = "snake" | "invaders";
    // ------- Reward system state -------
    let snakeScore = 0;
    let snakeRewardGiven = false;

    // confetti
    function runConfettiBurstViewport(durationMs = 1800) {
      const confettiCanvas = document.createElement("canvas");
      confettiCanvas.style.position = "fixed";
      confettiCanvas.style.inset = "0";
      confettiCanvas.style.width = "100vw";
      confettiCanvas.style.height = "100vh";
      confettiCanvas.style.pointerEvents = "none";
      confettiCanvas.style.zIndex = "60";
      document.body.appendChild(confettiCanvas);

      const ctx = confettiCanvas.getContext("2d")!;
      const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      function resize() {
        confettiCanvas.width = Math.floor(window.innerWidth * DPR);
        confettiCanvas.height = Math.floor(window.innerHeight * DPR);
      }
      resize();
      window.addEventListener("resize", resize, { passive: true });

      const start = performance.now();

      type P = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
        w: number;
        h: number;
        rot: number;
        vr: number;
      };
      const parts: P[] = [];
      const COLORS = ["#22c55e", "#34d399", "#10b981", "#fbbf24", "#38bdf8", "#a78bfa"];

      function spawn(side: "left" | "right", n = 26) {
        for (let i = 0; i < n; i++) {
          const yCss = Math.random() * window.innerHeight * 0.9 + window.innerHeight * 0.05;
          const xCss = side === "left" ? -12 : window.innerWidth + 12;
          const dir = side === "left" ? 1 : -1;
          const speed = 3 + Math.random() * 3;
          parts.push({
            x: xCss * DPR,
            y: yCss * DPR,
            vx: dir * speed * DPR,
            vy: (-1 - Math.random() * 2) * DPR,
            life: 1100 + Math.random() * 900,
            color: COLORS[(Math.random() * COLORS.length) | 0],
            w: (3 + Math.random() * 4) * DPR,
            h: (3 + Math.random() * 6) * DPR,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.2,
          });
        }
      }

      spawn("left", 40);
      spawn("right", 40);

      let raf2: number;
      function tick(t: number) {
        const elapsed = t - start;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (const p of parts) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06 * DPR;
          p.rot += p.vr;
          p.life -= 16;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 1000));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }

        if (elapsed < durationMs) {
          if (Math.random() < 0.18) spawn(Math.random() < 0.5 ? "left" : "right", 8);
          raf2 = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf2);
          window.removeEventListener("resize", resize);
          confettiCanvas.remove();
        }
      }
      raf2 = requestAnimationFrame(tick);
    }

    function createSnakeCardPNG(nameForCard: string, score: number): string {
      // portrait card
      const w = 720,
        h = 1024;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0b1020");
      g.addColorStop(1, "#0e172a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.25, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // frame
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 2;
      ctx.strokeRect(24.5, 24.5, w - 49, h - 49);

      // title
      ctx.fillStyle = "#e2e8f0";
      ctx.font = '700 36px "Inter", system-ui';
      ctx.fillText("Collector Card — Snake", 44, 72);

      // player / score row
      ctx.font = '400 20px "JetBrains Mono", ui-monospace';
      ctx.fillStyle = "rgba(226,232,240,.8)";
      ctx.fillText(`@${nameForCard || "player"}`, 44, 108);
      ctx.fillText(`Score: ${score}`, w - 44 - ctx.measureText(`Score: ${score}`).width, 108);

      // tiny snake board illustration
      const grid = 16,
        cols = 14,
        rows = 10;
      const boardX = 44,
        boardY = 150,
        boardW = cols * grid,
        boardH = rows * grid;

      // board shadow
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(boardX + 8, boardY + 8, boardW, boardH);
      // board
      ctx.fillStyle = "#0b1324";
      ctx.fillRect(boardX, boardY, boardW, boardH);
      ctx.strokeStyle = "rgba(255,255,255,.08)";
      ctx.strokeRect(boardX, boardY, boardW, boardH);

      // stylized snake
      ctx.fillStyle = "#38bdf8";
      const snakeCells: Point[] = [
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 6, y: 3 },
        { x: 7, y: 3 },
        { x: 8, y: 3 },
        { x: 9, y: 3 },
      ];
      for (const cell of snakeCells) {
        ctx.fillRect(boardX + cell.x * grid + 1, boardY + cell.y * grid + 1, grid - 2, grid - 2);
      }
      // apple
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(boardX + 10 * grid + 1, boardY + 2 * grid + 1, grid - 2, grid - 2);

      // caption
      const bandY = boardY + boardH + 24;
      ctx.fillStyle = "rgba(255,255,255,.06)";
      ctx.fillRect(44, bandY, w - 88, 110);
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.strokeRect(44, bandY, w - 88, 110);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = '700 28px "Inter", system-ui';
      ctx.fillText("You beat the Snake", 64, bandY + 40);

      ctx.fillStyle = "rgba(226,232,240,.85)";
      ctx.font = '400 18px "JetBrains Mono", ui-monospace';
      ctx.fillText("A minimalist arcade on my website. Thanks for playing!", 64, bandY + 72);

      // footer
      ctx.fillStyle = "rgba(226,232,240,.6)";
      ctx.font = '400 16px "JetBrains Mono", ui-monospace';
      ctx.fillText("© " + new Date().getFullYear() + " — erroll.dev", 44, h - 44);

      return c.toDataURL("image/png");
    }

    function rewardSnake() {
      if (snakeRewardGiven) return;
      snakeRewardGiven = true;

      // stop loop
      running = false;
      paused = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }

      runConfettiBurstViewport(2000);

      // overlay content
      overlayTitle.textContent = "congratulations, you win!";
      overlayMessage.textContent = "You reached 20 apples. Thanks for playing 🐍";
      continueBtn.textContent = "continue";
      continueBtn.classList.remove("mx-auto", "block");
      const handle = (siteLabel || playerName || "player").replace(/\s+/g, "-");
      const png = createSnakeCardPNG(handle, snakeScore);
      downloadCard.href = png;
      downloadCard.classList.remove("hidden");

      overlay.classList.remove("hidden");
      setTimeout(() => downloadCard.focus(), 0);
    }

    // ===================== GAME OVER HANDLER =====================
    function gameOverSnake() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      overlayTitle.textContent = "Game Over";
      overlayMessage.textContent = `Your score: ${snakeScore}`;
      overlay.classList.remove("hidden");

      downloadCard.classList.add("hidden");

      continueBtn.textContent = "Start Over";
      continueBtn.classList.add("mx-auto", "block");
      continueBtn.onclick = () => {
        overlay.classList.add("hidden");
        startBtn.textContent = "start";
        snakeRewardGiven = false;
        running = false;
        paused = false;
        drawIdle();
      };
    }

    const GAMES: GameKind[] = ["snake", "invaders"];
    let currentGameIndex = 0;

    // ---------- minimal 5x7 pixel font for titles ----------
    type Glyph = string[];
    const FONT: Record<string, Glyph> = {
      S: ["11111", "10000", "11110", "00001", "00001", "11110", "00000"],
      N: ["10001", "11001", "10101", "10011", "10001", "10001", "00000"],
      A: ["01110", "10001", "10001", "11111", "10001", "10001", "00000"],
      K: ["10001", "10010", "10100", "11000", "10100", "10010", "00000"],
      E: ["11111", "10000", "11110", "10000", "10000", "11111", "00000"],
      P: ["11110", "10001", "11110", "10000", "10000", "10000", "00000"],
      C: ["01111", "10000", "10000", "10000", "10000", "01111", "00000"],
      I: ["11111", "00100", "00100", "00100", "00100", "11111", "00000"],
      V: ["10001", "10001", "10001", "10001", "01010", "00100", "00000"],
      D: ["11110", "10001", "10001", "10001", "10001", "11110", "00000"],
      R: ["11110", "10001", "11110", "10100", "10010", "10001", "00000"],
      T: ["11111", "00100", "00100", "00100", "00100", "00100", "00000"],
      O: ["01110", "10001", "10001", "10001", "10001", "01110", "00000"],
      " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    };

    function drawGlyph(ctx: CanvasRenderingContext2D, g: Glyph, x: number, y: number, size = 10) {
      for (let r = 0; r < g.length; r++)
        for (let c = 0; c < g[r].length; c++)
          if (g[r][c] === "1") ctx.fillRect(x + c * size, y + r * size, size - 1, size - 1);
    }

    function drawTitle(text: string, hint: string) {
      canvas.width = GRID * CELL;
      canvas.height = GRID * CELL;
      const ctx = canvas.getContext("2d")!;
      // bg
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#0B1020");
      grad.addColorStop(1, "#0E172A");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // glow
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#22c55e";
      const gx = canvas.width * 0.65,
        gy = canvas.height * 0.35,
        gr = 180;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // pixel title
      const letters = text.split("").map((ch) => FONT[ch as keyof typeof FONT] || FONT[" "]);
      const size = 12,
        gap = 8,
        wPer = 5 * size,
        h = 7 * size;
      const totalW = letters.length * wPer + (letters.length - 1) * gap;
      let x = (canvas.width - totalW) / 2;
      const y = (canvas.height - h) / 2 - 10;

      ctx.fillStyle = "#22c55e";
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 12;
      for (const g of letters) {
        drawGlyph(ctx, g, Math.round(x), Math.round(y), size);
        x += wPer + gap;
      }
      ctx.shadowBlur = 0;

      // hint
      ctx.fillStyle = "rgba(148,163,184,.85)";
      ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "center";
      ctx.fillText(hint, canvas.width / 2, y + h + 28);
    }

    function drawIdle() {
      drawTitle("SNAKE", "// press play to start");
    }
    function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 10) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function drawSnakeHUD(ctx: CanvasRenderingContext2D, score: number) {
      const label = `${score}`;
      ctx.save();
      ctx.font = '700 16px "JetBrains Mono", ui-monospace';
      const padX = 10;
      const textW = ctx.measureText(label).width;
      const w = textW + padX * 2;
      const h = 28;
      const x = ctx.canvas.width - w - 12;
      const y = 10;

      // pill background
      ctx.fillStyle = "rgba(255,255,255,.10)";
      roundedRect(ctx, x, y, w, h, 12);
      ctx.fill();

      // border
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // text
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(label, x + padX, y + h - 9);
      ctx.restore();
    }

    // ===================== SNAKE =====================
    let snake: Point[] = [{ x: 5, y: 9 }],
      food: Point = { x: 12, y: 9 };
    let dir: Point = { x: 1, y: 0 },
      pending: Point = { x: 1, y: 0 };

    function snakeStart() {
      const ctx = canvas.getContext("2d")!;
      paused = false;
      startBtn.textContent = "playAgain";
      snake = [{ x: 5, y: 9 }];
      dir = { x: 1, y: 0 };
      pending = { x: 1, y: 0 };
      food = { x: 12, y: 9 };
      snakeScore = 0;

      snakeRewardGiven = false;

      let last = 0;

      function randFood() {
        let newFood: Point;
        do {
          newFood = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
        food = newFood;
      }
      function draw(p: Point) {
        ctx.fillRect(p.x * CELL, p.y * CELL, CELL - 2, CELL - 2);
      }

      render();
      raf = requestAnimationFrame(loop);

      function loop(t: number) {
        if (!running || paused) return;
        if (!last) last = t;

        let updated = false;
        if (t - last >= (reduced ? TICK * 1.4 : TICK)) {
          last = t;
          dir = pending;
          const h = { x: (snake[0].x + dir.x + GRID) % GRID, y: (snake[0].y + dir.y + GRID) % GRID };
          if (snake.some((s) => s.x === h.x && s.y === h.y)) {
            gameOverSnake();
            return;
          }
          snake.unshift(h);
          if (h.x === food.x && h.y === food.y) {
            randFood();
            snakeScore++;
            if (snakeScore === 20) {
              rewardSnake();
              return;
            }
          } else {
            snake.pop();
          }
          updated = true;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0B1020";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#22c55e";
        draw(food);

        // Draw snake body
        ctx.fillStyle = "#38bdf8";
        snake.forEach(draw);

        // Eyes
        const head = snake[0];
        if (head) {
          ctx.fillStyle = "#000000";
          const eyeSize = 4;
          const offset = CELL / 4;
          ctx.beginPath();
          ctx.arc(head.x * CELL + offset, head.y * CELL + offset, eyeSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(head.x * CELL + CELL - offset, head.y * CELL + offset, eyeSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        drawSnakeHUD(ctx, snakeScore);
        if (updated) render();

        if (running && !paused) raf = requestAnimationFrame(loop);
      }
      resumeGame = () => {
        if (!raf) {
          running = true;
          startBtn.textContent = "pause"; // <-- ensure correct label on resume
          canvas.focus(); // optional: keep keyboard focus
          raf = requestAnimationFrame(loop);
        }
      };

      function render() {
        const ctx2 = canvas.getContext("2d")!;
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.fillStyle = "#0B1020";
        ctx2.fillRect(0, 0, canvas.width, canvas.height);
        // food
        ctx2.fillStyle = "#22c55e";
        ctx2.fillRect(food.x * CELL, food.y * CELL, CELL - 2, CELL - 2);
        // snake
        ctx2.fillStyle = "#38bdf8";
        snake.forEach((p) => ctx2.fillRect(p.x * CELL, p.y * CELL, CELL - 2, CELL - 2));
        // eyes
        const head = snake[0];
        if (head) {
          ctx2.fillStyle = "#fff";
          const r = 2,
            off = CELL / 4;
          ctx2.beginPath();
          ctx2.arc(head.x * CELL + off, head.y * CELL + off, r, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.beginPath();
          ctx2.arc(head.x * CELL + CELL - off, head.y * CELL + off, r, 0, Math.PI * 2);
          ctx2.fill();
        }

        drawSnakeHUD(ctx2, snakeScore);
      }

      if (running && !paused) raf = requestAnimationFrame(loop);
    }

    function startGame() {
      if (running) return;
      overlay.classList.add("hidden");
      paused = false;
      running = true;
      canvas.width = GRID * CELL;
      canvas.height = GRID * CELL;
      downloadCard.classList.add("hidden");
      snakeStart();
      startBtn.textContent = "pause";
      canvas.focus();
    }

    // keyboard controls
    const keyHandler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const editing = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      const isGameKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space", "Enter", "w", "a", "s", "d"].includes(
        e.key
      );

      if (isGameKey && !editing) e.preventDefault(); // <-- always stop page scroll for these

      if (!running && (e.key === "Enter" || e.key === " ")) {
        startGame();
        return;
      }
      if (!running || paused) return;

      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const next = map[e.key];
      if (!next) return;
      if (next.x === -dir.x && next.y === -dir.y) return; // disallow 180° turns
      pending = next;
    };

    window.addEventListener("keydown", keyHandler);

    // start/pause/resume button
    const startHandler = () => {
      if (!running && !paused) {
        startGame();
        startBtn.textContent = "pause";
        return;
      }
      if (running && !paused) {
        paused = true;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        startBtn.textContent = "resume";
        return;
      }
      if (paused) {
        paused = false;
        if (GAMES[currentGameIndex] === "snake" && resumeGame) {
          resumeGame();
        } else {
          drawIdle();
          running = false;
        }
        startBtn.textContent = "pause";
      }
    };
    startBtn.addEventListener("click", startHandler);

    // continue / overlay button
    const continueHandler = () => {
      overlay.classList.add("hidden");
      if (overlayTitle.textContent?.toLowerCase().includes("game over")) {
        snakeRewardGiven = false;
        drawIdle();
        running = false;
        paused = false;
        startBtn.textContent = "start";
      } else {
        if (GAMES[currentGameIndex] === "snake" && resumeGame) {
          countdownResume(3, () => resumeGame!());
          startBtn.textContent = "pause";
        } else {
          drawIdle();
        }
      }
    };
    continueBtn.addEventListener("click", continueHandler);

    // draw initial title
    drawIdle();

    return () => {
      window.removeEventListener("keydown", keyHandler);
      startBtn.removeEventListener("click", startHandler);
      continueBtn.removeEventListener("click", continueHandler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [playerName, siteLabel]);

  return (
    <div className="game-card">
      <div className="game-card__inner relative">
        <canvas
          ref={canvasRef}
          id="snake-canvas"
          tabIndex={0}
          className="block max-w-full rounded-[18px] w-full h-[360px] md:h-[420px] bg-slate-900/70 border border-white/10 shadow-2xl"
        />
        <div ref={overlayRef} id="game-overlay" className="game-overlay hidden">
          <div className="game-overlay-card">
            <h3 ref={overlayTitleRef} id="overlay-title" className="text-xl font-bold">
              congratulations, you win!
            </h3>
            <p ref={overlayMsgRef} id="overlay-message" className="mt-2 text-sm text-slate-300/90 font-mono">
              You reached 20 apples. Thanks for playing 🐍
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                ref={downloadRef}
                id="download-card"
                className="btn-primary w-full sm:w-auto hidden"
                download="snake-collector-card.png"
                href="#"
              >
                download collector card
              </a>
              <button ref={continueBtnRef} id="continue-game" className="btn-outline w-full sm:w-auto">
                continue
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="hidden sm:block text-sm text-slate-200/90">
            <p className="font-mono">// try to win and</p>
            <p className="font-mono">// collect all the</p>
            <p className="font-mono">// cards. Have Fun!</p>
          </div>

          <div className="flex gap-2">
            <button ref={startBtnRef} id="start-game" className="btn-primary">
              play
            </button>

            {/* NEW: only show if parent supplies handler */}
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