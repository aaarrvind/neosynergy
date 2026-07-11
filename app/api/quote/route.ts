import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { company } from "@/lib/data/company";
import { CartItem } from "@/lib/types";

interface ContactDetails {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
}

interface QuoteRequestBody {
  contact: ContactDetails;
  items: CartItem[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildItemsTable(items: CartItem[]): string {
  if (items.length === 0) {
    return "<p>No catalog items were attached to this enquiry.</p>";
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #DADDE3;">${escapeHtml(item.name)}${
            item.variant ? `<br/><span style="color:#8A8F99;font-size:12px;">${escapeHtml(item.variant)}</span>` : ""
          }</td>
          <td style="padding:8px;border:1px solid #DADDE3;">${escapeHtml(item.categoryName)}</td>
          <td style="padding:8px;border:1px solid #DADDE3;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #DADDE3;">${item.notes ? escapeHtml(item.notes) : "&mdash;"}</td>
        </tr>`
    )
    .join("");

  return `
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <thead>
        <tr style="background:#1B1E24;color:#ffffff;">
          <th style="padding:8px;text-align:left;border:1px solid #1B1E24;">Item</th>
          <th style="padding:8px;text-align:left;border:1px solid #1B1E24;">Category</th>
          <th style="padding:8px;text-align:center;border:1px solid #1B1E24;">Qty</th>
          <th style="padding:8px;text-align:left;border:1px solid #1B1E24;">Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildSalesEmailHtml(contact: ContactDetails, items: CartItem[]): string {
  const isQuote = items.length > 0;
  return `
    <div style="font-family:sans-serif;color:#20242B;">
      <h2 style="font-family:sans-serif;">${isQuote ? "New quote request" : "New website enquiry"}</h2>
      <table style="font-size:14px;margin-bottom:16px;">
        <tr><td style="padding:4px 12px 4px 0;color:#8A8F99;">Name</td><td>${escapeHtml(contact.name)}</td></tr>
        ${contact.company ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8F99;">Company</td><td>${escapeHtml(contact.company)}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0;color:#8A8F99;">Email</td><td>${escapeHtml(contact.email)}</td></tr>
        ${contact.phone ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8F99;">Phone</td><td>${escapeHtml(contact.phone)}</td></tr>` : ""}
        ${contact.country ? `<tr><td style="padding:4px 12px 4px 0;color:#8A8F99;">Country</td><td>${escapeHtml(contact.country)}</td></tr>` : ""}
      </table>
      ${contact.message ? `<p><strong>Message:</strong><br/>${escapeHtml(contact.message).replace(/\n/g, "<br/>")}</p>` : ""}
      ${isQuote ? `<h3 style="font-family:sans-serif;">Requested items</h3>${buildItemsTable(items)}` : ""}
    </div>`;
}

function buildCustomerEmailHtml(contact: ContactDetails, items: CartItem[]): string {
  const isQuote = items.length > 0;
  return `
    <div style="font-family:sans-serif;color:#20242B;">
      <h2 style="font-family:sans-serif;">Thanks, ${escapeHtml(contact.name.split(" ")[0] || contact.name)}!</h2>
      <p>
        We've received your ${isQuote ? "quote request" : "message"} and a
        member of the Neo Synergy team will get back to you shortly with
        ${isQuote ? "pricing, availability, and lead times" : "a response"}.
      </p>
      ${isQuote ? `<h3 style="font-family:sans-serif;">Your requested items</h3>${buildItemsTable(items)}` : ""}
      ${contact.message ? `<p><strong>Your message:</strong><br/>${escapeHtml(contact.message).replace(/\n/g, "<br/>")}</p>` : ""}
      <p style="margin-top:24px;color:#8A8F99;font-size:12px;">
        ${company.name} &middot; ${company.city}<br/>
        ${company.phones.join(" / ")} &middot; ${company.emails.join(" / ")}
      </p>
    </div>`;
}

export async function POST(request: NextRequest) {
  let body: QuoteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { contact, items } = body || {};

  if (!contact?.name || !contact?.email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(contact.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const safeItems = Array.isArray(items) ? items : [];
  const apiKey = process.env.RESEND_API_KEY;
  const salesEmails = (process.env.SALES_EMAILS || company.emails.join(","))
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const fromAddress =
    process.env.QUOTE_FROM_EMAIL || "Neo Synergy Website <onboarding@resend.dev>";

  // If no API key is configured, log the submission so the flow can still
  // be tested end-to-end during development.
  if (!apiKey) {
    console.log("[quote] RESEND_API_KEY not set — logging submission instead of sending email.");
    console.log(JSON.stringify({ contact, items: safeItems }, null, 2));
    return NextResponse.json({ ok: true, mode: "logged" });
  }

  const resend = new Resend(apiKey);
  const subject =
    safeItems.length > 0
      ? `New quote request from ${contact.name}${contact.company ? ` (${contact.company})` : ""}`
      : `New website enquiry from ${contact.name}`;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: salesEmails,
      replyTo: contact.email,
      subject,
      html: buildSalesEmailHtml(contact, safeItems),
    });

    await resend.emails.send({
      from: fromAddress,
      to: contact.email,
      subject:
        safeItems.length > 0
          ? "We've received your quote request — Neo Synergy"
          : "We've received your message — Neo Synergy",
      html: buildCustomerEmailHtml(contact, safeItems),
    });
  } catch (error) {
    console.error("[quote] Failed to send email:", error);
    return NextResponse.json(
      { error: "We couldn't send your request right now. Please try again or email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
