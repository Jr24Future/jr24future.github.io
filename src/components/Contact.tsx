import { site } from "../data";

export default function Contact() {
  return (
    <section id="contact" className="wrap py-20 border-t border-white/5">
      <h2 className="text-2xl md:text-3xl font-semibold">Contact</h2>
      <p className="mt-3 text-slate-300/90">Let’s build something great together.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="btn-outline" href={site.github} target="_blank" rel="noreferrer">GitHub</a>
        <a className="btn-outline" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn-outline" href={`mailto:${site.email}`}>Email</a>
      </div>
    </section>
  );
}
