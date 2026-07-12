"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Status = "idle" | "submitting" | "success" | "error";

export function QuoteForm() {
  const { items, removeItem, updateQuantity, updateNotes, clearCart } =
    useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const contact = {
      name: String(form.get("name") || ""),
      company: String(form.get("company") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      country: String(form.get("country") || ""),
      message: String(form.get("message") || ""),
      website: String(form.get("website") || ""), // honeypot
    };

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, items }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      clearCart();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-lg border border-steel-100 bg-white px-6 py-16 text-center">
        <CheckCircle2 size={48} className="text-cyan-deep" />
        <h2 className="mt-4 font-display text-2xl font-semibold text-graphite">
          Quote request sent
        </h2>
        <p className="mt-2 max-w-md text-graphite/60">
          Thanks — we&apos;ve received your request and a confirmation has
          been sent to your email. Our sales team will follow up with
          pricing, availability, and lead times.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-cyan-deep"
        >
          Continue browsing <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-steel-100 bg-white px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-graphite">
          Your quote request is empty
        </h2>
        <p className="mt-2 max-w-md text-graphite/60">
          Browse the catalog and add machines, controllers, or accessories
          you&apos;d like priced.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-cyan-deep"
        >
          Browse products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
      {/* Items */}
      <div className="lg:col-span-3">
        <h2 className="font-display text-lg font-semibold text-graphite">
          Items ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-steel-100 bg-white p-4 sm:flex-row"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-steel-100 bg-steel-50">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-graphite">{item.name}</p>
                    {item.variant && (
                      <p className="text-sm text-graphite/60">{item.variant}</p>
                    )}
                    <p className="text-xs text-graphite/40">{item.categoryName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-graphite/40 hover:text-spark"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded border border-steel-200 text-graphite/70 hover:border-cyan hover:text-cyan-deep"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-mono text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded border border-steel-200 text-graphite/70 hover:border-cyan hover:text-cyan-deep"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Add a note (optional) — e.g. voltage, color, configuration"
                    value={item.notes ?? ""}
                    onChange={(e) => updateNotes(item.id, e.target.value)}
                    className="min-w-[12rem] flex-1 rounded-md border border-steel-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact form */}
      <div className="lg:col-span-2">
        <h2 className="font-display text-lg font-semibold text-graphite">
          Your details
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Honeypot — hidden from humans, bots fill it */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off"
            className="hidden" aria-hidden="true" />
          <Field label="Full name" name="name" required autoComplete="name" />
          <Field label="Company" name="company" autoComplete="organization" />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field label="Phone" name="phone" required autoComplete="tel" />
          <Field label="Country" name="country" autoComplete="country-name" />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-graphite">
              Additional details
            </span>
            <textarea
              name="message"
              rows={4}
              placeholder="Project details, site location, timeline, etc."
              className="rounded-md border border-steel-200 px-3 py-2 text-sm"
            />
          </label>

          {status === "error" && (
            <p className="text-sm text-spark-deep">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan px-5 py-3 text-sm font-medium text-graphite transition-colors hover:bg-graphite hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending..." : "Send quote request"}
          </button>
          <p className="text-xs text-graphite/40">
            We&apos;ll email you a copy of this request and follow up with
            pricing and availability.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-graphite">
        {label} {required && <span className="text-spark-deep">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="rounded-md border border-steel-200 px-3 py-2 text-sm"
      />
    </label>
  );
}
