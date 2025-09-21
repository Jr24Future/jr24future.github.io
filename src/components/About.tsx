import { useMemo, useState } from "react";
import { about, site, resumeShort } from "../data";
import { Github, Linkedin, Instagram, Link as LinkIcon, GraduationCap, BookOpen, Code2, Shield } from "lucide-react";
import { interestsNow, schools, resumeSkillsShort, resumeProjectLinks } from "../data";

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
    lines.push("/** resume (short) */", "", "// summary");
    resumeShort.summary.forEach(s => lines.push(s));
    lines.push("", "// experience");
    resumeShort.experience.forEach(x => {
      lines.push(`- ${x.role} @ ${x.org} (${x.when})`);
      x.points.forEach(p => lines.push(`  • ${p}`));
    });
    lines.push("", "// skills", resumeShort.skills.join(", "), "", '// see full → /resume');
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

            {/* contextual content */}
            <div className="mt-4 text-xs leading-6 space-y-4">
              {/* BIO → keep social links */}
              {tab === "bio" && (
                <>
                  <div className="space-y-1">
                    <div><span className="text-slate-400">// name:</span> {site.name}</div>
                    <div><span className="text-slate-400">// role:</span> {site.role}</div>
                    <div><span className="text-slate-400">// email:</span> {site.email}</div>
                    <div><span className="text-slate-400">// location:</span> {site.location}</div>
                  </div>

                  <hr className="border-white/10 my-2" />

                  <div>find me in:</div>
                  <div className="mt-2 flex gap-2 text-slate-100">
                    <a className="icon-btn" href={site.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                      <Github className="w-5 h-5" />
                    </a>
                    <a className="icon-btn" href={site.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    {site.instagram && (
                      <a className="icon-btn" href={site.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* INTERESTS → icons + links */}
              {tab === "interests" && (
                <>
                  <div className="text-slate-400">// currently into:</div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {interestsNow.map((it) => (
                      <a
                        key={it.label}
                        href={it.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
                      >
                        {it.label.includes("TypeScript") && <Code2 className="w-4 h-4 text-sky-300" />}
                        {it.label.includes("React") && <Code2 className="w-4 h-4 text-cyan-300" />}
                        {it.label.includes("Canvas") && <BookOpen className="w-4 h-4 text-emerald-300" />}
                        {it.label.includes("Security") && <Shield className="w-4 h-4 text-emerald-300" />}
                        <span>{it.label}</span>
                        <LinkIcon className="ml-auto w-3.5 h-3.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </>
              )}

              {/* EDUCATION → school icons + links + notes */}
              {tab === "education" && (
                <div className="space-y-3">
                  {schools.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block rounded-lg border border-white/10 hover:bg-white/10 px-2 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-300" />
                        <span>{s.name}</span>
                      </div>
                      {s.note && <div className="pl-6 text-slate-400">{s.note}</div>}
                    </a>
                  ))}
                </div>
              )}

              {/* RESUME → skills chips + links to projects section */}
              {tab === "resume" && (
                <>
                  <div className="text-slate-400">// skills</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resumeSkillsShort.map((sk) => (
                      <span key={sk} className="px-2 py-1 rounded-lg border border-white/10 bg-white/5">{sk}</span>
                    ))}
                  </div>

                  <div className="text-slate-400 mt-4">// projects</div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {resumeProjectLinks.map((p) => (
                      <a
                        key={p.label}
                        href={p.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
                      >
                        <Code2 className="w-4 h-4 text-emerald-300" />
                        <span>{p.label}</span>
                      </a>
                    ))}
                  </div>

                  <div className="pt-3">
                    <a href="/resume" className="btn-primary">see full version of resume</a>
                  </div>
                </>
              )}
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
              {/* If you prefer the CTA here instead, move it from the left card */}
            </div>
          </div>
        </section>

        {/* RIGHT: code snippet card */}
        <aside className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-slate-300/90">// Code snippet:</p>
          <div className="mt-3 p-4 rounded-xl border border-white/10 bg-slate-900/40">
            <pre className="font-mono text-[13px] leading-6 overflow-x-auto">
{`type Role = "Support" | "Engineer";
interface Experience {
  role: Role;
  org: string;
  start: string;
  end?: string;
}

const current: Experience = {
  role: "Engineer",
  org: "Iowa State University",
  start: "Oct 2023",
  end: "Present",
};`}
            </pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
