import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/data/company";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.shortName} collects, uses, and protects personal information submitted through this website.`,
  alternates: { canonical: "/privacy" },
};

// ---------------------------------------------------------------------------
// NOT LEGAL ADVICE — REVIEW BEFORE LAUNCH
// ---------------------------------------------------------------------------
// Every statement below was written to match what this codebase actually does:
// the quote form (app/api/quote/route.ts) emails contact details plus cart
// items to the sales inbox via Resend and stores nothing in a database, and
// the site sets no advertising or tracking cookies.
//
// Confirm with the client — and correct here — before going live:
//   1. RETENTION      — how long sales keeps enquiry emails (stated as "no
//                       longer than necessary"; give a real period if known).
//   2. PROCESSORS     — the list below covers Vercel, Supabase, and Resend.
//                       Add anything else the client connects (CRM, WhatsApp
//                       Business, Google Ads remarketing, live chat).
//   3. ANALYTICS      — the cookie section says "no analytics cookies". Vercel
//                       Analytics is cookieless so this stays true; switching
//                       to GA4 makes it FALSE and requires a consent banner.
//   4. CONTACT        — the privacy contact is sales@; the client may want a
//                       dedicated privacy@ address.
// ---------------------------------------------------------------------------

const LAST_UPDATED = "2026-09-16";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      summary={`This policy explains what personal information ${company.name} collects through this website, why we collect it, who we share it with, and the rights you have over it.`}
      lastUpdated={LAST_UPDATED}
    >
      <h2>Who we are</h2>
      <p>
        {company.name} (&ldquo;Neo Synergy&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) is a machinery trading and production company based in{" "}
        {company.city}. We are the controller of the personal information
        described in this policy. You can reach us at{" "}
        <a href={`mailto:${company.emails[0]}`}>{company.emails[0]}</a> or{" "}
        <a href={`tel:${company.phones[0].replace(/\s/g, "")}`}>{company.phones[0]}</a>.
      </p>

      <h2>What we collect</h2>
      <p>
        We only collect personal information that you choose to give us. We do
        not require an account to browse this site, and we do not buy contact
        data from third parties.
      </p>
      <h3>Information you submit</h3>
      <p>
        When you send a quote request or contact us through this website, we
        collect:
      </p>
      <ul>
        <li>Your name</li>
        <li>Your email address</li>
        <li>Your company name, phone number, and country, where you provide them</li>
        <li>The machines and quantities in your quote request</li>
        <li>Any message or requirements you write for us</li>
      </ul>
      <h3>Information collected automatically</h3>
      <p>
        Our hosting provider records standard server logs for every request,
        including your IP address, browser type, and the pages you visit. These
        logs are used to keep the site available and secure — for example, to
        limit how many quote requests a single address can send in an hour — and
        are not used to build a profile of you.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>
          <strong>To answer your enquiry.</strong> Preparing and sending you
          pricing, availability, lead times, and technical information for the
          machines you asked about.
        </li>
        <li>
          <strong>To fulfil a contract.</strong> Supplying, installing,
          commissioning, or maintaining equipment you order from us.
        </li>
        <li>
          <strong>To protect the site.</strong> Detecting and blocking automated
          abuse of our forms.
        </li>
      </ul>
      <p>
        We do not use your details for marketing unless you have asked us to,
        and we never sell personal information.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share personal information only with service providers who help us
        run this website and respond to you, and only to the extent they need it:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> — website hosting and server logs.
        </li>
        <li>
          <strong>Supabase</strong> — the database that stores our product
          catalogue. Quote requests are not written to it.
        </li>
        <li>
          <strong>Resend</strong> — delivers quote request emails to our sales
          team and the confirmation email to you.
        </li>
      </ul>
      <p>
        These providers process data outside the United Arab Emirates. We rely
        on their standard contractual protections for such transfers. We may
        also disclose information where we are required to by law.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Quote requests and enquiries are held in our sales inbox for as long as
        we need them to serve you and to meet our commercial, tax, and legal
        record-keeping obligations, and no longer. Server logs are retained on a
        short rolling basis by our hosting provider.
      </p>

      <h2>Cookies</h2>
      <p>
        This site does not use advertising, profiling, or analytics cookies, and
        there is no consent banner because there is nothing to consent to. Your
        browser stores your quote request list on your own device so it survives
        a page refresh; that information stays in your browser and is only sent
        to us when you submit the request.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the UAE Personal Data Protection Law, and comparable laws that may
        apply to you, you can ask us to give you a copy of the personal
        information we hold about you, correct it if it is wrong, delete it,
        restrict or object to how we use it, or withdraw consent you previously
        gave.
      </p>
      <p>
        Email{" "}
        <a href={`mailto:${company.emails[0]}`}>{company.emails[0]}</a> and we
        will respond as quickly as we can. If you are not satisfied with our
        response, you may complain to the UAE Data Office.
      </p>

      <h2>Security</h2>
      <p>
        This site is served over HTTPS, administrative access to our catalogue
        is restricted to named accounts, and our service providers hold industry
        standard security certifications. No method of transmission over the
        internet is completely secure, so please do not send us sensitive
        information such as payment card or identity document details through
        the forms on this site.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as our services change. The date at the top of
        this page shows when it was last revised.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or about how we handle your information can
        be sent to{" "}
        <a href={`mailto:${company.emails[0]}`}>{company.emails[0]}</a>, or see
        our <Link href="/contact">contact page</Link> for full details.
      </p>
    </LegalPage>
  );
}
