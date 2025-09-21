import { site } from "../data";

/** --- Data pulled/condensed from your resume --- */
type Bullet = string;
type Exp = { org: string; role: string; when: string; bullets: Bullet[] };
type Edu = { school: string; when: string; note?: string };

const education: Edu[] = [
  {
    school: "Iowa State University — B.S. Software Engineering (Minor: Cybersecurity)",
    when: "2022 — Present",
    note: "Currently a junior.",
  },
  {
    school: "Sigourney Jr-Sr High School — High School Diploma",
    when: "Spring 2022",
  },
];

const experience: Exp[] = [
  {
    org: "Iowa State University, Endpoint",
    role: "IT Support Mac Technician",
    when: "Oct 2023 — Present",
    bullets: [
      "Managed 4,000+ Macs & Dells via Jamf/AWS/ServiceNow.",
      "Handled secure backups & transfers.",
      "Diagnosed & resolved hardware/software issues.",
    ],
  },
  {
    org: "Sigourney Area Development Corporation",
    role: "Front-end Developer and Coder",
    when: "Apr 2022 — Aug 2022",
    bullets: [
      "Collaborated with dev/test teams on scalable software.",
      "Improved UI and modernized legacy code.",
      "Coordinated progress with management & partners.",
    ],
  },
  {
    org: "Walmart",
    role: "Electronic Sales Associate",
    when: "Jun 2021 — Oct 2023",
    bullets: [
      "Resolved customer technical issues in-store and by phone.",
      "Delivered friendly, knowledgeable service.",
    ],
  },
];

const codingSkills = [
  { label: "(HTML, CSS, JS)", pct: 80 },
  { label: "Java", pct: 65 },
  { label: "C", pct: 50 },
  { label: "MySQL, MongoDB", pct: 70 },
  { label: "React, Angular", pct: 80 },
];

const otherSkills = [
  { label: "Database Knowledge | Network Devices", pct: 60 },
  { label: "Leadership", pct: 80 },
  { label: "Building Computers", pct: 90 },
  { label: "Debugging | Troubleshooting", pct: 75 },
];

/** --- Small atoms --- */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 bg-white/5">
      {children}
    </span>
  );
}

function SkillBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-slate-200">
        <span>{label}</span>
        <span className="text-slate-400">{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1 text-slate-200">
      {items.map((b, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-5 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DownloadMenu() {
  return (
    <details className="relative">
      <summary className="btn-outline cursor-pointer list-none inline-flex items-center gap-2">
        download resume
        <svg width="14" height="14" viewBox="0 0 20 20" className="opacity-70">
          <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </summary>
      <div className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur p-2 shadow-xl">
        <a className="block px-3 py-2 rounded-lg hover:bg-white/10" href="/resume.pdf" download>
          PDF (ATS-friendly)
        </a>
        <a className="block px-3 py-2 rounded-lg hover:bg-white/10" href="/resume.png" download>
          PNG (designed)
        </a>
      </div>
    </details>
  );
}

/** --- Page --- */
export default function ResumePage() {
  return (
    <div className="min-h-dvh text-slate-100">
      {/* Banner hero — uses your site theme, not a dark override */}
      <div
        className="relative h-44 md:h-56 lg:h-64 border-b border-white/10"
        style={{
          backgroundImage: "url(/resume-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* theme-colored overlay glow to match the site vibe */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/40" />
        <div className="wrap relative h-full flex items-end pb-4">
          <div className="flex items-end gap-4">
            <img
              src="/headshot.jpeg"
              alt={`${site.name} headshot`}
              className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover ring-2 ring-white/20 shadow-xl"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{site.name}</h1>
              <p className="text-emerald-300 font-mono">{site.role}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a href="/" className="btn-ghost">_back</a>
            <DownloadMenu />
          </div>
        </div>
      </div>

      <main className="wrap py-8 grid lg:grid-cols-12 gap-6">
        {/* LEFT profile card (uses your glass/panel) */}
        <aside className="lg:col-span-3 panel p-5">
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-400 font-mono">// email</div>
              <a className="underline underline-offset-4 hover:text-emerald-300" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 font-mono">// phone</div>
              <a className="underline underline-offset-4 hover:text-emerald-300" href="tel:+16415410683">
                +1 (641) 541-0683
              </a>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 font-mono">// location</div>
              <div>Ames, Iowa, USA</div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="text-slate-400 font-mono">// links</div>
              <div className="mt-2 flex flex-col gap-1">
                <a className="underline underline-offset-4 hover:text-emerald-300" target="_blank" href="https://github.com/Jr24Future">github.com/Jr24Future</a>
                <a className="underline underline-offset-4 hover:text-emerald-300" target="_blank" href="https://www.linkedin.com/in/rr-ll-software">linkedin.com/in/rr-ll-software</a>
                <a className="underline underline-offset-4 hover:text-emerald-300" target="_blank" href={site.instagram}>instagram.com/jr_frames_</a>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="text-slate-400 font-mono mb-2">// badges</div>
              <div className="flex flex-wrap gap-2">
                <Pill>TypeScript</Pill>
                <Pill>React</Pill>
                <Pill>Tailwind</Pill>
                <Pill>Security</Pill>
                <Pill>Java</Pill>
                <Pill>C</Pill>
                <Pill>Script Automation (.sh)</Pill>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT column: Education / Experience / Skills */}
        <section className="lg:col-span-9 space-y-6">
          <SectionCard title="Education">
            <div className="space-y-4">
              {education.map((e, i) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute left-0 top-[8px] block h-3 w-3 rounded-full bg-emerald-400/80 ring-2 ring-slate-900" />
                  <div className="font-semibold">{e.school}</div>
                  <div className="text-sm text-slate-400">{e.when}</div>
                  {e.note && <p className="mt-1 text-slate-200">{e.note}</p>}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Experience">
            <div className="space-y-5">
              {experience.map((x, i) => (
                <div key={i} className="relative pl-6">
                  <span className="absolute left-0 top-[8px] block h-3 w-3 rounded-full bg-emerald-400/80 ring-2 ring-slate-900" />
                  <div className="font-semibold">{x.role}</div>
                  <div className="text-slate-300">{x.org}</div>
                  <div className="text-sm text-slate-400">{x.when}</div>
                  <BulletList items={x.bullets} />
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="Coding Languages">
              {codingSkills.map((s) => (
                <SkillBar key={s.label} {...s} />
              ))}
            </SectionCard>
            <SectionCard title="Skills">
              {otherSkills.map((s) => (
                <SkillBar key={s.label} {...s} />
              ))}
            </SectionCard>
          </div>
        </section>
      </main>
    </div>
  );
}
