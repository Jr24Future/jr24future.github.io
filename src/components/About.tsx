import { useMemo, useState } from "react";
import { about, site, resumeShort } from "../data";

type TabKey = "bio" | "interests" | "education" | "resume";

const TABS: { key: TabKey; label: string }[] = [
  { key: "bio",        label: "bio" },
  { key: "interests",  label: "interests" },
  { key: "education",  label: "education" },
  { key: "resume",     label: "resume" },
];

export default function About() {
  const [tab, setTab] = useState<TabKey>("bio");

  const editorLines = useMemo(() => {
    if (tab === "bio") return about.bio;
    if (tab === "interests") return ["/** interests */", ...about.interests.map(t => `- ${t}`)];
    if (tab === "education")
      return ["/** education */", ...about.education.map(e => `- ${e.school} — ${e.degree} (${e.when})`)];
    // resume (short)
    const lines: string[] = [];
    lines.push("/** resume (short) */");
    lines.push("");
    lines.push("// summary");
    resumeShort.summary.forEach(s => lines.push(s));
    lines.push("");
    lines.push("// experience");
    resumeShort.experience.forEach(x => {
      lines.push(`- ${x.role} @ ${x.org} (${x.when})`);
      x.points.forEach(p => lines.push(`  • ${p}`));
    });
    lines.push("");
    lines.push("// skills");
    lines.push(resumeShort.skills.join(", "));
    lines.push("");
    lines.push('// see full → /resume');
    return lines;
  }, [tab]);

  return (
    <section id="about" className="wrap py-20 border-t border-white/5">
      <h2 className="sr-only">About</h2>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT: sidebar */}
        <aside className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 text-slate-300/90 font-mono">
            personal-info
          </div>

          {/* tabs */}
          <div className="p-3 text-sm text-slate-300/90 font-mono">
            <div className="flex flex-wrap gap-2">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={[
                    "px-3 py-1.5 rounded-lg border text-xs transition",
                    tab === key
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                      : "border-white/10 hover:bg-white/10"
                  ].join(" ")}
                  aria-current={tab === key ? "page" : undefined}
                >
                  {label}
                </button>
              ))}
            </div>



            {/* quick facts (auto-updates with tab) */}
            <div className="mt-4 text-xs leading-6">
              {tab === "bio" && (
                <div className="space-y-1">
                  <div><span className="text-slate-400">// name:</span> {site.name}</div>
                  <div><span className="text-slate-400">// role:</span> {site.role}</div>
                  <div><span className="text-slate-400">// email:</span> {site.email}</div>
                  <div><span className="text-slate-400">// location:</span> {site.location}</div>                  
                </div>
              )}
              {tab === "interests" && (
                <div className="space-y-1">
                  <div className="text-slate-400">// currently into:</div>
                  <div>TypeScript • React • Canvas • Security</div>
                </div>
              )}
              {tab === "education" && (
                <div className="space-y-1">
                  <div className="text-slate-400">// school:</div>
                  <div>Iowa State University</div>
                </div>
              )}
            </div>


            {/* social */}
            <div className="mt-5 border-t border-white/10 pt-3 text-xs">
              find me in:
              <div className="mt-2 flex gap-2">
                <a className="icon-btn" href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
                <a className="icon-btn" href={site.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
                <a className="icon-btn" href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE: editor */}
        <section className="lg:col-span-6 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-3 h-10 border-b border-white/10">
            <span className="tab-dot"></span>
            <span className="tab-dot"></span>
            <span className="tab-dot"></span>
            <span className="ml-2 font-mono text-slate-200/90">
              {tab === "bio" ? "about_me.ts"
                : tab === "interests" ? "interests.md"
                : tab === "education" ? "education.md"
                : "resume.ts"}
            </span>
          </div>

          <div className="grid grid-cols-[56px_1fr]">
            <ol className="editor-lines text-slate-500/80">
              {editorLines.map((_, i) => <li key={i} />)}
            </ol>
            <div className="p-5">
              <pre className="editor-code font-mono text-slate-200/90 text-[15px] leading-7 whitespace-pre-wrap">
                {editorLines.join("\n")}
              </pre>

              {tab === "resume" && (
                <div className="mt-4">
                  <a href="/resume" className="btn-primary">see full version of resume</a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: code snippet card */}
        <aside className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-slate-300/90">// Code snippet:</p>
          <div className="mt-3 p-4 rounded-xl border border-white/10 bg-slate-900/40">
            <pre className="font-mono text-[13px] leading-6 overflow-x-auto">
              <code>
                <span className="token-key">type</span> Role{" "}
                <span className="token-key">=</span> <span className="token-str">"Support"</span>{" "}
                <span className="token-key">|</span> <span className="token-str">"Engineer"</span>;
                {"\n"}
                <span className="token-key">interface</span> Experience {"{"}{"\n"}
                &nbsp;&nbsp;role: Role;{"\n"}
                &nbsp;&nbsp;org: <span className="token-type">string</span>;{"\n"}
                &nbsp;&nbsp;start: <span className="token-type">string</span>;{"\n"}
                &nbsp;&nbsp;end?: <span className="token-type">string</span>;{"\n"}
                {"}"}{"\n\n"}
                <span className="token-key">const</span> current: Experience {"="} {"{"}{"\n"}
                &nbsp;&nbsp;role: <span className="token-str">"Engineer"</span>,{"\n"}
                &nbsp;&nbsp;org: <span className="token-str">"Iowa State University"</span>,{"\n"}
                &nbsp;&nbsp;start: <span className="token-str">"Oct 2023"</span>,{"\n"}
                &nbsp;&nbsp;end: <span className="token-str">"Present"</span>{"\n"}
                {"}"};{"\n"}
              </code>
            </pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
