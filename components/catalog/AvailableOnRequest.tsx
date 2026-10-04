import Link from "next/link";
import { ArrowRight, PackageSearch, Phone } from "lucide-react";
import { company } from "@/lib/data/company";
import { categoryLabel } from "@/lib/catalog";
import { CategoryNode } from "@/lib/types";

/**
 * Shown in place of an empty product grid. Neo Synergy is a trading company,
 * so "nothing listed" means "not listed online yet", not "not available":
 * the page turns into an enquiry, with the category already written into the
 * contact form.
 */
export function AvailableOnRequest({ node }: { node: CategoryNode }) {
  const enquiry = `/contact?enquiry=${encodeURIComponent(categoryLabel(node))}`;
  const tel = `tel:${company.phones[0].replace(/\s/g, "")}`;

  return (
    <div className="rounded-lg border border-dashed border-steel-200 bg-steel-50/60 px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-cyan-deep ring-1 ring-steel-100">
        <PackageSearch size={22} strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold text-graphite">Available on request</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-graphite/65">
        We don&rsquo;t list {node.name} online yet, but we source and supply them. Tell us what you need and our team will come back with options, pricing,
        and lead times.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Link
          href={enquiry}
          className="pressable arrow-link inline-flex items-center gap-2 rounded-md bg-graphite px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-deep"
        >
          Enquire about {node.name} <ArrowRight size={16} className="arrow-icon" />
        </Link>
        <a href={tel} className="inline-flex items-center gap-2 text-sm font-medium text-graphite/70 hover:text-graphite">
          <Phone size={15} strokeWidth={1.75} /> {company.phones[0]}
        </a>
      </div>
    </div>
  );
}
