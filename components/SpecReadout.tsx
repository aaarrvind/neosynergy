import { SpecGroup } from "@/lib/types";

export function SpecReadout({
  specGroups,
  variants,
}: {
  specGroups: SpecGroup[];
  variants?: string[];
}) {
  // Variant columns are only worth drawing if at least one row anywhere in the
  // sheet actually differs between variants. A product can carry variant names
  // while every spec is shared, and splitting those into identical columns
  // would be noise.
  const hasVariants =
    !!variants &&
    variants.length > 0 &&
    specGroups.some((g) => g.rows.some((r) => r.values));

  // One column for the label plus one per variant (or a single value column).
  const valueCols = hasVariants ? variants!.length : 1;

  return (
    <div className={`spec-panel ${hasVariants ? "spec-compare" : ""}`}>
      <div className="spec-scroll">
        <table className="spec-table">
          <caption className="sr-only">
            Technical specification
            {hasVariants ? `, compared across ${variants!.join(" and ")}` : ""}
          </caption>

          {specGroups.map((group) => {
            // Name the variant columns only where this group actually differs
            // between them. Repeating them above a group whose every value is
            // shared implies a comparison that isn't there.
            const groupVaries = hasVariants && group.rows.some((r) => r.values);

            return (
            // A tbody per group lets each band re-declare its column headers,
            // so assistive tech keeps the right variant attached to each value.
            <tbody key={group.title}>
              <tr className="spec-band">
                <th scope="col" className="spec-band-title">
                  {group.title}
                </th>
                {groupVaries ? (
                  variants!.map((variant) => (
                    <th key={variant} scope="col" className="spec-band-variant">
                      {variant}
                    </th>
                  ))
                ) : (
                  <th scope="col" colSpan={valueCols}>
                    <span className="sr-only">Value</span>
                  </th>
                )}
              </tr>

              {group.rows.map((row) => (
                <tr key={row.label} className="spec-row">
                  <th scope="row" className="spec-label">
                    {row.label}
                  </th>
                  {hasVariants && row.values ? (
                    variants!.map((variant) => (
                      <td key={variant} className="spec-value">
                        {row.values?.[variant] ?? "—"}
                      </td>
                    ))
                  ) : (
                    // Shared across every variant — spans the value columns so
                    // the grid stays aligned with the rows above and below.
                    <td className="spec-value is-shared" colSpan={valueCols}>
                      {row.value}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}
