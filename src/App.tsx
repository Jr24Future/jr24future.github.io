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

/* --- Global handler for #hash links anywhere in the app --- */
function useHashLinkScroll(offset = 56) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;         // only pure hashes "#about"

      e.preventDefault();
      e.stopPropagation();
      scrollToSection(href, offset);             // JS smooth scroll with navbar offset
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [offset]);
}

export default function App() {
  const [showHint, setShowHint] = useState(true);
  const [showTopHint, setShowTopHint] = useState(false);

  // ✅ ACTIVATE the global hash-link handler (56px ≈ your sticky header height)
  useHashLinkScroll(56);

  useEffect(() => {
    // Reveal on scroll
    const revealables = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            if ((e.target as HTMLElement).id === "about") setShowHint(false);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -3% 0px" }
    );
    revealables.forEach(el => io.observe(el));

    // Hide the arrow once the user actually scrolls down a bit
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > 60 && showHint) setShowHint(false);

      // Easter egg only when truly at top (after arrow has been hidden once)
      const atTop = y <= 5;
      const shouldShowTop = atTop && !showHint;
      setShowTopHint(shouldShowTop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Also hide the arrow on explicit user intention
    const hideNow = () => setShowHint(false);
    window.addEventListener("wheel", hideNow, { once: true, passive: true });
    window.addEventListener("touchstart", hideNow, { once: true, passive: true });
    const keyOnce = (e: KeyboardEvent) => {
      if (["ArrowDown","PageDown"," ","Space","Enter"].includes(e.key)) setShowHint(false);
      window.removeEventListener("keydown", keyOnce);
    };
    window.addEventListener("keydown", keyOnce);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", hideNow);
      window.removeEventListener("touchstart", hideNow);
      window.removeEventListener("keydown", keyOnce);
      io.disconnect();
    };
  }, [showHint]);

  return (
    <div className="min-h-dvh">
      <a href="#hello" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-2 focus:py-1 focus:rounded focus:bg-yellow-300 focus:text-black">
        Skip to content
      </a>

      <Navbar />

      <main>
        {/* hero fills initial viewport (minus sticky header height ~48-60px) */}
        <section className="min-h-[calc(100dvh-3rem)] flex items-center" id="hello">
          <Hero />
        </section>

        {/* sections revealed on scroll */}
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

      {/* centered down-arrow */}
      <ScrollHint show={showHint} />

      {/* top easter egg */}
      <TopHint show={showTopHint} />

      {/* desktop-goose buddy */}
      <DuckAssistant spriteUrl="/goose-sprites.png" />
    </div>
  );
}
