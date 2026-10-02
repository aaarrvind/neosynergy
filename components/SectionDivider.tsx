export function SectionDivider({
  label,
  size = "sm",
}: {
  label: string;
  /** "lg" for a divider that heads a whole page section, such as Contact's "Reach us". */
  size?: "sm" | "lg";
}) {
  return (
    <div className={`dim-line ${size === "lg" ? "dim-line-lg" : ""}`} role="presentation" aria-hidden="true">
      <span className="tick" />
      <span className="dim-line-label">{label}</span>
      <span className="tick" />
    </div>
  );
}
