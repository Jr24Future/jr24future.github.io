import { useEffect, useState } from "react";

/**
 * Counts wrapped lines by cloning the <pre> into a hidden "ghost" <pre>
 * with the same width & font. Uses scrollHeight / lineHeight so the grid
 * column height can't lock the value. Tracks increases AND decreases.
 */
export default function useLineCount<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  deps: any[] = [],
  containerRef?: React.RefObject<HTMLElement | null>
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      if (!el) return 1;

      const rect = el.getBoundingClientRect();
      const width = Math.max(0, rect.width);
      const cs = getComputedStyle(el);

      // Build a hidden clone with identical text metrics.
      const ghost = document.createElement("pre");
      ghost.textContent = el.textContent || "";

      Object.assign(ghost.style, {
        position: "absolute",
        left: "-99999px",
        top: "0",
        visibility: "hidden",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
        width: `${width}px`,
        // copy critical text metrics
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontStyle: cs.fontStyle,
        fontWeight: cs.fontWeight as any,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        wordBreak: cs.wordBreak,
        overflowWrap: (cs as any).overflowWrap || (cs as any).wordWrap || "break-word",
        tabSize: (cs as any).tabSize || "4",
      });

      document.body.appendChild(ghost);

      let lh = parseFloat(cs.lineHeight);
      if (!lh || Number.isNaN(lh)) {
        const fs = parseFloat(cs.fontSize || "16");
        lh = fs * 1.5;
      }

      const lines = Math.max(1, Math.round(ghost.scrollHeight / lh));
      document.body.removeChild(ghost);
      return lines;
    };

    const compute = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const lines = measure();
        setCount((prev) => (prev !== lines ? lines : prev));
      });
    };

    // initial + small retry (fonts/animations settling)
    compute();
    const t1 = setTimeout(compute, 60);

    // Observe size of the element and (optionally) its container
    const roEl = new ResizeObserver(compute);
    roEl.observe(el);

    let roContainer: ResizeObserver | null = null;
    if (containerRef?.current) {
      roContainer = new ResizeObserver(compute);
      roContainer.observe(containerRef.current);
    }

    // Window & orientation
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Font metrics readiness
    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(compute).catch(() => {});
    }

    // Content changes inside the <pre>
    const mo = new MutationObserver(compute);
    mo.observe(el, { childList: true, characterData: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t1);
      roEl.disconnect();
      roContainer?.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return count;
}
