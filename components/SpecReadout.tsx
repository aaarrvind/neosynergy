import { SpecGroup } from "@/lib/types";

export function SpecReadout({
  specGroups,
  variants,
}: {
  specGroups: SpecGroup[];
  variants?: string[];
}) {
  return (
    <div className="space-y-6">
      {specGroups.map((group) => (
        <div key={group.title}>
          <h3 className="font-display text-xs font-medium uppercase tracking-[0.2em] text-graphite/60 mb-2">
            {group.title}
          </h3>
          <div className="readout">
            {group.rows.map((row) => {
              if (row.values && variants) {
                return variants.map((variant) => (
                  <div className="readout-row" key={`${row.label}-${variant}`}>
                    <span className="readout-label">
                      {row.label}
                      <span className="block text-[0.7rem] text-steel-300">
                        {variant}
                      </span>
                    </span>
                    <span className="readout-value spark">
                      {row.values?.[variant]}
                    </span>
                  </div>
                ));
              }
              return (
                <div className="readout-row" key={row.label}>
                  <span className="readout-label">{row.label}</span>
                  <span className="readout-value">{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
