import { about, site, snippet } from "../data";

export default function About() {
  return (
    <section id="about" className="wrap py-20 border-t border-white/5">
      <h2 className="sr-only">About</h2>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sidebar */}
        <aside className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 text-slate-300/90 font-mono">personal-info</div>
          <div className="p-3 text-sm text-slate-300/90 font-mono">
            <div className="mb-3">bio</div>
            <div className="mb-3">interests</div>
            <div className="mb-3">education</div>
            <div className="mt-4 border-t border-white/10 pt-3 text-xs">
              find me in:
              <div className="mt-2 flex gap-2">
                <a className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 hover:bg-white/10" href={site.github} target="_blank" aria-label="GitHub">GH</a>
                <a className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 hover:bg-white/10" href={site.linkedin} target="_blank" aria-label="LinkedIn">in</a>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE: “editor” with line numbers */}
        <section className="lg:col-span-6 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-3 h-10 border-b border-white/10">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500/80"></span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500/80"></span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500/80"></span>
            <span className="ml-2 font-mono text-slate-200/90">personal-info</span>
          </div>
          <div className="grid grid-cols-[56px_1fr]">
            <ol className="py-5 pl-4 pr-3 bg-slate-900/40 border-r border-white/10 font-mono text-slate-500/80 text-sm">
              {about.lines.map((_, i) => (
                <li key={i} className="h-7 flex items-center">{i + 1}</li>
              ))}
            </ol>
            <pre className="font-mono text-slate-200/90 text-[15px] leading-7 p-5 whitespace-pre-wrap">
              {about.lines.join("\n")}
            </pre>
          </div>
        </section>

        {/* RIGHT: small snippet card */}
        <aside className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-slate-300/90">// Code snippet:</p>
          <div className="mt-3 p-4 rounded-xl border border-white/10 bg-slate-900/40">
            <pre className="font-mono text-[13px] leading-6 overflow-x-auto">
              {snippet}
            </pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
