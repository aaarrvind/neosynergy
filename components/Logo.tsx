import Image from "next/image";

// The wordmark is derived from the mark rather than picked by eye:
//   · SYNERGY's cap height is 50% of the logo mark's height
//   · with 25% of the mark's height as clear space above and below it
// so the wordmark block measures exactly the same height as the mark.
//
// Font size is not cap height. The display face renders a cap height of
// 0.741em (measured in the browser, not assumed), so the size needed to hit a
// given cap height is cap / 0.741. If the display font ever changes, re-measure
// this — a different face will need a different number.
const CAP_RATIO = 0.7406;

// A full-height line box centres the font's ascent+descent, not its capitals.
// SYNERGY is all caps and so uses none of the descender, which leaves the word
// riding high — measured 23.5% above vs 26.6% below. Nudging it down by this
// fraction of the font size puts the capitals themselves on the centre line.
// Derived from the same measurement: (descent - (ascent - cap)) / 2.
const CAP_CENTRE_SHIFT = 0.023;

/** Rendered height of the logo mark, in px, per placement. */
const MARK_HEIGHT = { header: 32, footer: 36 } as const;

export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  const markH = MARK_HEIGHT[variant];
  const fontSize = (markH * 0.5) / CAP_RATIO;

  return (
    <span className="flex items-center gap-2">
      <Image
        src="/images/logo-icon.png"
        alt=""
        width={243}
        height={86}
        style={{ height: markH, width: "auto" }}
        priority={variant === "header"}
      />
      <span className="flex flex-col">
        {/* The header is light and the footer is dark, so the wordmark
            follows the variant rather than assuming a dark background */}
        <span
          className={`font-display font-bold tracking-wide ${
            variant === "header" ? "text-graphite" : "text-white"
          }`}
          style={{
            fontSize,
            // A line box the full height of the mark, plus the cap-centring
            // nudge above, is what puts 25% clear space above and below.
            lineHeight: `${markH}px`,
            transform: `translateY(${fontSize * CAP_CENTRE_SHIFT}px)`,
          }}
        >
          SYNERGY
        </span>
        {variant === "footer" && (
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-white/40">
            Machinery Trading L.L.C.
          </span>
        )}
      </span>
    </span>
  );
}
