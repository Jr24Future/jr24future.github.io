import { useEffect, useRef } from "react";

export default function Typewriter({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const n = (text ?? "").length;               
    ref.current?.style.setProperty("--n", String(n));
  }, [text]);

  return (
    <span ref={ref} className="typewriter">
      {text}
    </span>
  );
}
