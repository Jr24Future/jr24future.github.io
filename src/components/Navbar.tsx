import { useEffect, useRef, useState } from "react";
import { site } from "../data";
import { scrollToSection } from "../lib/scrollToSection";

type LinkItem = { href: string; label: string; right?: boolean };

const links: LinkItem[] = [
  { href: "#hello",    label: "_hello" },
  { href: "#about",    label: "_about_me" },
  { href: "#projects", label: "_projects" },
  // right cluster:
  { href: "#contact",  label: "_contact_me", right: true },
  { href: "/resume",   label: "_resume",     right: true }, // NEW
];

export default function Navbar() {
  const [active, setActive] = useState<string>("#hello");
  const [offset, setOffset] = useState(56);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 56;
      setOffset(Math.round(h + 4));
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const sectionEls = links
      .filter(l => l.href.startsWith("#"))
      .map(l => document.querySelector(l.href))
      .filter(Boolean) as Element[];

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(`#${(e.target as HTMLElement).id}`);
        });
      },
      { threshold: 0.55 }
    );
    sectionEls.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (location.pathname === "/resume") setActive("/resume");
    };
    onPop(); // run once
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return; 
    e.preventDefault();
    e.stopPropagation();
    scrollToSection(href, offset);
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
        {left.map(l => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => handleNavClick(e, l.href)}
            className={`font-mono text-slate-300/85 hover:text-white ${active === l.href ? "nav-active text-white" : ""}`}
          >
            {l.label}
          </a>
        ))}

        {/* push right cluster */}
        <div className="ml-auto flex items-center gap-4">
          {right.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`font-mono text-slate-300/85 hover:text-white ${
                active === l.href || (l.href === "/resume" && location.pathname === "/resume")
                  ? "nav-active text-white"
                  : ""
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
