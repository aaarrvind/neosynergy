import Image from "next/image";

export function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/images/logo-icon.png"
        alt=""
        width={243}
        height={86}
        className={variant === "header" ? "h-8 w-auto" : "h-9 w-auto"}
        priority={variant === "header"}
      />
      <span className="flex flex-col leading-tight">
        {/* The header is light and the footer is dark, so the wordmark
            follows the variant rather than assuming a dark background */}
        <span
          className={`font-display text-lg font-bold tracking-wide ${
            variant === "header" ? "text-graphite" : "text-white"
          }`}
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
