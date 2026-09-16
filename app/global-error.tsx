"use client";

// Last-resort boundary: catches failures in the root layout itself, where the
// header, footer, and even globals.css may not have rendered. It replaces the
// whole document, so it ships its own <html>/<body> and uses inline styles
// rather than Tailwind classes that may never have loaded.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#1B1E24",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#14B8E0",
            }}
          >
            Neo Synergy
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "1.875rem", lineHeight: 1.2 }}>
            The site is temporarily unavailable.
          </h1>
          <p style={{ margin: "1.25rem 0 0", lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
            We&rsquo;re having trouble loading the site right now. Please try again
            in a moment, or reach us on{" "}
            <a href="tel:+97142510789" style={{ color: "#14B8E0" }}>
              +971 4 251 0789
            </a>
            .
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#1B1E24",
              background: "#14B8E0",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
