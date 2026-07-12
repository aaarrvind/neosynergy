"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export interface SpecRowDraft {
  id: string;
  label: string;
  value: string;
  /** Per-variant values, keyed by variant name (spec_rows.values JSONB) */
  values?: Record<string, string>;
}
export interface SpecGroupDraft { id: string; title: string; rows: SpecRowDraft[]; }

function uid() { return Math.random().toString(36).slice(2); }

interface Props {
  groups: SpecGroupDraft[];
  onChange: (groups: SpecGroupDraft[]) => void;
  variants?: string[];
}

export function SpecBuilder({ groups, onChange, variants }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function addGroup() {
    onChange([...groups, { id: uid(), title: "New group", rows: [] }]);
  }
  function removeGroup(gid: string) {
    onChange(groups.filter(g => g.id !== gid));
  }
  function updateGroupTitle(gid: string, title: string) {
    onChange(groups.map(g => g.id === gid ? { ...g, title } : g));
  }
  function addRow(gid: string) {
    onChange(groups.map(g => g.id === gid
      ? { ...g, rows: [...g.rows, { id: uid(), label: "", value: "" }] }
      : g));
  }
  function removeRow(gid: string, rid: string) {
    onChange(groups.map(g => g.id === gid ? { ...g, rows: g.rows.filter(r => r.id !== rid) } : g));
  }
  function updateRow(gid: string, rid: string, field: "label" | "value", val: string) {
    onChange(groups.map(g => g.id === gid
      ? { ...g, rows: g.rows.map(r => r.id === rid ? { ...r, [field]: val } : r) }
      : g));
  }
  function updateRowVariantValue(gid: string, rid: string, variant: string, val: string) {
    onChange(groups.map(g => g.id === gid
      ? { ...g, rows: g.rows.map(r => r.id === rid
          ? { ...r, values: { ...(r.values ?? {}), [variant]: val } }
          : r) }
      : g));
  }
  function toggleCollapse(gid: string) {
    setCollapsed(c => ({ ...c, [gid]: !c[gid] }));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-graphite">Specification groups</span>
        <button type="button" onClick={addGroup}
          className="inline-flex items-center gap-1 text-xs text-cyan-deep hover:underline">
          <Plus size={13} /> Add group
        </button>
      </div>
      {groups.length === 0 && (
        <p className="text-xs text-graphite/40 py-4 text-center border border-dashed border-steel-200 rounded-lg">No spec groups yet. Click &ldquo;Add group&rdquo; to start.</p>
      )}
      {groups.map((group) => (
        <div key={group.id} className="rounded-lg border border-steel-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-steel-50 border-b border-steel-200">
            <GripVertical size={14} className="text-graphite/30" />
            <input value={group.title} onChange={e => updateGroupTitle(group.id, e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-graphite focus:outline-none" placeholder="Group title" />
            <button type="button" onClick={() => toggleCollapse(group.id)} className="text-graphite/40 hover:text-graphite">
              {collapsed[group.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button type="button" onClick={() => removeGroup(group.id)} className="text-graphite/40 hover:text-spark">
              <Trash2 size={14} />
            </button>
          </div>
          {!collapsed[group.id] && (
            <div className="p-3 space-y-2">
              {group.rows.map(row => (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input value={row.label} onChange={e => updateRow(group.id, row.id, "label", e.target.value)}
                      className="flex-1 rounded border border-steel-200 px-2 py-1.5 text-xs text-graphite focus:border-cyan focus:outline-none" placeholder="Label (e.g. Spindle speed)" />
                    <input value={row.value} onChange={e => updateRow(group.id, row.id, "value", e.target.value)}
                      className="flex-1 rounded border border-steel-200 px-2 py-1.5 text-xs text-graphite focus:border-cyan focus:outline-none"
                      placeholder={variants?.length ? "Shared value (leave blank if per-variant)" : "Value"} />
                    <button type="button" onClick={() => removeRow(group.id, row.id)} className="text-graphite/30 hover:text-spark flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Per-variant values */}
                  {variants && variants.length > 0 && (
                    <div className="ml-4 grid gap-1 sm:grid-cols-2">
                      {variants.map(variant => (
                        <label key={variant} className="flex items-center gap-2">
                          <span className="w-28 flex-shrink-0 truncate text-[10px] text-graphite/40" title={variant}>{variant}</span>
                          <input
                            value={row.values?.[variant] ?? ""}
                            onChange={e => updateRowVariantValue(group.id, row.id, variant, e.target.value)}
                            className="flex-1 rounded border border-steel-200 px-2 py-1 text-xs text-graphite focus:border-cyan focus:outline-none"
                            placeholder="Value for this variant" />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addRow(group.id)}
                className="flex items-center gap-1 text-xs text-graphite/40 hover:text-cyan-deep">
                <Plus size={12} /> Add row
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
