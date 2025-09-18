export default function Footer() {
  return (
    <footer className="py-10 border-t border-white/5 text-center text-sm text-slate-400">
      <span>© {new Date().getFullYear()} • Built with React + Tailwind</span>
    </footer>
  );
}
