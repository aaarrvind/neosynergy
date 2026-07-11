"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { CategoryNode } from "@/lib/types";

interface Props {
  tree: CategoryNode[];
  onDelete: (id: string, name: string) => void;
  deleting: string | null;
}

function TreeNode({ node, onDelete, deleting, depth = 0 }: {
  node: CategoryNode;
  onDelete: (id: string, name: string) => void;
  deleting: string | null;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className={`flex items-center gap-1 rounded-md px-2 py-1.5 group hover:bg-steel-50 transition-colors ${depth === 0 ? "font-medium" : ""}`}
        style={{ paddingLeft: `${8 + depth * 20}px` }}>
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className={`flex-shrink-0 text-graphite/30 hover:text-graphite transition-colors ${hasChildren ? "" : "invisible"}`}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Name */}
        <span className={`flex-1 text-sm truncate ${depth === 0 ? "text-graphite font-semibold" : depth === 1 ? "text-graphite" : "text-graphite/70"}`}>
          {node.name}
        </span>

        {/* Depth badge */}
        <span className="text-[10px] font-mono text-graphite/30 flex-shrink-0 mr-2">
          L{node.depth + 1}
        </span>

        {/* Actions — visible on hover */}
        <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
          <Link
            href={`/products/${node.pathSlugs.join("/")}`}
            target="_blank"
            className="rounded p-1 text-graphite/40 hover:text-cyan-deep"
            title="View live page"
          >
            <ExternalLink size={13} />
          </Link>
          <Link
            href={`/admin/categories/${node.id}`}
            className="rounded p-1 text-graphite/40 hover:text-graphite"
            title="Edit"
          >
            <Edit2 size={13} />
          </Link>
          <Link
            href={`/admin/categories/new?parent=${node.id}`}
            className="rounded p-1 text-graphite/40 hover:text-cyan-deep"
            title="Add subcategory"
          >
            <Plus size={13} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(node.id, node.name)}
            disabled={deleting === node.id}
            className="rounded p-1 text-graphite/40 hover:text-spark disabled:opacity-40"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onDelete={onDelete} deleting={deleting} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTreePanel({ tree, onDelete, deleting }: Props) {
  if (tree.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-steel-200 py-12 text-center text-sm text-graphite/40">
        No categories yet. Create your first one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-steel-200 bg-white overflow-hidden">
      <ul className="divide-y divide-steel-50 py-1">
        {tree.map(node => (
          <TreeNode key={node.id} node={node} onDelete={onDelete} deleting={deleting} />
        ))}
      </ul>
    </div>
  );
}
