export const site = {
  label: "_erroll_barker",
  name: "Erroll Barker",
  role: "Software Engineer",
  blurb:
    "Sit back, relax, and enjoy a cup of coffee. Play classic arcade games, or explore what I’ve been building otherwise sit around and meet the Goose",
  github: "https://github.com/Jr24Future",
  linkedin: "https://www.linkedin.com/in/your-handle",
  email: "errollbarker1234@gmail.com",
};

export const about = {
  lines: [
    "/** About me */",
    "Hi there! I'm a junior at Iowa State University studying",
    "Software Engineering with a minor in Cybersecurity.",
    "",
    "I love building efficient software and exploring infosec.",
    "",
    "Actively seeking co-op/internship opportunities to learn,",
    "ship great work, and make an impact.",
  ],
};

export type Project = {
  title: string;
  desc: string;
  tech: string[];
  link?: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    title: "Snake Collector (Canvas)",
    desc: "Classic snake game with a collectible twist and a win overlay.",
    tech: ["TypeScript", "Canvas", "Vite"],
    repo: "https://github.com/yourhandle/snake",
  },
  {
    title: "URL Shortener",
    desc: "A tiny service to shorten links with click analytics.",
    tech: ["React", "Node", "SQLite"],
    repo: "https://github.com/yourhandle/url-shortener",
  },
  {
    title: "Portfolio",
    desc: "This website, built with React + Tailwind v4.",
    tech: ["React", "Tailwind", "Vite"],
    repo: "https://github.com/Jr24Future/your-portfolio",
  },
];

export const snippet = `type Role = "Support" | "Engineer";
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
  end: "Present"
};`;
