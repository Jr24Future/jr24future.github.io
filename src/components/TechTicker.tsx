import { useState } from "react";
import { createPortal } from "react-dom";

type Tech = { name: string; src: string };

const tech: Tech[] = [
  { name: "TypeScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React",      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Vite",       src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" },
  { name: "Tailwind",   src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Node.js",    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Python",     src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "Git",        src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "Docker",     src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "SQL",        src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "C++",        src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
  { name: "Java",       src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "C",          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
  { name: "HTML",       src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS",        src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "JavaScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "mongoDB",    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "Angular",    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg" },
  { name: "BootStrap",  src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "json",       src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/json/json-original.svg" },
  { name: "jamf",       src: "/JAMF.svg" }
];

// Floating tooltip rendered into <body> so no clipping
function FloatingTip({ show, text, x, y }: { show: boolean; text: string; x: number; y: number }) {
  if (!show) return null;
  return createPortal(
    <div
      className="pointer-events-none fixed -translate-x-1/2 -translate-y-2 z-[9999]
                 px-2.5 py-1 rounded-md border border-white/10 bg-slate-900/90
                 text-xs font-mono text-slate-100 shadow-lg"
      style={{ left: x, top: y }}
      role="status"
      aria-live="polite"
    >
      {text}
      {/* arrow */}
      <div className="absolute left-1/2 top-full -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 border-b border-r border-white/10" />
    </div>,
    document.body
  );
}

export default function TechTicker() {
  // seamless loop
  const items = tech.concat(tech);

  const [tip, setTip] = useState<{ show: boolean; text: string; x: number; y: number }>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

// bubble sits above icon
  const showTip = (el: HTMLElement, text: string) => {
    const r = el.getBoundingClientRect();
    setTip({
      show: true,
      text,
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top - 8), 
    });
  };
  const hideTip = () => setTip((s) => ({ ...s, show: false }));

  return (
    <>
      <div className="relative opacity-90 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="ticker">
          {items.map((t, i) => (
            <button
              key={i}
              type="button"
              className="ticker-item outline-none"
              aria-label={t.name}
              onMouseEnter={(e) => showTip(e.currentTarget, t.name)}
              onMouseMove={(e) => showTip(e.currentTarget, t.name)}
              onMouseLeave={hideTip}
              onFocus={(e) => showTip(e.currentTarget, t.name)}
              onBlur={hideTip}
            >
              <img
                src={t.src}
                alt=""
                className="ticker-icon"
                loading="lazy"
                decoding="async"
                width={36}
                height={36}
              />
            </button>
          ))}
        </div>
      </div>

      <FloatingTip show={tip.show} text={tip.text} x={tip.x} y={tip.y} />
    </>
  );
}
