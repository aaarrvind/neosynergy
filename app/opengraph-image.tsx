import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { company } from "@/lib/data/company";

// Branded share card, generated rather than hand-designed so it always matches
// the brand tokens. Applies to every route that does not define its own
// opengraph-image, which is why layout.tsx no longer sets openGraph.images:
// an explicit value there would win over this file convention.
export const runtime = "nodejs";
export const alt = `${company.shortName} — machinery trading, Dubai UAE`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, duplicated from tailwind.config.ts — Satori resolves no CSS
// variables and no Tailwind classes, so these have to be literal.
const GRAPHITE = "#1B1E24";
const CYAN = "#14B8E0";

export default async function OpengraphImage() {
  // Satori supports woff, ttf, and otf — but not woff2.
  const [display, body, logo] = await Promise.all([
    readFile(
      join(process.cwd(), "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff")
    ),
    readFile(
      join(process.cwd(), "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff")
    ),
    readFile(join(process.cwd(), "public/images/logo-icon.png")),
  ]);

  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: GRAPHITE,
          padding: "72px 80px",
        }}
      >
        {/* Cyan rule, echoing the active-nav underline */}
        <div style={{ display: "flex", width: 96, height: 6, background: CYAN }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 400,
              fontSize: 24,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: CYAN,
            }}
          >
            Machinery Trading — Dubai, UAE
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 1.08,
              color: "#fff",
              maxWidth: 940,
            }}
          >
            {/* One expression, not text + a literal "." — Satori treats those
                as two children and rejects the div without display:flex. */}
            {`${company.tagline}.`}
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "Space Grotesk",
              fontWeight: 400,
              fontSize: 28,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 880,
            }}
          >
            Machine tools, automation, and cutting tools — supplied, installed,
            commissioned, and maintained across the UAE and GCC.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" height={44} />
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "0.04em",
              color: "#fff",
            }}
          >
            SYNERGY
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "Space Grotesk",
              fontWeight: 400,
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {company.website.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: display, weight: 700, style: "normal" },
        { name: "Space Grotesk", data: body, weight: 400, style: "normal" },
      ],
    }
  );
}
