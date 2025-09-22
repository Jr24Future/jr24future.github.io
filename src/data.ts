export const site = {
  label: "_erroll_barker",
  name: "Erroll Barker",
  role: "Software Engineer",
  location: "Ames, IA",
  blurb:
    "Sit back, relax, and enjoy a cup of coffee. Play classic arcade games, or explore what I’ve been building, otherwise hang out with the Goose.",
  github: "https://github.com/Jr24Future",
  linkedin: "https://www.linkedin.com/in/your-handle",
  email: "errollbarker1234@gmail.com",
  instagram: "https://www.instagram.com/jr_frames_/", 
};

export const interestsNow = [
  { label: "TypeScript",                      href: "https://www.typescriptlang.org/" },
  { label: "React",                           href: "https://react.dev/" },
  { label: "Cybersecurity (CVE)",             href: "https://www.cve.org/" },
  { label: "DeepSeek R1",                     href: "https://deepseek.com/" },
  { label: "Shell scripting (.sh)",           href: "https://www.gnu.org/software/bash/manual/bash.html" },
  { label: "macOS automation",                href: "https://ss64.com/osx/" },
  { label: "Raspberry Pi • embedded",         href: "https://www.raspberrypi.com/documentation/" },
  { label: "Fusion 360 • 3D printing",        href: "https://www.autodesk.com/products/fusion-360" },
  { label: "Homelab: DNS / firewall",         href: "https://www.netgate.com/blog/open-source-firewalls" },
  { label: "Nikon D800 photography",          href: "https://www.nikonusa.com/en/nikon-products/product-archive/dslr-cameras/d800.html" },
  { label: "Editing in Lightroom",            href: "https://www.adobe.com/products/photoshop-lightroom.html" },
];
export const schools = [
  {
    name: "Iowa State University",
    url: "https://www.iastate.edu/",
    note: "B.S. Software Engineering (Minor: Cybersecurity)",
  },
  {
    name: "Sigourney Jr-Sr High School",
    url: "https://www.sigourneyschools.com/",
    note: "High School Diploma",
  },
  {
    name: "Mavi Teknik Lisesi",
    url: "https://pancarosb.k12.tr/tr/",
    note: "technical high school learned Mechatronics",
  },
];

export const resumeSkillsShort = [
  "TypeScript", "React", "Node", "Tailwind",
  "Java", "C", "SQL", "Security",
];

export const resumeProjectLinks = [
  { label: "Snake Collector", href: "#projects" },
  { label: "URL Shortener",   href: "#projects" },
  { label: "Portfolio",       href: "#projects" },
];

export const about = {
 bio: [
 "/** About me */",
    "Hi there! 👋 I'm a Senior at Iowa State University studying Software Engineering with a minor in Cybersecurity.",
    "",
    "I love building full-stack web apps and exploring how to make them secure, reliable, and fun to use. My background spans Java, C, Python, and modern tools like TypeScript + React.",
    "",
    "I’m graduating this year and I’m actively seeking a full-time role and I’m equally open to co-ops, internships, or trial periods to prove what I can do. If you’re looking for someone driven, adaptable, and eager to contribute, let’s connect.",
    "",
    "Outside of tech, you’ll find me experimenting with Raspberry Pi projects,taking photos with my Nikon D800 or gaming.",
    "I will also never say no to a good cup of coffee. ☕️",
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

