"use client";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";

interface Column<T> { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode; }

interface AdminTableProps<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  editHref: (row: T) => string;
  onDelete: (id: string) => void;
  deleting?: string | null;
}

export function AdminTable<T extends { id: string }>({ rows, columns, editHref, onDelete, deleting }: AdminTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-graphite/50 py-8 text-center">No records yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-steel-200 bg-steel-50">
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-medium text-graphite/60">{col.label}</th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-graphite/60">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-100">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-steel-50">
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-3 text-graphite">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link href={editHref(row)} className="rounded p-1.5 text-graphite/50 hover:bg-steel-100 hover:text-graphite">
                    <Edit2 size={15} />
                  </Link>
                  <button onClick={() => onDelete(row.id)} disabled={deleting === row.id}
                    className="rounded p-1.5 text-graphite/50 hover:bg-steel-100 hover:text-spark disabled:opacity-40">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
