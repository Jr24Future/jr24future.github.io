export const site = {
  label: "_erroll_barker",
  name: "Erroll Barker",
  role: "Software Engineer",
  location: "Ames, IA",
  blurb:
    "Sit back, relax, and enjoy a cup of coffee. Play classic arcade games, or explore what I’ve been building, otherwise hang out with the Goose.",
  github: "https://github.com/Jr24Future",
  linkedin: "https://www.linkedin.com/in/rr-ll-software",
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
    "When it comes to my interests it depends on what I am currently working on ",
    "TypeScript · React · Vite",

    "Canvas/WebGL toys",
    "Security & CTFs",
    "Automation and tiny tools",
  ],
  education: [
    { school: "Iowa State University",          degree: "B.S. Software Engineering, Minor in Cybersecurity",  when: "2022 — Present" },
    { school: "Indian Hills Community College", degree: "studied front-end + MySQL",                          when: "2020 — 2021" },
    { school: "Sigourney highschool",           degree: "HighSchool degree",                                  when: "2019 — 2021" },
    { school: "Mavi Teknik Lisesi",             degree: "Mechatronics",                                       when: "2016 — 2019"},
  ],
};

export type Project = {
  title: string;
  desc: string;
  tech: string[];
  repo?: string;
  link?: string;
  details?: {
    paragraphs: string[];
    now?: string;
  };
};

export const projects: Project[] = [
  {
    title: "Local DeepSeek Training",
    desc:
      "DeepSeek-R1 local LLM lab on Ubuntu (Ollama), calibrated for consistent assistant behavior with local-first workflows + secure on-demand device access.",
    tech: ["Ubuntu", "Ollama", "DeepSeek-R1", "Networking", "Security"],
    details: {
      paragraphs: [
        "This project started because I wanted the benefits of an LLM assistant without relying on the internet for every request. I liked the idea of having something fast, private, and always available — especially for personal workflows and local devices.",
        "I deployed and tested three model sizes of DeepSeek-R1 (7B, 8B, and 14B) on my Ubuntu server using Ollama. To keep my comparisons meaningful, I fed each model the same baseline personal context and then iterated on fine-tuning / response calibration so I could see how each model behaved under the same prompt and expectation set. A big part of this was focusing on “assistant consistency” — making the responses predictable and useful for the types of tasks I actually care about.",
        "Because it runs locally, the default behavior is local-first: when a task doesn’t require the internet, the assistant stays on the private network and uses local IP workflows. When I do want the assistant to interact with a device like a NAS, I designed a “connect only when needed” pattern — temporarily exposing only what’s required, performing the task, and then tearing that exposure back down. The goal was reducing unnecessary network exposure and keeping the whole setup controlled.",
        "I also experimented with identity-aware behavior by integrating face recognition and voice recognition, training the system so it can recognize me and respond only when I’m the one interacting with it. That part became a foundation for the JR assistant project later.",
      ],
      now: "This is still my “LLM lab.” I use it to test assistant behavior, validate automation patterns, and prototype secure ways to let an AI system interact with local infrastructure without turning it into a constantly exposed service.",
    },
  },

  {
    title: "Embedded Face Recognition + Gesture-Controlled Camera Tracking",
    desc:
      "Raspberry Pi real-time face recognition + pan/tilt camera tracking with gesture commands, tuned for stable, low-jitter movement and clean “lost target” handling.",
    tech: ["Raspberry Pi 4B", "Python", "OpenCV", "Pi Camera", "Servos"],
    details: {
      paragraphs: [
        "This started as a “can I build this for real?” project — something that blends software, hardware, and real-time input. I wanted a system that could identify a specific person and physically track them, but also be controllable without needing a keyboard or screen.",
        "I built a real-time face recognition pipeline using Python and OpenCV on a Raspberry Pi 4B, then connected it to a Pi Camera Module and servo motors so the camera could pan/tilt and follow a target face. The key challenge wasn’t just detecting a face — it was making the tracking stable enough to feel intentional instead of jittery. That meant tuning detection frequency, smoothing movement, and handling “lost target” cases cleanly.",
        "On top of that, I added gesture controls so I could trigger camera behavior hands-free. Gesture recognition became a way to layer in commands without needing to interrupt the tracking flow. This project pushed me to think in terms of real-time systems: performance limits, event timing, handling noisy input, and building a loop that stays responsive.",
      ],
      now: "This became a reusable module. Pieces of it feed directly into JR — specifically identity recognition and hands-free input concepts.",
    },
  },

  {
    title: "Personal Portfolio Website",
    desc:
      "A living portfolio + UI playground built in React/TypeScript with animation experiments, mini-games, and an idle “duck assistant” that guides users to Projects.",
    tech: ["React", "TypeScript", "Vite", "Tailwind v4", "Canvas"],
    repo: "https://github.com/Jr24Future/jr24future.github.io",
    details: {
      paragraphs: [
        "This one exists because I wanted a portfolio that felt like me, not just another template. The goal wasn’t only “show projects” — it was also “show how I think,” which for me includes interaction, animation, and playful UI ideas.",
        "I designed the site from scratch and kept it as a sandbox where I could rebuild any effect I found interesting online: transitions, motion cues, mouse-follow behaviors, and micro-interactions. It started as a JavaScript-heavy project, and more recently I’ve been moving it toward TypeScript to keep it cleaner and easier to scale as it grows. Under the hood it’s built with the basics (HTML/CSS/SCSS concepts) plus React for structure and reusability.",
        "One of the features I’m weirdly proud of is the AFK interaction: when the user is idle, a little duck walks in, grabs the cursor, and guides it toward a key section (like Projects). On paper it’s funny — but technically it’s a clean example of event-driven UI: idle detection, animation sequencing, controlled cursor movement logic, and making sure it doesn’t feel broken or annoying.",
      ],
      now: "It’s my living portfolio and UI playground. I keep updating it whenever I finish a project or want to experiment with new interactions.",
    },
  },

  {
    title: "Financial Companion Android App",
    desc:
      "Team-built Android finance app with charts + live data integrations, PDF→structured→Excel pipeline, and an AI chat feature with fallback to human support.",
    tech: ["Android", "Java", "OkHttp", "APIs", "Data Parsing"],
    repo: "https://github.com/Jr24Future/Classes/tree/main/SE309/android/ta4_1",
    details: {
      paragraphs: [
        "This project came out of team-based development with a practical goal: build a finance app that isn’t just tracking numbers but actually helps you understand your financial health and make better decisions. It was built in Android Studio with a split frontend/backend workflow, and I worked on the frontend side.",
        "The app’s core concept is personal + family finance monitoring: tracking categories, giving health indicators (doing poorly / average / great relative to income), and then turning that into goal-based recommendations. A lot of the value comes from the integrations: pulling in external data sources (stocks, currency exchange), showing it visually with graphs, and keeping the UI synced with real-time or frequently updated values.",
        "One of the larger features was building a document pipeline: convert PDFs into structured data, parse it, and then generate Excel-compatible outputs. That meant thinking about data formatting, parsing reliability, and keeping the UX clear even when inputs vary.",
        "We also added an AI chat feature — a ChatGPT-powered chatbox that supports ongoing conversation, not just one-off prompts. The idea was that if the assistant can’t move the conversation forward (or the user needs something beyond automation), the flow can route the user to end-user/human support rather than trapping them in a dead-end experience.",
        "On the technical side, I used Java and OkHttp to manage async networking and API calls cleanly, focusing on reliability: error handling, predictable UI states, and making sure a failed response doesn’t make the app feel broken.",
      ],
    },
  },

  {
    title: "CVE-2024-30078 Research PoC",
    desc:
      "Defensive security research in an isolated VM lab: modeled endpoint risk paths safely, focused on reproducibility, monitoring, and mitigation thinking.",
    tech: ["Security Research", "VM Lab", "ATtiny85", "Telemetry", "Hardening"],
    details: {
      paragraphs: [
        "This was a personal security research project I built because I like understanding how real-world security failures happen — not just reading about them, but modeling them safely in a controlled environment.",
        "I ran everything in an isolated lab setup on my own server using a VM. The core idea was demonstrating risk around USB HID / keystroke injection behavior (BadUSB-style), and validating how a chained workflow could behave end-to-end in a controlled test environment. The emphasis here is on reproducibility and defense: being able to show “this is what the risk looks like,” measure what happens, and then use that to think clearly about mitigations.",
        "I also built a controlled telemetry / webhook receiver on my side to validate how data movement would occur during a test — again, in an environment designed not to touch real user data. The point wasn’t “steal anything,” it was “understand the path and prove the behavior in a lab so you can defend against it.”",
        "(For résumé/portfolio writing, I keep this framed around controlled lab testing + mitigations.)",
      ],
      now: "The output is mostly knowledge + methodology. It sharpened how I think about access control, endpoint hardening, monitoring, and designing systems so one weak link can’t cascade.",
    },
  },

  {
    title: "JR — Personal GenAI Assistant",
    desc:
      "A long-running personal assistant (Python/Ubuntu) with identity whitelist + action layer for automation, structured notes, and project scaffolding.",
    tech: ["Python", "Ubuntu", "GenAI", "Automation", "Face/Voice ID"],
    details: {
      paragraphs: [
        "JR exists because I wanted an assistant that behaves more like a real tool than a chat window. Think “Alexa-style convenience,” but built for my workflows: automation, coding help, and the ability to interact with my own environment instead of being trapped in a sandbox.",
        "This project has been evolving for over 7 years. It started in Python and over time I’ve been modernizing and restructuring it, including moving pieces toward Java as the system grows. JR runs continuously on my Ubuntu server (24/7) and I can also access it through a VM on my desktop when I want to develop or test locally.",
        "What makes JR different from a basic chatbot is the action layer: it can create folders/files, generate structured notes, produce “cleaned up” versions of messy spoken instructions, and (when I explicitly request it) push things to Git with a proper README. So if I say something like “create a new project folder, name it X, and take notes,” it can turn that into a tidy project skeleton and documentation.",
        "Security-wise, I treat identity as a first-class feature. JR uses a whitelist model: if it doesn’t recognize a face/voice identity in its database, it responds like “unauthorized” and refuses to continue until the identity is explicitly enrolled. That keeps the assistant from acting like an “open command interface,” and instead makes it feel like a private tool designed for a specific user.",
        "JR also ties together other modules I built earlier (like face recognition) and expands them into a single assistant pipeline.",
      ],
      now: "It’s my daily driver for automation experiments. I keep expanding it as my infrastructure evolves, especially as I add new hardware nodes for peripherals and integrate new tool APIs.",
    },
  },

  {
    title: "Secure Ubuntu Server + TrueNAS Homelab",
    desc:
      "Infrastructure backbone: pfSense firewalling, VMware segmentation, TrueNAS ZFS snapshots, OpenVPN/SSH access, fail2ban hardening, and evolving hardware nodes.",
    tech: ["pfSense", "VMware", "TrueNAS", "ZFS", "OpenVPN", "Linux"],
    details: {
      paragraphs: [
        "This started as a practical need: I wanted a stable place to run services, store data, and build projects like JR without depending on third-party hosting. Over time it became a full home lab — not just “a computer in the corner,” but a system with real infrastructure patterns: routing, firewalling, storage strategy, and service hosting.",
        "The hardware is intentionally overbuilt: 128GB DDR4 ECC RAM, dual Intel Xeon E5-2680 v4 CPUs, 6TB storage, and a dedicated M.2 drive for the OS. That gives me room to run VMs, storage services, and experiments without the platform collapsing under load.",
        "For storage, I use TrueNAS with snapshot-based backups. Snapshots give me fast rollback and recovery, which matters when you’re constantly iterating and occasionally breaking things during upgrades. On the virtualization side I use VMware so I can cleanly separate workloads: databases, DNS, Git services, VPN, and whatever else I add over time.",
        "Network/security is handled with pfSense, and for remote access I use OpenVPN plus SSH for admin tasks. I also run fail2ban to reduce noise from brute-force attempts and keep access safer.",
        "One thing that makes this setup unique is that it evolves constantly. I’m always updating services, improving security posture, and adding hardware automation features. For example, I’ve added nodes that behave like “networked GPIO” (Raspberry Pi style) using Arduino most of the time — enabling JR to interact with real peripherals like cameras, microphones, and servos through my private environment.",
      ],
      now: "It’s the backbone for everything else — hosts JR, stores data, and is my training ground for infrastructure and security discipline.",
    },
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

