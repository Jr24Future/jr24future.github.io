import SnakeGame from "./SnakeGame.tsx";
import { site } from "../data";
import Typewriter from "../random/Typewriter";
import TechTicker from "./TechTicker.tsx";

export default function Hero() {
  //const { value: role, done } = useTypingEffect("Software Engineer", 80);

  return (
    <section id="hello" className="wrap py-20 md:py-20 grid md:grid-cols-12 gap-8 items-center">
      <div className="md:col-span-7 relative md:pb-12 hero-glow">
        <p className="text-slate-300/80 font-mono">// Hello World, I am</p>
        <h1 className="mt-3 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
          <span className="block text-slate-50">{site.name}</span>
        </h1>

        <p className="mt-3 text-emerald-400 font-mono text-3xl md:text-3xl">
          <Typewriter text={">_Software_Engineer"} />
        </p>

        <div className="mt-4 space-y-2 text-slate-300/85 font-mono">
          <p>// {site.blurb}</p>
          <p>
            <span style={{ color: "rgb(110,110,247)" }}>const</span>{" "}
            <span className="text-emerald-300">githubLink</span> ={" "}
            <a className="text-cyan-300 hover:underline" href={site.github} target="_blank" rel="noreferrer">
              "{site.github}"
            </a>
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <a className="btn-primary" href="#projects">view projects</a>
          <a className="btn-outline" href="#contact">contact</a>
        </div>
  <div className="hidden md:block md:absolute md:inset-x-0 md:top-104 pr-15">
    <TechTicker />
  </div>
      </div>

      <aside className="md:col-span-5 ">
        <SnakeGame playerName={site.name} siteLabel={site.label} />
      </aside>

      <div className="md:hidden mt-8">
  <TechTicker />
</div>
    </section>
  );
}
