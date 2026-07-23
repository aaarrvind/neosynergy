"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Pause, Play } from "lucide-react";
import { Container } from "./Container";

export interface HeroSlide {
  key: string;
  image: string;
  kicker: string;
  headlineTop: string;
  headlineAccent: string;
  subcopy: string;
}

interface Capability {
  value: string;
  label: string;
}

export function HeroCarousel({
  slides,
  capabilities,
}: {
  slides: HeroSlide[];
  capabilities: Capability[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (i: number) => setActive(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  // Advance when the active slide's progress bar finishes its fill. This keeps
  // the visible timer and the actual advance perfectly in sync, and pausing the
  // bar's animation pauses the advance too.
  const onProgressEnd = useCallback(() => {
    if (reduced) return; // no auto-advance for reduced motion
    setActive((p) => (p + 1) % slides.length);
  }, [reduced, slides.length]);

  return (
    <section
      className="relative isolate overflow-hidden bg-graphite text-white"
      aria-roledescription="carousel"
      aria-label="Neo Synergy capabilities"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Full-bleed background layers (crossfade) */}
      <div className="absolute inset-0 -z-10">
        {slides.map((s, i) => (
          <div
            key={s.key}
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="hero-drift object-cover object-[70%_center]"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/90 to-graphite/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-graphite/50" />
        <div className="hero-grid absolute inset-0" />
      </div>

      {/* Corner registration marks */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-5 top-5 h-6 w-6 border-l border-t border-cyan/40 sm:left-8 sm:top-8" />
        <span className="absolute bottom-5 right-5 h-6 w-6 border-b border-r border-cyan/40 sm:bottom-8 sm:right-8" />
      </div>

      <Container className="relative flex min-h-[36rem] flex-col justify-center py-20 lg:min-h-[42rem] lg:py-28">
        {/* Rotating text — layers share one grid cell so the block sizes to the
            tallest slide and never shifts the content below it */}
        <div className="grid max-w-2xl">
          {slides.map((s, i) => {
            const isActive = i === active;
            const HeadTag = (i === 0 ? "h1" : "p") as keyof JSX.IntrinsicElements;
            return (
              <div
                key={s.key}
                role="group"
                aria-roledescription="slide"
                aria-label={s.kicker}
                aria-hidden={!isActive}
                style={{ gridArea: "1 / 1" }}
                className={`transition-opacity ease-out ${
                  isActive
                    ? "opacity-100 duration-500"
                    : "pointer-events-none opacity-0 duration-200"
                }`}
              >
                <p className="flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-cyan">
                  <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-cyan shadow-[0_0_8px_rgba(20,184,224,0.85)]" />
                  {s.kicker}
                </p>
                <HeadTag className="mt-5 font-display text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-6xl">
                  {s.headlineTop}
                  <br />
                  <span className="text-cyan">{s.headlineAccent}</span>
                </HeadTag>
                <div className="mt-6 h-px w-24 bg-gradient-to-r from-cyan to-transparent" />
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {s.subcopy}
                </p>
              </div>
            );
          })}
        </div>

        {/* Fixed CTAs */}
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-graphite transition-colors hover:bg-white"
          >
            Browse the catalog
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-cyan hover:text-cyan"
          >
            <FileText size={16} /> Request a quote
          </Link>
        </div>

        {/* Progress indicators + play/pause */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex max-w-xs flex-1 items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}: ${s.kicker}`}
                aria-current={i === active}
                className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
              >
                <span
                  onAnimationEnd={i === active ? onProgressEnd : undefined}
                  style={i === active ? { animationPlayState: paused ? "paused" : "running" } : undefined}
                  className={`absolute inset-y-0 left-0 w-full origin-left rounded-full bg-cyan ${
                    i === active
                      ? "hero-prog"
                      : i < active
                        ? "scale-x-100"
                        : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-cyan hover:text-cyan"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>

        {/* Fixed capability strip */}
        <div className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm sm:grid-cols-4">
          {capabilities.map((c) => (
            <div key={c.value} className="bg-graphite/50 px-5 py-4">
              <p className="font-display text-lg font-semibold text-white">{c.value}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/55">{c.label}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Coordinate readout (precision motif) */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-8 hidden font-mono text-[0.65rem] tracking-wider text-white/25 lg:block"
      >
        N 25.20° · E 55.27°
      </span>
    </section>
  );
}
