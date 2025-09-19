import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "../lib/scrollToSection";

type Vec = { x: number; y: number };

// PHASES
type Phase =
  | "toNav"
  | "sitInit"
  | "sitLoop"
  | "getUp"
  | "walkAway"
  | "sleep"
  | "flyOff"
  | "exit"
  | null;

// === SPRITE SHEET GEOMETRY ===
const SHEET_W = 480;
const SHEET_H = 544;
const FRAME_W = 32;
const FRAME_H = 32;

// 1-based rows from your sheet → 0-based indices here
const ROW_WALK_L = 5; // row 6: walk right→left
const ROW_WALK_R = 6; // row 7: walk left→right
const WALK_COLS = 4;

// Sleep (rows 14/15)
const ROW_SLEEP_A = 13;
const ROW_SLEEP_B = 14;
const SLEEP_COLS = 6;

// Fly off (rows 12/13)
const ROW_FLY_A = 11;
const ROW_FLY_B = 12;
const FLY_COLS = 10;

// NEW: navbar parking animation
const ROW_SIT_ONCE = 9;  // row 10, play once when arriving
const SIT_COLS = 6;      // tweak if your row 10 has different length

const ROW_IDLE_LOOP = 8; // row 9, looping idle
const IDLE_COLS = 4;     // tweak if your row 9 has different length

// NEW: getting up before leaving
const ROW_GETUP = 0;     // row 1, play once
const GETUP_COLS = 6;    // tweak if row 1 has different length

// Timings
const FIRST_INACTIVITY_MS = 60_000; // first time: 60s
const LATER_INACTIVITY_MS = 60_000; // later: 60s again
const SPEED = 2.2;
const FRAME_RATE_MS = 120;
const IDLE_FRAME_RATE_MS = 380;
const SNAP = 12;

// where to stand relative to the _projects link (in px)
const STAND_GAP_X = 26;
const STAND_Y = 18; 
const BUBBLE_SEQUENCE = ["quack!", "check", "projects"];

// how often to show the "quack!" bubble while idling (every N idle loops)
const QUACK_EVERY_LOOPS = 3;

const defaultSprite = `${import.meta.env.BASE_URL}goose-sprites.png`;

export default function DuckAssistant({ spriteUrl = defaultSprite }: { spriteUrl?: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const duckRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false); // full-screen invisible button
  const [quack, setQuack] = useState(false);

  const lastMouse = useRef<Vec>({ x: innerWidth * 0.6, y: innerHeight * 0.6 });
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const rowRef = useRef(ROW_WALK_R);
  const posRef = useRef<Vec>({ x: -200, y: -200 });
  const targetRef = useRef<Vec | null>(null);
  const phaseRef = useRef<Phase>(null);

  const lastFrameTime = useRef(0);
  const firstRunDone = useRef(false);
  const playingRef = useRef(true);

  const idleLoopCount = useRef(0);
  const quackTimer = useRef<number | null>(null);

  const bubbleIdx = useRef(0);


  // Track mouse for first time targeting
  useEffect(() => {
    const mm = (e: MouseEvent) => (lastMouse.current = { x: e.clientX, y: e.clientY });
    addEventListener("mousemove", mm, { passive: true });
    return () => removeEventListener("mousemove", mm);
  }, []);

  // Pause / resume when tab hidden or window blurred
  useEffect(() => {
    const onVis = () => {
      playingRef.current = !document.hidden && document.hasFocus();
      if (playingRef.current && active && !rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    addEventListener("visibilitychange", onVis);
    addEventListener("blur", () => (playingRef.current = false));
    addEventListener("focus", onVis);
    return () => {
      removeEventListener("visibilitychange", onVis);
      removeEventListener("blur", () => (playingRef.current = false));
      removeEventListener("focus", onVis);
    };
  }, [active]);

  // Inactivity → first: navbar parking. Later: sleep. Activity during sleep → fly off.
  useEffect(() => {
    let timer: number | null = null;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      const wait = firstRunDone.current ? LATER_INACTIVITY_MS : FIRST_INACTIVITY_MS;
      timer = window.setTimeout(() => {
        firstRunDone.current ? startSleep() : startNavVisit();
      }, wait);
    };

    const reset = () => {
      if (timer) clearTimeout(timer);
      if (active && phaseRef.current === "sleep") {
        startFlyOff();
        return;
      }
      schedule();
    };

    ["mousemove", "keydown", "wheel", "scroll", "touchstart"].forEach((ev) =>
      addEventListener(ev, reset, { passive: true })
    );
    schedule();

    return () => {
      ["mousemove", "keydown", "wheel", "scroll", "touchstart"].forEach((ev) =>
        removeEventListener(ev, reset)
      );
      if (timer) clearTimeout(timer);
    };
  }, [active]);

  // Helpers
  function setSheetOnce() {
    if (!duckRef.current) return;
    duckRef.current.style.backgroundImage = `url(${spriteUrl})`;
    duckRef.current.style.backgroundSize = `${SHEET_W}px ${SHEET_H}px`;
    duckRef.current.style.backgroundRepeat = "no-repeat";
  }
  function baseStart(from: Vec) {
    bubbleIdx.current = 0;
    posRef.current = from;
    setActive(true);
    setOverlayActive(false);
    frameRef.current = 0;
    lastFrameTime.current = 0;
    idleLoopCount.current = 0;
    setQuack(false);
    if (quackTimer.current) {
      clearTimeout(quackTimer.current);
      quackTimer.current = null;
    }
    setSheetOnce();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }
  function stopDuck() {
    setActive(false);
    setOverlayActive(false);
    setQuack(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    phaseRef.current = null;
    targetRef.current = null;
  }
  function stepTowards(p: Vec, t: Vec, d: number): Vec {
    const dx = t.x - p.x,
      dy = t.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= d) return { ...t };
    return { x: p.x + (dx / dist) * d, y: p.y + (dy / dist) * d };
  }

  // === Scenarios ===

  // FIRST inactivity: walk from a corner to navbar, park beside _projects_
  function startNavVisit() {
    const corners: Vec[] = [
      { x: -40, y: -40 },
      { x: innerWidth + 40, y: -40 },
      { x: -40, y: innerHeight + 40 },
      { x: innerWidth + 40, y: innerHeight + 40 },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    baseStart(start);

    // find projects link position
    const projLink = document.querySelector('a[href="#projects"]') as HTMLElement | null;
    let target: Vec = { x: innerWidth / 2 + STAND_GAP_X, y: 20 + STAND_Y }; // fallback
    if (projLink) {
      const r = projLink.getBoundingClientRect();
      target = { x: r.right + STAND_GAP_X, y: r.top + STAND_Y };
    }

    phaseRef.current = "toNav";
    targetRef.current = target;
    rowRef.current = target.x >= start.x ? ROW_WALK_R : ROW_WALK_L;
  }

  // LATER inactivity: sleep in a corner
  function startSleep() {
    const pad = 28;
    const corners: Vec[] = [
      { x: pad, y: pad },
      { x: innerWidth - pad, y: pad },
      { x: pad, y: innerHeight - pad },
      { x: innerWidth - pad, y: innerHeight - pad },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    baseStart(start);

    phaseRef.current = "sleep";
    targetRef.current = null;
    rowRef.current = Math.random() < 0.5 ? ROW_SLEEP_A : ROW_SLEEP_B;
  }

  // On user activity while sleeping
  function startFlyOff() {
    if (!active) return;
    phaseRef.current = "flyOff";
    const towardRight = Math.random() < 0.5;
    rowRef.current = towardRight ? ROW_FLY_B : ROW_FLY_A;
    targetRef.current = towardRight ? { x: innerWidth + 160, y: -80 } : { x: -160, y: -80 };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  // === Animation loop ===
  function tick(now: number) {
    if (!playingRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // choose frame count per phase
    const cols =
      phaseRef.current === "sleep"
        ? SLEEP_COLS
        : phaseRef.current === "flyOff"
        ? FLY_COLS
        : phaseRef.current === "sitInit"
        ? SIT_COLS
        : phaseRef.current === "sitLoop"
        ? IDLE_COLS
        : phaseRef.current === "getUp"
        ? GETUP_COLS
        : WALK_COLS;

// how many frames to wait before advancing (per phase)
const delay =
  phaseRef.current === "sitLoop" ? IDLE_FRAME_RATE_MS : FRAME_RATE_MS;

if (now - lastFrameTime.current >= delay) {
  const prev = frameRef.current;
  frameRef.current = (frameRef.current + 1) % cols;
  lastFrameTime.current = now;

  if (phaseRef.current === "sitLoop" && frameRef.current === 0 && prev === cols - 1) {
    idleLoopCount.current += 1;
    if (idleLoopCount.current % QUACK_EVERY_LOOPS === 0) {
      setQuack(true);
      if (quackTimer.current) clearTimeout(quackTimer.current);
      quackTimer.current = window.setTimeout(() => setQuack(false), 1200);
      bubbleIdx.current = (bubbleIdx.current + 1) % BUBBLE_SEQUENCE.length;
    }
  }
}


    // PHASES WITHOUT MOVEMENT
    if (phaseRef.current === "sleep" || phaseRef.current === "sitInit" || phaseRef.current === "sitLoop" || phaseRef.current === "getUp") {
      // set proper row for these phases
      if (phaseRef.current === "sleep") {
        // keep chosen sleep row
      } else if (phaseRef.current === "sitInit") {
        rowRef.current = ROW_SIT_ONCE;
      } else if (phaseRef.current === "sitLoop") {
        rowRef.current = ROW_IDLE_LOOP;
      } else if (phaseRef.current === "getUp") {
        rowRef.current = ROW_GETUP;
      }

      if (duckRef.current) {
        const frameX = -FRAME_W * frameRef.current;
        const frameY = -FRAME_H * rowRef.current;
        duckRef.current.style.backgroundPosition = `${frameX}px ${frameY}px`;
        duckRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(3.5)`;
      }

      // handle transitions for the non-moving sequences
      if (phaseRef.current === "sitInit" && frameRef.current === SIT_COLS - 1) {
        // when sit-once finishes, enter idle loop + enable click overlay
        phaseRef.current = "sitLoop";
        setOverlayActive(true);
      }

      if (phaseRef.current === "getUp" && frameRef.current === GETUP_COLS - 1) {
        // finished getting up → start walking away off-screen
        phaseRef.current = "walkAway";
        const goRight = Math.random() < 0.5;
        rowRef.current = goRight ? ROW_WALK_R : ROW_WALK_L;
        targetRef.current = goRight ? { x: innerWidth + 160, y: -60 } : { x: -160, y: -60 };
      }

      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // PHASES WITH MOVEMENT (toNav, walkAway, flyOff)
    const target = targetRef.current;
    if (target) {
      if (phaseRef.current === "toNav" || phaseRef.current === "walkAway") {
        rowRef.current = target.x >= posRef.current.x ? ROW_WALK_R : ROW_WALK_L;
      }
      const next = stepTowards(posRef.current, target, SPEED);
      posRef.current = next;

      if (duckRef.current) {
        const frameX = -FRAME_W * frameRef.current;
        const frameY = -FRAME_H * rowRef.current;
        duckRef.current.style.backgroundPosition = `${frameX}px ${frameY}px`;
        duckRef.current.style.transform = `translate(${next.x}px, ${next.y}px) scale(3.5)`;
      }

      // Arrived?
      if (Math.hypot(target.x - next.x, target.y - next.y) <= SNAP) {
        if (phaseRef.current === "toNav") {
          // park: play row 10 once, then idle loop row 9
          phaseRef.current = "sitInit";
          frameRef.current = 0;
        } else if (phaseRef.current === "walkAway" || phaseRef.current === "flyOff") {
          stopDuck();
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  // CLICK ANYWHERE WHILE IDLING → scroll to projects, then get up + walk away
  const handleOverlayClick = () => {
    setOverlayActive(false);
    scrollToSection("#projects", 56);
    if (!firstRunDone.current) firstRunDone.current = true;
    // play get-up animation (row 1), then walk away (rows 6/7)
    if (phaseRef.current === "sitInit" || phaseRef.current === "sitLoop") {
      phaseRef.current = "getUp";
      frameRef.current = 0;
    }
  };

  // RENDER
  if (!active) return null;

  // quack bubble position relative to duck
  const bubbleStyle: React.CSSProperties = {
    position: "fixed",
    left: posRef.current.x + 28,
    top: posRef.current.y - 24,
  };

  return (
    <>
      {overlayActive && (
        <button
          aria-label="go to projects"
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[55] bg-transparent"
        />
      )}

      {quack && (
        <div
          className="z-[61] select-none pointer-events-none px-2 py-1 rounded-lg border border-white/10 bg-slate-900/80 text-emerald-300 font-mono text-xs shadow"
          style={bubbleStyle}
        >
          {BUBBLE_SEQUENCE[(bubbleIdx.current + BUBBLE_SEQUENCE.length - 1) % BUBBLE_SEQUENCE.length]}
        </div>
      )}

      <div ref={layerRef} className="duck-layer">
        <div
          ref={duckRef}
          className="duck"
          aria-hidden
          style={{
            transform: `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(3.5)`,
            backgroundImage: `url(${spriteUrl})`,
            backgroundSize: `${SHEET_W}px ${SHEET_H}px`,
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </>
  );
}
