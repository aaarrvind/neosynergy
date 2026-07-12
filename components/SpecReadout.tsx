import { SpecGroup } from "@/lib/types";

export function SpecReadout({
  specGroups,
  variants,
}: {
  specGroups: SpecGroup[];
  variants?: string[];
}) {
  const hasVariants = !!variants && variants.length > 0;

  return (
    <div className="space-y-4">
      {specGroups.map((group) => {
        // Only draw variant columns in groups that actually have
        // per-variant values; other groups stay a simple two-column table
        const variantCols = hasVariants && group.rows.some((r) => r.values);

        return (
          <section key={group.title} className="readout">
            <header className="readout-head">{group.title}</header>
            <div className="readout-scroll">
              <table className="readout-table">
                {variantCols && (
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="sr-only">Specification</span>
                      </th>
                      {variants!.map((variant) => (
                        <th key={variant} scope="col">{variant}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="readout-label">{row.label}</th>
                      {variantCols ? (
                        row.values ? (
                          variants!.map((variant) => (
                            <td key={variant} className="readout-value spark">
                              {row.values?.[variant] ?? "—"}
                            </td>
                          ))
                        ) : (
                          <td className="readout-value" colSpan={variants!.length}>
                            {row.value}
                          </td>
                        )
                      ) : (
                        <td className="readout-value">{row.value}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
