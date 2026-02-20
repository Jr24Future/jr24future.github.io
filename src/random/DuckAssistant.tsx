import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "../lib/scrollToSection";

type Vec = { x: number; y: number };
type Phase =
  | "toMouse"
  | "toNav"
  | "sitInit"
  | "sitLoop"
  | "getUp"
  | "walkAway"
  // second AFK sequence:
  | "sleepWalkIn"
  | "sleepSettle"
  | "sleepLoop"
  | "sleepWakeFin"
  | "flyOff"
  | "exit"
  | null;

// ===== Sheet geometry (32x32 cells on a 480x544 sheet) =====
const SHEET_W = 480;
const SHEET_H = 544;
const FRAME_W = 32;
const FRAME_H = 32;

const ROW_WALK_L = 5; // row 6: walk right left
const ROW_WALK_R = 6; // row 7: walk left right
const WALK_COLS = 4;

const ROW_SLEEP_14 = 13; // row 14
const ROW_SLEEP_15 = 14; // row 15

const ROW_FLY_12 = 11; // row 12 (one facing)
const ROW_FLY_13 = 12; // row 13 (the other facing)

// Sit by projects
const ROW_SIT_ONCE = 9; // row 10 - play once
const ROW_IDLE_LOOP = 8; // row 9 - loop
const ROW_GETUP = 0; // row 1 - play once

// Generic counts (non-custom rows)
const SIT_COLS = 6;
const IDLE_COLS = 4;
const GETUP_COLS = 6;

// Timings
const FIRST_INACTIVITY_MS = 7_000;
const LATER_INACTIVITY_MS = 10_000;
const FRAME_RATE_MS = 120;
const IDLE_FRAME_RATE_MS = 300;
const SPEED = 2.2;
const SNAP = 12;

// Park to the RIGHT of the _projects tab
const STAND_GAP_X = 26;
const STAND_Y = 18;

// Speech bubble cycling
const QUACK_EVERY_LOOPS = 2;
const BUBBLE_SEQUENCE = ["Click", "Projects", "Quack!"];

const defaultSprite = `${import.meta.env.BASE_URL}goose-sprites.png`;

// ============== Sleep/fly frame sequences (0-based)==============

// Row 14
// settle: 0->5 once, loop: 6->10, wake finish: 11->14 once
const S14_SETTLE_FWD = [0, 1, 2, 3, 4, 5];
const S14_LOOP_FWD = [6, 7, 8, 9, 10];
const S14_WAKE_FWD = [11, 12, 13, 14];

// Row 15
// settle: 14->11 once, loop: 10->6 (reverse), wake: 5->0 once
const S15_SETTLE_REV = [14, 13, 12, 11];
const S15_LOOP_REV = [10, 9, 8, 7, 6];
const S15_WAKE_REV = [5, 4, 3, 2, 1, 0];

// Fly rows: loop 4<->5
const FLY12_LOOP = [4, 5]; // row 12
const FLY13_LOOP = [5, 4]; // row 13

// helpers
function nextLoopIndex(arr: number[], i: number) {
  return (i + 1) % arr.length;
}
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pickCentralSpot(): Vec {
  const vw = window.innerWidth,
    vh = window.innerHeight;
  return { x: rand(vw * 0.35, vw * 0.65), y: rand(vh * 0.35, vh * 0.6) };
}
// Left/right only exit, keep approx same Y
function pickLateralExit(pos: Vec): Vec {
  const vw = window.innerWidth,
    vh = window.innerHeight;
  const marginY = 40;
  const y = Math.min(Math.max(pos.y, marginY), vh - marginY);
  const goRight = vw - pos.x < pos.x;
  return { x: goRight ? vw + 160 : -160, y };
}

export default function DuckAssistant({
  spriteUrl = defaultSprite,
}: {
  spriteUrl?: string;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const duckRef = useRef<HTMLDivElement>(null);
  const fakeRef = useRef<HTMLDivElement>(null);

  // fake cursor
  const fakePosRef = useRef<Vec>({ x: -9999, y: -9999 });
  const fakeVisibleRef = useRef(false);

  const [active, setActive] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false); // fullscreen click target
  const [bubbleOn, setBubbleOn] = useState(false);

  const dragging = useRef(false); // fake cursor being dragged
  const lastMouse = useRef<Vec>({ x: innerWidth * 0.6, y: innerHeight * 0.6 });

  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const rowRef = useRef(ROW_WALK_R);
  const posRef = useRef<Vec>({ x: -200, y: -200 });
  const targetRef = useRef<Vec | null>(null);
  const phaseRef = useRef<Phase>(null);

  // sequence state for sleep/fly
  const seqIndexRef = useRef(0);
  const sleepRowRef = useRef<14 | 15 | null>(null);

  const lastFrameTime = useRef(0);
  const firstRunDone = useRef(false);
  const playingRef = useRef(true);

  const idleLoopCount = useRef(0);
  const bubbleIdx = useRef(0);
  const bubbleTimer = useRef<number | null>(null);

  // inactivity freeze/resume (freeze countdown while tab hidden)
  const inactivityTimerRef = useRef<number | null>(null);
  const inactivityRemainingRef = useRef<number>(0);
  const inactivityStartedAtRef = useRef<number>(0);

  function clearInactivityTimer() {
    if (inactivityTimerRef.current != null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }

  // arms the timer for "ms" (assumes page is visible/focused)
  function armInactivity(ms: number) {
    clearInactivityTimer();
    inactivityRemainingRef.current = ms;
    inactivityStartedAtRef.current = performance.now();

    inactivityTimerRef.current = window.setTimeout(() => {
      inactivityTimerRef.current = null;
      inactivityRemainingRef.current = 0;

      // never start while tab hidden/unfocused
      if (document.hidden || !document.hasFocus()) return;
      if (active) return;

      firstRunDone.current ? startSleepWalkIn() : startEscort();
    }, ms);
  }

  function pauseInactivityTimer() {
    if (inactivityTimerRef.current == null) return;
    const elapsed = performance.now() - inactivityStartedAtRef.current;
    inactivityRemainingRef.current = Math.max(
      0,
      inactivityRemainingRef.current - elapsed
    );
    clearInactivityTimer();
  }

  function resumeInactivityTimer() {
    if (active) return;
    if (document.hidden || !document.hasFocus()) return;

    const fallback = firstRunDone.current
      ? LATER_INACTIVITY_MS
      : FIRST_INACTIVITY_MS;
    const remaining =
      inactivityRemainingRef.current > 0
        ? inactivityRemainingRef.current
        : fallback;
    armInactivity(remaining);
  }

  function scheduleInactivityTimer() {
    if (active) return;

    const wait = firstRunDone.current ? LATER_INACTIVITY_MS : FIRST_INACTIVITY_MS;
    inactivityRemainingRef.current = wait;

    // don't run countdown while hidden/unfocused; resume will arm it
    if (document.hidden || !document.hasFocus()) {
      clearInactivityTimer();
      return;
    }

    armInactivity(wait);
  }

  // track real mouse
  useEffect(() => {
    const mm = (e: MouseEvent) =>
      (lastMouse.current = { x: e.clientX, y: e.clientY });
    addEventListener("mousemove", mm, { passive: true });
    return () => removeEventListener("mousemove", mm);
  }, []);

  // pause on hidden/blur (freeze animation + AFK countdown while away)
  useEffect(() => {
    const pauseAll = () => {
      playingRef.current = false;

      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      pauseInactivityTimer();
    };

    const resumeAll = () => {
      playingRef.current = !document.hidden && document.hasFocus();
      if (!playingRef.current) return;

      resumeInactivityTimer();

      if (active && rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onVisOrFocus = () => {
      if (document.hidden || !document.hasFocus()) pauseAll();
      else resumeAll();
    };

    document.addEventListener("visibilitychange", onVisOrFocus);
    window.addEventListener("blur", pauseAll);
    window.addEventListener("focus", onVisOrFocus);

    // run once on mount
    onVisOrFocus();

    return () => {
      document.removeEventListener("visibilitychange", onVisOrFocus);
      window.removeEventListener("blur", pauseAll);
      window.removeEventListener("focus", onVisOrFocus);
    };
  }, [active]);

  // inactivity: first escort run;
  useEffect(() => {
    scheduleInactivityTimer();

    const onUserActivity = () => {
      // If interacts during any sleeping phase -> start wake finish
      if (
        active &&
        (phaseRef.current === "sleepWalkIn" ||
          phaseRef.current === "sleepSettle" ||
          phaseRef.current === "sleepLoop")
      ) {
        startSleepWakeFinish();
        return;
      }
      // If already in wake finish, ignore (it’ll transition to fly)
      if (!active) scheduleInactivityTimer();
    };

    ["mousemove", "keydown", "wheel", "scroll", "touchstart"].forEach((ev) =>
      addEventListener(ev, onUserActivity, { passive: true })
    );

    return () => {
      ["mousemove", "keydown", "wheel", "scroll", "touchstart"].forEach((ev) =>
        removeEventListener(ev, onUserActivity)
      );
      clearInactivityTimer();
    };
  }, [active]);

  // utils
  function setSheetOnce() {
    if (!duckRef.current) return;
    duckRef.current.style.backgroundImage = `url(${spriteUrl})`;
    duckRef.current.style.backgroundSize = `${SHEET_W}px ${SHEET_H}px`;
    duckRef.current.style.backgroundRepeat = "no-repeat";
  }
  function baseStart(from: Vec) {
    posRef.current = from;
    setActive(true);
    setOverlayActive(false);
    frameRef.current = 0;
    lastFrameTime.current = 0;
    idleLoopCount.current = 0;
    bubbleIdx.current = 0;
    setBubbleOn(false);
    seqIndexRef.current = 0;
    sleepRowRef.current = null;
    clearInactivityTimer();
    setSheetOnce();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }
  function stopDuck() {
    setActive(false);
    setOverlayActive(false);
    setBubbleOn(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    phaseRef.current = null;
    targetRef.current = null;
    document.body.classList.remove("cursor-none");
    dragging.current = false;
    clearInactivityTimer();
  }
  function stepTowards(p: Vec, t: Vec, d: number): Vec {
    const dx = t.x - p.x,
      dy = t.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= d) return { ...t };
    return { x: p.x + (dx / dist) * d, y: p.y + (dy / dist) * d };
  }

  // === FIRST AFK: corner -> mouse -> projects -> sit ===
  function startEscort() {
    const corners: Vec[] = [
      { x: -40, y: -40 },
      { x: innerWidth + 40, y: -40 },
      { x: -40, y: innerHeight + 40 },
      { x: innerWidth + 40, y: innerHeight + 40 },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    baseStart(start);

    phaseRef.current = "toMouse";
    targetRef.current = { ...lastMouse.current };
    rowRef.current = targetRef.current.x! >= start.x ? ROW_WALK_R : ROW_WALK_L;
  }

  // === SECOND AFK: sleep sequence ===

  // 1) Walk in from a corner to central spot
  function startSleepWalkIn() {
    const corners: Vec[] = [
      { x: -40, y: -40 },
      { x: innerWidth + 40, y: -40 },
      { x: -40, y: innerHeight + 40 },
      { x: innerWidth + 40, y: innerHeight + 40 },
    ];
    const start = corners[(Math.random() * corners.length) | 0];
    const target = pickCentralSpot();

    baseStart(start);
    phaseRef.current = "sleepWalkIn";
    targetRef.current = target;
    rowRef.current = target.x >= start.x ? ROW_WALK_R : ROW_WALK_L;
  }

  // 2) Settle sequence at the spot (choose row 14 or 15 depending on approach direction)
  function beginSleepSettle() {
    phaseRef.current = "sleepSettle";
    seqIndexRef.current = 0;

    // If the last segment was moving right -> prefer right-facing (row 15), else row 14.
    const movingRight =
      (targetRef.current?.x ?? posRef.current.x) >= posRef.current.x;
    if (movingRight) {
      sleepRowRef.current = 15;
      rowRef.current = ROW_SLEEP_15;
      frameRef.current = S15_SETTLE_REV[0]; // 14-> 11
    } else {
      sleepRowRef.current = 14;
      rowRef.current = ROW_SLEEP_14;
      frameRef.current = S14_SETTLE_FWD[0]; // 0 -> 5
    }
  }

  // 3) On user activity during/after sleep -> finish & then fly
  function startSleepWakeFinish() {
    if (!active) return;

    // If still walking in, just begin fly immediately (skip settle)
    if (phaseRef.current === "sleepWalkIn") {
      beginFly();
      return;
    }
    // If settling or looping, just run normally
    phaseRef.current = "sleepWakeFin";
    seqIndexRef.current = 0;

    if (sleepRowRef.current === 14) {
      rowRef.current = ROW_SLEEP_14;
      frameRef.current = S14_WAKE_FWD[0]; // 11 ->14
    } else if (sleepRowRef.current === 15) {
      rowRef.current = ROW_SLEEP_15;
      frameRef.current = S15_WAKE_REV[0]; // 5->0
    } else {
      beginFly();
    }
  }

  // 4) Begin fly off-screen (left/right only), using row 4<->5 loop
  function beginFly() {
    phaseRef.current = "flyOff";
    const exit = pickLateralExit(posRef.current);
    const goingRight = exit.x > posRef.current.x;

    // Facing mapping
    // goingRight -> use ROW_FLY_12, goingLeft -> use ROW_FLY_13
    rowRef.current = goingRight ? ROW_FLY_12 : ROW_FLY_13;

    targetRef.current = exit;
    seqIndexRef.current = 0;
    frameRef.current = goingRight ? FLY12_LOOP[0] : FLY13_LOOP[0];

    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  // animation
  function tick(now: number) {
    if (!playingRef.current) {
      rafRef.current = null;
      return;
    }

    // choose frame delay
    const delay = phaseRef.current === "sitLoop" ? IDLE_FRAME_RATE_MS : FRAME_RATE_MS;

    if (now - lastFrameTime.current >= delay) {
      // advance frames by phase
      if (phaseRef.current === "sleepSettle") {
        if (sleepRowRef.current === 14) {
          // 0->5 once
          seqIndexRef.current += 1;
          if (seqIndexRef.current >= S14_SETTLE_FWD.length) {
            phaseRef.current = "sleepLoop";
            seqIndexRef.current = 0;
            frameRef.current = S14_LOOP_FWD[0];
          } else {
            frameRef.current = S14_SETTLE_FWD[seqIndexRef.current];
          }
        } else if (sleepRowRef.current === 15) {
          // 14->11 once
          seqIndexRef.current += 1;
          if (seqIndexRef.current >= S15_SETTLE_REV.length) {
            phaseRef.current = "sleepLoop";
            seqIndexRef.current = 0;
            frameRef.current = S15_LOOP_REV[0];
          } else {
            frameRef.current = S15_SETTLE_REV[seqIndexRef.current];
          }
        }
      } else if (phaseRef.current === "sleepLoop") {
        if (sleepRowRef.current === 14) {
          seqIndexRef.current = nextLoopIndex(S14_LOOP_FWD, seqIndexRef.current);
          frameRef.current = S14_LOOP_FWD[seqIndexRef.current];
        } else if (sleepRowRef.current === 15) {
          seqIndexRef.current = nextLoopIndex(S15_LOOP_REV, seqIndexRef.current);
          frameRef.current = S15_LOOP_REV[seqIndexRef.current];
        }
      } else if (phaseRef.current === "sleepWakeFin") {
        if (sleepRowRef.current === 14) {
          seqIndexRef.current += 1;
          if (seqIndexRef.current >= S14_WAKE_FWD.length) {
            beginFly();
          } else {
            frameRef.current = S14_WAKE_FWD[seqIndexRef.current];
          }
        } else if (sleepRowRef.current === 15) {
          seqIndexRef.current += 1;
          if (seqIndexRef.current >= S15_WAKE_REV.length) {
            beginFly();
          } else {
            frameRef.current = S15_WAKE_REV[seqIndexRef.current];
          }
        }
      } else if (phaseRef.current === "flyOff") {
        // flap 4<->5 forever until off-screen
        if (rowRef.current === ROW_FLY_12) {
          seqIndexRef.current = nextLoopIndex(FLY12_LOOP, seqIndexRef.current);
          frameRef.current = FLY12_LOOP[seqIndexRef.current];
        } else {
          seqIndexRef.current = nextLoopIndex(FLY13_LOOP, seqIndexRef.current);
          frameRef.current = FLY13_LOOP[seqIndexRef.current];
        }
      } else {
        // default stepping for sit/getup/walk/etc.
        const cols =
          phaseRef.current === "sitInit"
            ? SIT_COLS
            : phaseRef.current === "sitLoop"
            ? IDLE_COLS
            : phaseRef.current === "getUp"
            ? GETUP_COLS
            : WALK_COLS;
        frameRef.current = (frameRef.current + 1) % cols;

        // loop bubble cadence
        if (phaseRef.current === "sitLoop" && frameRef.current === 0) {
          idleLoopCount.current += 1;
          if (idleLoopCount.current % QUACK_EVERY_LOOPS === 0) {
            setBubbleOn(true);
            if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
            bubbleTimer.current = window.setTimeout(() => setBubbleOn(false), 1200);
            bubbleIdx.current = (bubbleIdx.current + 1) % BUBBLE_SEQUENCE.length;
          }
        }
      }

      lastFrameTime.current = now;
    }

    // non-moving phases
    if (
      phaseRef.current === "sitInit" ||
      phaseRef.current === "sitLoop" ||
      phaseRef.current === "getUp" ||
      phaseRef.current === "sleepSettle" ||
      phaseRef.current === "sleepLoop" ||
      phaseRef.current === "sleepWakeFin"
    ) {
      // select row for standard phases
      if (phaseRef.current === "sitInit") rowRef.current = ROW_SIT_ONCE;
      else if (phaseRef.current === "sitLoop") rowRef.current = ROW_IDLE_LOOP;
      else if (phaseRef.current === "getUp") rowRef.current = ROW_GETUP;
      // dont for get sleep* rows are already set

      // draw sprite
      if (duckRef.current) {
        duckRef.current.style.backgroundPosition = `${-FRAME_W * frameRef.current}px ${-FRAME_H * rowRef.current}px`;
        duckRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(3.5)`;
      }
      // keep fake cursor parked if visible
      if (fakeRef.current) {
        fakeRef.current.style.transform = `translate(${fakePosRef.current.x}px, ${fakePosRef.current.y}px)`;
        fakeRef.current.style.opacity = fakeVisibleRef.current ? "1" : "0";
      }

      // sit transitions unchanged
      if (phaseRef.current === "sitInit" && frameRef.current === SIT_COLS - 1) {
        phaseRef.current = "sitLoop";
        setOverlayActive(true); // screen becomes a button
        firstRunDone.current = true;
        clearInactivityTimer(); // freeze while sitting
      }
      if (phaseRef.current === "getUp" && frameRef.current === GETUP_COLS - 1) {
        // after get-up, walk away off-screen
        phaseRef.current = "walkAway";
        const goRight = Math.random() < 0.5;
        rowRef.current = goRight ? ROW_WALK_R : ROW_WALK_L;
        targetRef.current = goRight
          ? { x: innerWidth + 160, y: -60 }
          : { x: -160, y: -60 };
      }

      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // moving phases: toMouse, toNav, walkAway, sleepWalkIn, flyOff
    const target = targetRef.current;
    if (target) {
      if (
        ["toMouse", "toNav", "walkAway", "sleepWalkIn"].includes(
          String(phaseRef.current)
        )
      ) {
        rowRef.current = target.x >= posRef.current.x ? ROW_WALK_R : ROW_WALK_L;
      }

      const next = stepTowards(posRef.current, target, SPEED);
      posRef.current = next;

      // draw goose
      if (duckRef.current) {
        duckRef.current.style.backgroundPosition = `${-FRAME_W * frameRef.current}px ${-FRAME_H * rowRef.current}px`;
        duckRef.current.style.transform = `translate(${next.x}px, ${next.y}px) scale(3.5)`;
      }

      // move fake cursor if dragging
      if (dragging.current && fakeRef.current) {
        fakePosRef.current = next;
        fakeRef.current.style.transform = `translate(${fakePosRef.current.x}px, ${fakePosRef.current.y}px)`;
        fakeRef.current.style.opacity = fakeVisibleRef.current ? "1" : "0";
      }

      // arrival handling
      if (Math.hypot(target.x - next.x, target.y - next.y) <= SNAP) {
        if (phaseRef.current === "toMouse") {
          // grab cursor, hide real one
          dragging.current = true;
          fakeVisibleRef.current = true;
          document.body.classList.add("cursor-none");

          // compute nav spot (to the right of _projects)
          const projLink = document.querySelector(
            'a[href="#projects"]'
          ) as HTMLElement | null;
          let navSpot: Vec = { x: innerWidth / 2 + STAND_GAP_X, y: 20 + STAND_Y };
          if (projLink) {
            const r = projLink.getBoundingClientRect();
            navSpot = { x: r.right + STAND_GAP_X, y: r.top + STAND_Y };
          }

          phaseRef.current = "toNav";
          targetRef.current = navSpot;
        } else if (phaseRef.current === "toNav") {
          // drop the fake cursor at the projects tab and KEEP it visible
          dragging.current = false;

          const projLink = document.querySelector(
            'a[href="#projects"]'
          ) as HTMLElement | null;
          if (projLink) {
            const r = projLink.getBoundingClientRect();
            fakePosRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          } else {
            fakePosRef.current = { x: window.innerWidth / 2, y: 32 };
          }
          fakeVisibleRef.current = true;
          if (fakeRef.current) {
            fakeRef.current.style.transform = `translate(${fakePosRef.current.x}px, ${fakePosRef.current.y}px)`;
            fakeRef.current.style.opacity = "1";
          }

          // sit down (row 10 once -> row 9 loop)
          phaseRef.current = "sitInit";
          frameRef.current = 0;
        } else if (phaseRef.current === "walkAway") {
          stopDuck();
        } else if (phaseRef.current === "sleepWalkIn") {
          // reached central spot -> settle
          beginSleepSettle();
        } else if (phaseRef.current === "flyOff") {
          stopDuck();
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  // screen click while idling -> scroll to projects, then get up + walk away
  const handleOverlayClick = () => {
    setOverlayActive(false);
    scrollToSection("#projects", 56);

    // swap cursors now
    fakeVisibleRef.current = false;
    if (fakeRef.current) fakeRef.current.style.opacity = "0";
    document.body.classList.remove("cursor-none");

    if (phaseRef.current === "sitInit" || phaseRef.current === "sitLoop") {
      phaseRef.current = "getUp";
      frameRef.current = 0;
    }

    // resume inactivity tracking for later AFK (sleep)
    scheduleInactivityTimer();
  };

  if (!active) return null;

  // bubble position near duck
  const bubbleStyle: React.CSSProperties = {
    position: "fixed",
    left: posRef.current.x + 28,
    top: posRef.current.y - 24,
  };
  const bubbleText =
    BUBBLE_SEQUENCE[
      (bubbleIdx.current + BUBBLE_SEQUENCE.length - 1) % BUBBLE_SEQUENCE.length
    ];

  return (
    <>
      {overlayActive && (
        <button
          aria-label="go to projects"
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[55] bg-transparent"
        />
      )}

      {bubbleOn && (
        <div
          className="z-[61] select-none pointer-events-none px-2 py-1 rounded-lg border border-white/10 bg-slate-900/80 text-emerald-300 font-mono text-xs shadow"
          style={bubbleStyle}
        >
          {bubbleText}
        </div>
      )}

      {/* Fake cursor */}
      <div
        ref={fakeRef}
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "22px",
          height: "22px",
          transform: `translate(${fakePosRef.current.x}px, ${fakePosRef.current.y}px)`,
          transition: "opacity 180ms ease",
          opacity: fakeVisibleRef.current ? 1 : 0,
          zIndex: 62,
          pointerEvents: "none",
          backgroundImage:
            `url("data:image/svg+xml;utf8,` +
            encodeURIComponent(`
              <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'>
                <path d='M3 2l15 9-6 2 4 7-3 2-4-7-6 2z' fill='%23e5e7eb' stroke='white' stroke-width='1' />
              </svg>
            `) +
            `")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      />

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