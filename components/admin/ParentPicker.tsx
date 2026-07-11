"use client";
import { CategoryNode } from "@/lib/types";

interface Props {
  tree: CategoryNode[];
  value: string;
  onChange: (id: string) => void;
  excludeId?: string; // prevent selecting self as parent
}

function flattenWithIndent(
  nodes: CategoryNode[],
  depth = 0,
  excludeId?: string
): { id: string; label: string; depth: number }[] {
  const result: { id: string; label: string; depth: number }[] = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue; // skip self and descendants
    result.push({ id: node.id, label: node.name, depth });
    if (node.children.length > 0) {
      result.push(...flattenWithIndent(node.children, depth + 1, excludeId));
    }
  }
  return result;
}

export function ParentPicker({ tree, value, onChange, excludeId }: Props) {
  const options = flattenWithIndent(tree, 0, excludeId);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-graphite">Parent category</span>
      <span className="text-xs text-graphite/50">
        Select &ldquo;Top level&rdquo; to make this a root category, or choose a parent to nest it underneath.
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-md border border-steel-200 px-3 py-2 text-sm text-graphite focus:border-cyan focus:outline-none"
      >
        <option value="">(Top level — no parent)</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {"\u00A0".repeat(opt.depth * 4)}{opt.depth > 0 ? "— " : ""}{opt.label}
          </option>
        ))}
      </select>
      {value && (
        <p className="text-xs text-cyan-deep mt-1">
          Path preview: {(() => {
            function findPath(nodes: CategoryNode[], id: string): string[] | null {
              for (const n of nodes) {
                if (n.id === id) return [...n.pathNames];
                const r = findPath(n.children, id);
                if (r) return r;
              }
              return null;
            }
            const path = findPath(tree, value);
            return path ? `${path.join(" › ")} › (new category)` : "(new category)";
          })()}
        </p>
      )}
    </label>
  );
}
