export default function TopHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="top-hint" role="status" aria-live="polite">
      <p className="font-mono text-emerald-400 text-sm">
        // why are you up here? start scrolling down 👇
      </p>
    </div>
  );
}
