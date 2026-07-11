export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="dim-line" role="presentation" aria-hidden="true">
      <span className="tick" />
      <span className="dim-line-label">{label}</span>
      <span className="tick" />
    </div>
  );
}
