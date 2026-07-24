// Clean, letter-spaced section eyebrow — shared across pages
export function Eyebrow({ label, className = "" }: { label: string; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>
      {label}
    </p>
  );
}
