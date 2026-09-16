import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/data/company";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms governing use of the ${company.shortName} website, including quote requests and product information.`,
  alternates: { canonical: "/terms" },
};

// ---------------------------------------------------------------------------
// NOT LEGAL ADVICE — REVIEW BEFORE LAUNCH
// ---------------------------------------------------------------------------
// These are terms of use for the WEBSITE. They deliberately do not cover the
// sale of machinery: price, delivery, warranty, payment, and liability for
// goods belong in the client's own sales contract / purchase order terms, and
// inventing them here would create conflicting obligations.
//
// Confirm with the client before going live:
//   1. JURISDICTION — stated as the courts of Dubai, UAE. Confirm this matches
//                     their existing sales contracts (a free-zone licence may
//                     specify DIFC instead).
//   2. ENTITY       — confirm the trading licence name matches company.name.
//   3. Ask whether they want a link to their standard terms of sale here.
// ---------------------------------------------------------------------------

const LAST_UPDATED = "2026-09-16";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      summary={`These terms govern your use of the ${company.shortName} website. They do not govern the sale of equipment — supply is subject to a separate written contract or purchase order.`}
      lastUpdated={LAST_UPDATED}
    >
      <h2>Acceptance</h2>
      <p>
        This website is operated by {company.name}, {company.city}. By browsing
        this site or submitting a quote request, you agree to these terms. If
        you do not agree, please do not use the site.
      </p>

      <h2>Product information</h2>
      <p>
        We work to keep specifications, images, and availability on this site
        accurate and current. Even so, the catalogue is published for general
        information, and:
      </p>
      <ul>
        <li>
          Specifications are subject to change by the manufacturer without
          notice, and configurations may vary by model and production batch.
        </li>
        <li>
          Photographs are representative and may show optional equipment,
          tooling, or accessories that are not part of the standard supply.
        </li>
        <li>
          Listing a machine on this site is not a confirmation that it is in
          stock or available for immediate delivery.
        </li>
      </ul>
      <p>
        Always confirm the specification and scope of supply in writing with our
        team before placing an order.
      </p>

      <h2>Quote requests</h2>
      <p>
        Submitting a quote request through this site is an enquiry, not an
        order. Nothing on this site is a binding offer to sell. A contract is
        formed only when we issue a written quotation and you accept it, or when
        we accept your purchase order in writing. Prices, lead times, and
        availability quoted to you are valid only for the period stated in that
        quotation.
      </p>
      <p>
        Please give us accurate contact details so we can respond, and do not
        submit requests on behalf of someone else without their knowledge.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use automated tools to scrape, copy, or bulk-download the catalogue.
        </li>
        <li>
          Submit false, abusive, or misleading enquiries, or attempt to overload
          our forms.
        </li>
        <li>
          Attempt to gain unauthorised access to any part of this site, its
          administrative area, or the systems behind it.
        </li>
        <li>
          Use the site in any way that breaks applicable law or infringes
          someone else&rsquo;s rights.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The design, text, and arrangement of this site are owned by us or used
        under licence. Manufacturer names, model designations, and logos remain
        the property of their respective owners and are used to identify the
        equipment we supply. You may view and print pages for your own business
        evaluation; any other reproduction requires our written permission.
      </p>

      <h2>Third-party links</h2>
      <p>
        Where we link to manufacturer or partner websites, we do so for
        convenience. We do not control those sites and are not responsible for
        their content or their privacy practices.
      </p>

      <h2>Availability and liability</h2>
      <p>
        We aim to keep this site available but do not guarantee uninterrupted
        access, and we may change or withdraw content at any time. To the extent
        permitted by law, we are not liable for indirect or consequential loss
        arising from use of, or inability to use, this website or from reliance
        on information published on it. Nothing in these terms limits liability
        that cannot lawfully be limited.
      </p>
      <p>
        Our obligations for equipment we supply — including warranty,
        installation, and performance — are set out in the relevant sales
        contract, not in these terms.
      </p>

      <h2>Privacy</h2>
      <p>
        Personal information you send us is handled as described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the United Arab Emirates as
        applied in the Emirate of Dubai, and the courts of Dubai have exclusive
        jurisdiction over any dispute arising from them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href={`mailto:${company.emails[0]}`}>{company.emails[0]}</a>, or see
        our <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
