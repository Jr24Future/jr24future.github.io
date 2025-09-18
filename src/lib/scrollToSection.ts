export function scrollToSection(hash: string, offset = 56) {
  if (!hash || !hash.startsWith("#")) return;
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, rect.top + window.scrollY - offset);

  window.scrollTo({ top: targetY, behavior: "smooth" });

  // Update URL without triggering a jump
  history.replaceState(null, "", hash);

  // If something shifts layout (e.g., arrow hiding) — do a 2nd pass next frame
  requestAnimationFrame(() => {
    const r2 = el.getBoundingClientRect();
    const y2 = Math.max(0, r2.top + window.scrollY - offset);
    window.scrollTo({ top: y2, behavior: "smooth" });
  });
}
