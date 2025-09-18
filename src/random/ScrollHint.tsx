export default function ScrollHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div id="scroll-hint" className="scroll-hint-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-emerald-400"
        fill="none"
        viewBox="0 0 20 20"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
