import SnakeGame from "./SnakeGame.tsx";
import { site } from "../data";
import Typewriter from "../random/Typewriter";
import TechTicker from "./TechTicker.tsx";
import { useEffect, useRef, useState } from "react";

type Stage = "init" | "peeked" | "liked" | "done";
type GameView = "snake" | "tetris";

export default function Hero() {
  const [showFluid, setShowFluid] = useState(false);
  const [stage, setStage] = useState<Stage>("init");
  const fluidTimer = useRef<number | null>(null);

  // NEW: game switch state (snake <-> tetris placeholder for now)
  const [gameView, setGameView] = useState<GameView>("snake");
  const handleSwitchGame = () =>
    setGameView((g) => (g === "snake" ? "tetris" : "snake"));

  // toast state (must be inside component)
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  function showToast(msg: string, ms = 5000) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }

  function triggerFluidPeek() {
    setShowFluid(true);
    setStage("init");
    if (fluidTimer.current) window.clearTimeout(fluidTimer.current);
    fluidTimer.current = window.setTimeout(() => {
      setShowFluid(false);
      setStage("peeked"); // now show “if you liked / didn’t like”
    }, 7000);
  }

  function handleLike() {
    setShowFluid(true);
    setStage("liked"); // permanent until exit
    showToast("Yeeeeeeeey! have fun!", 2000);
  }

  function handleDislike() {
    setShowFluid(false);
    setStage("done"); // hide all buttons
    showToast("Sorry, I'll get rid of it right away.", 5000);
  }

  function handleExit() {
    setShowFluid(false);
    setStage("done"); // back to snake game, no more overlay
  }

  useEffect(() => {
    return () => {
      if (fluidTimer.current) window.clearTimeout(fluidTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <section
      id="hello"
      className="wrap py-20 md:py-20 grid md:grid-cols-12 gap-8 items-center overflow-x-hidden"
    >
      {/* LEFT */}
      <div className="md:col-span-7 relative md:pb-12 hero-glow">
        <p className="text-slate-300/80 font-mono">// Hello World, I am</p>
        <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
          <span className="block text-slate-50">{site.name}</span>
        </h1>

        <p className="mt-3 text-emerald-400 font-mono text-3xl md:text-3xl">
          <Typewriter text={">_Software_Engineer"} />
        </p>

        <div className="mt-4 space-y-2 text-slate-300/85 font-mono break-words">
          <p>// {site.blurb}</p>
          <p className="break-all">
            <span style={{ color: "rgb(110,110,247)" }}>const</span>{" "}
            <span className="text-emerald-300">githubLink</span> ={" "}
            <a
              className="text-cyan-300 hover:underline break-all"
              href={site.github}
              target="_blank"
              rel="noreferrer"
            >
              "{site.github}"
            </a>
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <a className="btn-primary" href="#projects">
            view projects
          </a>
          <a className="btn-outline" href="#contact">
            contact
          </a>
        </div>

        <div className="hidden md:block absolute inset-x-0 top-[26rem] px-4 overflow-hidden max-w-full">
          <TechTicker />
        </div>
      </div>

      {/* RIGHT: Game card + fluid overlay */}
      <aside className="md:col-span-5">
        <div className="relative">
          {/* UPDATED: render snake or placeholder, and pass onSwitchGame */}
          {gameView === "snake" ? (
            <SnakeGame
              playerName={site.name}
              siteLabel={site.label}
              onSwitchGame={handleSwitchGame}
            />
          ) : (
            // Placeholder until you create TetrisGame.tsx
            <div className="game-card">
              <div className="game-card__inner relative">
                <div className="block max-w-full rounded-[18px] w-full h-[360px] md:h-[420px] bg-slate-900/70 border border-white/10 shadow-2xl flex items-center justify-center">
                  <div className="text-center px-6">
                    <div className="font-mono text-emerald-300 text-xl">
                      TETRIS
                    </div>
                    <div className="mt-2 font-mono text-slate-300/80 text-sm">
                      // coming soon
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="hidden sm:block text-sm text-slate-200/90">
                    <p className="font-mono">// build in progress</p>
                    <p className="font-mono">// switch back anytime</p>
                    <p className="font-mono">// 👇</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-primary" disabled aria-disabled="true">
                      play
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleSwitchGame}
                    >
                      switch game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showFluid && (
            <>
              <iframe
                title="WebGL Fluid Simulation"
                src="https://paveldogreat.github.io/WebGL-Fluid-Simulation/"
                className="absolute inset-0 w-full h-full rounded-[22px] border-0 shadow-inner fluid-fade"
                loading="eager"
                style={{ zIndex: 40 }}
              />
              {/* Floating exit when in persistent mode */}
              {stage === "liked" && (
                <button
                  onClick={handleExit}
                  className="absolute top-2 right-2 z-50 px-3 py-1.5 rounded-lg border border-white/20 bg-slate-900/70 text-slate-100 font-mono text-sm hover:bg-slate-900/85"
                  aria-label="Exit fluid simulation"
                  title="Exit"
                >
                  ✕
                </button>
              )}
            </>
          )}
        </div>

        {/* Buttons outside the box */}
        <div className="mt-3 flex justify-center gap-3">
          {stage === "init" && !showFluid && (
            <button onClick={triggerFluidPeek} className="btn-outline">
              You want to try something fun... Click me
            </button>
          )}

          {stage === "peeked" && (
            <>
              <button onClick={handleLike} className="btn-primary">
                Did you like it?
              </button>
              <button onClick={handleDislike} className="btn-outline">
                Or Didn't
              </button>
            </>
          )}

          {stage === "liked" && (
            <button onClick={handleExit} className="btn-outline">
              exit
            </button>
          )}

          {stage === "done" && (
            <button
              onClick={() => {
                setShowFluid(true);
                setStage("liked");
              }}
              className="btn-thin"
            >
              try me again anytime
            </button>
          )}
        </div>

        {/* Ephemeral message below buttons/exit */}
        {toast && (
          <div className="mt-2 flex justify-center">
            <div
              className="mt-2 mx-auto w-fit inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-emerald-300 shadow"
              role="status"
              aria-live="polite"
            >
              {toast}
            </div>
          </div>
        )}
      </aside>

      <div className="md:hidden mt-8 overflow-hidden max-w-full">
        <TechTicker />
      </div>
    </section>
  );
}