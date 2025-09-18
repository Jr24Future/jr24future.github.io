import { useEffect, useRef, useState } from "react";
import { site } from "../data";
import { scrollToSection } from "../lib/scrollToSection";

const links = [
  { href: "#hello", label: "_hello" },
  { href: "#about", label: "_about_me" },
  { href: "#projects", label: "_projects" },
  { href: "#contact", label: "_contact_me", right: true },
];

export default function Navbar() {
  const [active, setActive] = useState("#hello");
  const [offset, setOffset] = useState(56);
  const headerRef = useRef<HTMLElement | null>(null);

  // Measure header height for accurate scroll offset
  useEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 56;
      // add a couple px to account for border/blur
      setOffset(Math.round(h + 4));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Observe sections to set active link
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${(e.target as HTMLElement).id}`);
        });
      },
      { threshold: 0.55 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Single handler: prevent default and use our smooth scroll helper
  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    e.stopPropagation();
    scrollToSection(href, offset); // one engine to rule them all
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur"
      role="banner"
    >
      <nav className="wrap  h-12 flex items-center gap-6 text-sm" aria-label="Primary">
        <span className="font-mono text-slate-300/80">{site.label}</span>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href} // keep a real hash for accessibility & right-click copy
            onClick={(e) => handleNavClick(e, l.href)}
            className={`font-mono text-slate-300/85 hover:text-white ${
              active === l.href ? "nav-active text-white" : ""
            } ${l.right ? "ml-auto" : ""}`}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
