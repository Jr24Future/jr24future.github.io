// src/components/DuckAssistant.tsx
import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "../lib/scrollToSection";

type Vec = { x: number; y: number };
type Phase = "toMouse" | "toProjects" | "sleep" | "flyOff" | "exit" | null;

/* ===== Sprite sheet geometry (480x544, 15x17 grid of 32x32 cells) ===== */
const SHEET_W = 480, SHEET_H = 544;
const FRAME_W = 32, FRAME_H = 32;

/* Walk rows: row 6 (R→L) & row 7 (L→R), 0-based: 5 & 6 */
const ROW_LEFT  = 5;   // walk right→left
const ROW_RIGHT = 6;   // walk left→right
const WALK_COLS = 4;

/* Sleep rows: 14 & 15 → 0-based 13 & 14 */
const ROW_SLEEP_A = 13;
const ROW_SLEEP_B = 14;
const SLEEP_COLS  = 6;   // adjust if needed

/* Fly rows: 12 & 13 → 0-based 11 & 12 */
const ROW_FLY_A = 11;
const ROW_FLY_B = 12;
const FLY_COLS  = 10;    // adjust if needed

/* ===== Timings & motion ===== */
const FIRST_INACTIVITY_MS = 4000;  // 60_000 for prod
const LATER_INACTIVITY_MS = 10_000;  // 60_000 for prod
const SPEED = 2.2;
const FRAME_RATE_MS = 120;
const SNAP = 12;

export default function DuckAssistant({ spriteUrl = "goose-sprites.png" }: { spriteUrl?: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const duckRef  = useRef<HTMLDivElement>(null);
  const fakeRef  = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);

  const lastMouse = useRef<Vec>({ x: window.innerWidth * 0.6, y: window.innerHeight * 0.6 });
  const rafRef    = useRef<number | null>(null);
  const frameRef  = useRef(0);
  const rowRef    = useRef(ROW_RIGHT);
  const posRef    = useRef<Vec>({ x: -200, y: -200 });
  const targetRef = useRef<Vec | null>(null);
  const phaseRef  = useRef<Phase>(null);

  const lastFrameTime = useRef(0);
  const firstRunDone  = useRef(false);
  const playingRef    = useRef(true); // pause when hidden/unfocused

  /* Track mouse for first escort */
  useEffect(() => {
    const mm = (e: MouseEvent) => (lastMouse.current = { x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mm, { passive: true });
    return () => window.removeEventListener("mousemove", mm);
  }, []);

  /* Pause/resume on tab visibility/focus */
  useEffect(() => {
    const onVis = () => {
      playingRef.current = !document.hidden && document.hasFocus();
      if (playingRef.current && active && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    const onBlur = () => { playingRef.current = false; };
    const onFocus = () => { onVis(); };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [active]);

  /* Inactivity: first escort, later sleep; activity while sleeping => flyOff */
  useEffect(() => {
    let timer: number | null = null;

    const schedule = () => {
      if (timer) window.clearTimeout(timer);
      const wait = firstRunDone.current ? LATER_INACTIVITY_MS : FIRST_INACTIVITY_MS;
      timer = window.setTimeout(() => {
        firstRunDone.current ? startSleep() : startEscort();
      }, wait);
    };

    const reset = () => {
      if (timer) window.clearTimeout(timer);
      if (active && phaseRef.current === "sleep") {
        startFlyOff();
        return;
      }
      schedule();
    };

    ["mousemove","keydown","wheel","scroll","touchstart"].forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true })
    );
    schedule();

    return () => {
      ["mousemove","keydown","wheel","scroll","touchstart"].forEach((ev) =>
        window.removeEventListener(ev, reset)
      );
      if (timer) window.clearTimeout(timer);
    };
  }, [active]);

  /* Helpers */
  function setSheetOnce() {
    if (!duckRef.current) return;
    duckRef.current.style.backgroundImage = `url(${spriteUrl})`;
    duckRef.current.style.backgroundSize = `${SHEET_W}px ${SHEET_H}px`;
  }
  function baseStart(from: Vec) {
    posRef.current = from;
    setActive(true);
    setDragging(false);
    frameRef.current = 0;
    lastFrameTime.current = 0;
    setSheetOnce();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }
  function stopDuck() {
    setActive(false);
    setDragging(false);
    targetRef.current = null;
    phaseRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    document.body.classList.remove("cursor-none");
  }
  function stepTowards(p: Vec, t: Vec, d: number): Vec {
    const dx = t.x - p.x, dy = t.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= d) return { ...t };
    return { x: p.x + (dx / dist) * d, y: p.y + (dy / dist) * d };
  }

  /* Scenarios */
  function startEscort() {
    const corners: Vec[] = [
      { x: -40, y: -40 },
      { x: window.innerWidth + 40, y: -40 },
      { x: -40, y: window.innerHeight + 40 },
      { x: window.innerWidth + 40, y: window.innerHeight + 40 },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    baseStart(start);

    phaseRef.current = "toMouse";
    targetRef.current = { ...lastMouse.current };
    rowRef.current = lastMouse.current.x > start.x ? ROW_RIGHT : ROW_LEFT;
  }

  function startSleep() {
    const pad = 28;
    const corners: Vec[] = [
      { x: pad, y: pad },
      { x: window.innerWidth - pad, y: pad },
      { x: pad, y: window.innerHeight - pad },
      { x: window.innerWidth - pad, y: window.innerHeight - pad },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    baseStart(start);

    phaseRef.current = "sleep";
    targetRef.current = null;
    rowRef.current = Math.random() < 0.5 ? ROW_SLEEP_A : ROW_SLEEP_B;
  }

  function startFlyOff() {
    if (!active) return;
    phaseRef.current = "flyOff";
    const towardRight = Math.random() < 0.5;
    rowRef.current = towardRight ? ROW_FLY_B : ROW_FLY_A;
    targetRef.current = towardRight
      ? { x: window.innerWidth + 160, y: -80 }
      : { x: -160, y: -80 };
    setDragging(false);
    document.body.classList.remove("cursor-none");
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  /* Animation loop */
  function tick(now: number) {
    if (!playingRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const colsForPhase =
      phaseRef.current === "sleep" ? SLEEP_COLS :
      phaseRef.current === "flyOff" ? FLY_COLS :
      WALK_COLS;

    if (now - lastFrameTime.current >= FRAME_RATE_MS) {
      frameRef.current = (frameRef.current + 1) % colsForPhase;
      lastFrameTime.current = now;
    }

    // Sleeping: animate in place
    if (phaseRef.current === "sleep") {
      if (duckRef.current) {
        const frameX = -FRAME_W * frameRef.current;
        const frameY = -FRAME_H * rowRef.current;
        duckRef.current.style.backgroundPosition = `${frameX}px ${frameY}px`;
        duckRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(3.5)`;
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const target = targetRef.current;
    if (target) {
      if (phaseRef.current === "toMouse" || phaseRef.current === "toProjects") {
        rowRef.current = target.x >= posRef.current.x ? ROW_RIGHT : ROW_LEFT;
      }

      const next = stepTowards(posRef.current, target, SPEED);
      posRef.current = next;

      if (duckRef.current) {
        const frameX = -FRAME_W * frameRef.current;
        const frameY = -FRAME_H * rowRef.current;
        duckRef.current.style.backgroundPosition = `${frameX}px ${frameY}px`;
        duckRef.current.style.transform = `translate(${next.x}px, ${next.y}px) scale(3.5)`;
      }
      if (dragging && fakeRef.current) {
        fakeRef.current.style.transform = `translate(${next.x}px, ${next.y}px)`;
      }

      // Arrival
      if (Math.hypot(target.x - next.x, target.y - next.y) <= SNAP) {
        if (phaseRef.current === "toMouse") {
          // Grab fake cursor & go to projects link position
          setDragging(true);
          document.body.classList.add("cursor-none");

          const projLink = document.querySelector('a[href="#projects"]') as HTMLElement | null;
          let dest: Vec | null = null;
          if (projLink) {
            const r = projLink.getBoundingClientRect();
            dest = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          } else {
            const section = document.getElementById("projects");
            if (section) {
              const r = section.getBoundingClientRect();
              dest = { x: r.left + r.width / 2, y: r.top + 16 };
            } else {
              dest = { x: window.innerWidth / 2, y: 24 };
            }
          }
          phaseRef.current = "toProjects";
          targetRef.current = dest!;
        }
        else if (phaseRef.current === "toProjects") {
          // Drop fake cursor, smooth-scroll to #projects (JS offset), then exit
          setDragging(false);
          document.body.classList.remove("cursor-none");

          scrollToSection("#projects", 56);  // <- single, reliable scroll

          firstRunDone.current = true;
          phaseRef.current = "exit";
          targetRef.current = { x: window.innerWidth + 160, y: -80 };
        }
        else if (phaseRef.current === "flyOff" || phaseRef.current === "exit") {
          stopDuck();
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  /* Render */
  if (!active) return null;

  return (
    <div ref={layerRef} className="duck-layer">
      <div
        ref={duckRef}
        className="duck"
        aria-hidden
        // background is set once in setSheetOnce(); we don't reassign it here
        style={{ transform: `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(3.5)` }}
      />
      {dragging && <div ref={fakeRef} className="fake-cursor" aria-hidden />}
    </div>
  );
}
