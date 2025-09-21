export const site = {
  label: "_erroll_barker",
  name: "Erroll Barker",
  role: "Software Engineer",
  location: "Ames, IA",
  blurb:
    "Sit back, relax, and enjoy a cup of coffee. Play classic arcade games, or explore what I’ve been building — otherwise hang out with the Goose.",
  github: "https://github.com/Jr24Future",
  linkedin: "https://www.linkedin.com/in/your-handle",
  email: "errollbarker1234@gmail.com",
  instagram: "https://www.instagram.com/jr_frames_/", 
};

export const about = {
  bio: [
    "/** About me */",
    "Hi there! I'm a junior at Iowa State University studying",
    "Software Engineering with a minor in Cybersecurity.",
    "",
    "I love building efficient software and exploring infosec.",
    "",
    "Actively seeking co-op/internship opportunities to learn,",
    "ship great work, and make an impact.",
  ],
  interests: [
    "TypeScript · React · Vite",
    "Canvas/WebGL toys",
    "Security & CTFs",
    "Automation and tiny tools",
  ],
  education: [
    { school: "Iowa State University", degree: "B.S. Software Engineering, Minor in Cybersecurity", when: "2023 — Present" },
  ],
};

// keep your projects as-is
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

export const resumeShort = {
  summary: [
    "Junior at Iowa State (SE + Cyber minor). Building with TypeScript/React.",
    "Interested in security, systems, and developer tooling."
  ],
  experience: [
    { role: "Engineer", org: "Iowa State University", when: "Oct 2023 — Present", points: [
      "Built internal tools in TypeScript/Node, improved DX and reliability.",
      "Led small features end-to-end; wrote tests and docs."
    ]},
    { role: "Support Tech", org: "Local ISP", when: "Summer 2023", points: [
      "Handled tickets; automated common diagnostics in Python.",
    ]},
  ],
  skills: ["TypeScript", "React", "Node", "SQLite", "Tailwind", "Python", "Git", "Docker"],
};

