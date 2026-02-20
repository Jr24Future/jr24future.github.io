import { projects } from "../data";

export default function Projects() {
  return (
    <section id="projects" className="wrap py-20 scroll-mt-24 border-t border-white/5">
      <h2 className="text-2xl md:text-3xl font-semibold">Projects</h2>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <article
            key={p.title}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col"
          >
            <h3 className="text-lg font-semibold">{p.title}</h3>

            <p className="mt-2 text-sm text-slate-300/90">{p.desc}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              {p.link && (
                <a
                  className="btn-outline"
                  href={p.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Live
                </a>
              )}
              {p.repo && (
                <a
                  className="btn-outline"
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Repo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}