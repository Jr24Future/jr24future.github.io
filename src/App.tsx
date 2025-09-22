import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollHint from "./random/ScrollHint";
import TopHint from "./random/TopHint";
import DuckAssistant from "./random/DuckAssistant";
import { scrollToSection } from "./lib/scrollToSection";

/* --- Global handler for in-page #hash scroll --- */
function useHashLinkScroll(offset = 56) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") || "";

      // Skip React Router navigation like "#/resume"
      if (href.startsWith("#/")) return;

      // Handle only pure in-page anchors (e.g. "#about")
      if (!href.startsWith("#")) return;

      e.preventDefault();
      e.stopPropagation();
      scrollToSection(href, offset);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [offset]);
}



export default function App() {
  const [showHint, setShowHint] = useState(true);
  const [showTopHint, setShowTopHint] = useState(false);

  useHashLinkScroll(56);

  useEffect(() => {
    if (!location.hash && (window.scrollY ?? 0) < 2) {
      if ("scrollRestoration" in history) {
        (history as any).scrollRestoration = "manual";
      }
      window.scrollTo(0, 24);
    }
  }, []);

  useEffect(() => {
    const h = window.location.hash || "";
    if (h && !h.startsWith("#/")) {
      // slight delay so layout is ready
      setTimeout(() => scrollToSection(h, 56), 0);
    }
  }, []);

useEffect(() => {
  const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const el = e.target as HTMLElement;

        if (e.isIntersecting) {
          el.classList.add("is-visible");
          // one-time hint hide when #about first appears
          if (el.id === "about") setShowHint(false);
        } else {
          el.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.15,              // ~15% visible to count as "in"
      root: null,
      rootMargin: "0px 0px -8% 0px" // start hiding a touch before bottom
    }
  );

  els.forEach((el) => io.observe(el));

  // your arrow/top-hint logic can stay as-is:
  const lastY = { current: window.scrollY || 0 };
  const onScroll = () => {
    const y = window.scrollY || 0;
    const goingUp = y < lastY.current;
    lastY.current = y;

    if (y > 60 && showHint) setShowHint(false);
    const atTop = y <= 2;
    setShowTopHint(atTop && goingUp && !showHint);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  const hideNow = () => setShowHint(false);
  window.addEventListener("wheel", hideNow, { once: true, passive: true });
  window.addEventListener("touchstart", hideNow, { once: true, passive: true });
  const keyOnce = (e: KeyboardEvent) => {
    if (["ArrowDown","PageDown"," ","Space","Enter"].includes(e.key)) setShowHint(false);
    window.removeEventListener("keydown", keyOnce);
  };
  window.addEventListener("keydown", keyOnce);

  return () => {
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", hideNow);
    window.removeEventListener("touchstart", hideNow);
    window.removeEventListener("keydown", keyOnce);
  };
}, [showHint, setShowHint, setShowTopHint]);

 useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (!id) return;

            // only update for real in-page anchors
            const newHash = `#${id}`;
            if (window.location.hash !== newHash) {
              history.replaceState(null, "", newHash);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5, // section must be at least 50% visible
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);


  return (
    <div className="min-h-dvh w-full overflow-x-hidden">
      <a href="#hello" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-2 focus:py-1 focus:rounded focus:bg-yellow-300 focus:text-black">
        Skip to content
      </a>

      <Navbar />

      <main>
        <section className="min-h-[calc(100dvh-3rem)] flex items-center reveal" id="hello" >
          <Hero />
        </section>
        <section id="about" className="reveal">
          <About />
        </section>
        <section id="projects" className="reveal">
          <Projects />
        </section>
        <section id="contact" className="reveal">
          <Contact />
        </section>
      </main>

      <Footer />
      <ScrollHint show={showHint} />
      <TopHint show={showTopHint} />
      <DuckAssistant spriteUrl="/goose-sprites.png" />
    </div>
  );
}
