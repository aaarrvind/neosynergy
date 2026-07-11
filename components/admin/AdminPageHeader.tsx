import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminPageHeader({ title, newHref, newLabel }: { title: string; newHref?: string; newLabel?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-display text-2xl font-semibold text-graphite">{title}</h1>
      {newHref && (
        <Link href={newHref}
          className="inline-flex items-center gap-2 rounded-md bg-graphite px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-deep">
          <Plus size={16} /> {newLabel ?? "Add new"}
        </Link>
      )}
    </div>
  );
}
