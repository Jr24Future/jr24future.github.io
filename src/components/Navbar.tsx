import { useEffect, useRef, useState } from "react";
import { site } from "../data";
import { scrollToSection } from "../lib/scrollToSection";

type LinkItem = { href: string; label: string; right?: boolean };

const links: LinkItem[] = [
  { href: "#hello",    label: "_hello" },
  { href: "#about",    label: "_about_me" },
  { href: "#projects", label: "_projects" },
  { href: "#contact",  label: "_contact_me", right: true },
  { href: "#/resume",  label: "_resume",     right: true }, // HashRouter route
];

export default function Navbar() {
  const [active, setActive] = useState<string>(window.location.hash || "#hello");
  const [offset, setOffset] = useState(56);
  const headerRef = useRef<HTMLElement | null>(null);

  // keep offset in sync with header height
  useEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 56;
      setOffset(Math.round(h + 4));
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);

  // observe in-page sections only (exclude "#/resume")
  useEffect(() => {
    const sectionHrefs = links
      .map(l => l.href)
      .filter(h => h.startsWith("#") && !h.startsWith("#/")); // real sections only

    const sectionEls = sectionHrefs
      .map(h => document.querySelector(h))
      .filter(Boolean) as Element[];

    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActive(`#${(e.target as HTMLElement).id}`);
      }),
      { threshold: 0.55 }
    );
    sectionEls.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // keep highlight in sync with hash (for #/resume and normal #sections)
  useEffect(() => {
    const onHash = () => setActive(window.location.hash || "#hello");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // smooth-scroll only for in-page anchors, not router routes
  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    if (href.startsWith("#/")) return; // let HashRouter navigate
    e.preventDefault();
    e.stopPropagation();
    scrollToSection(href, offset);
    // update active immediately for snappy highlight
    setActive(href);
  }

  const left = links.filter(l => !l.right);
  const right = links.filter(l => l.right);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur"
      role="banner"
    >
      <nav className="wrap h-12 flex items-center gap-6 text-sm" aria-label="Primary">
        <span className="font-mono text-slate-300/80">{site.label}</span>

        {/* left cluster */}
        {left.map(l => {
          const isActive = active === l.href;
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`font-mono text-slate-300/85 hover:text-white ${isActive ? "nav-active text-white" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {l.label}
            </a>
          );
        })}

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-4">
          {right.map(l => {
            const isResume = l.href === "#/resume";
            const isActive =
              (isResume && active.startsWith("#/resume")) || active === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleNavClick(e, l.href)}
                className={`font-mono text-slate-300/85 hover:text-white ${isActive ? "nav-active text-white" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {l.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
