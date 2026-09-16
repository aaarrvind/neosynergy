"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "./Container";

export interface HeroSlide {
  key: string;
  image: string;
  kicker: string;
  headlineTop: string;
  headlineAccent: string;
  subcopy: string;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
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
  const next = useCallback(() => setActive((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(
    () => setActive((p) => (p - 1 + slides.length) % slides.length),
    [slides.length]
  );

  // Auto-advance, paused on hover/focus and disabled for reduced motion
  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setActive((p) => (p + 1) % slides.length), 7000);
    return () => clearTimeout(t);
  }, [active, paused, reduced, slides.length]);

  return (
    <section
      className="relative isolate overflow-hidden bg-graphite text-white"
      aria-roledescription="carousel"
      aria-label="Neo Synergy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Full-bleed background photography (crossfade) */}
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
              className="object-cover object-[70%_center]"
            />
          </div>
        ))}
        {/* Legibility scrim. Deliberately narrower than a full-width wash: it
            is opaque only across the left column where the copy sits and is
            gone by ~70%, so the machine stays visible on the right. The second
            layer lifts the bottom edge so the slide dots and CTAs hold
            contrast against a bright floor or workpiece. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-graphite/95 via-graphite/70 via-40% to-transparent to-70%"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-graphite/60 to-transparent"
        />
      </div>

      <Container className="relative flex min-h-[34rem] flex-col justify-center py-20 lg:min-h-[40rem] lg:py-28">
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
                className={`transition-[opacity,transform] [transition-timing-function:var(--ease-out-strong)] ${
                  isActive
                    ? "translate-y-0 opacity-100 duration-500"
                    : "pointer-events-none translate-y-2 opacity-0 duration-200"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                  {s.kicker}
                </p>
                <HeadTag className="mt-4 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.25rem]">
                  {s.headlineTop} {s.headlineAccent}
                </HeadTag>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {s.subcopy}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="pressable inline-flex items-center rounded bg-cyan px-6 py-3 text-sm font-semibold text-graphite hover:bg-cyan-deep hover:text-white"
          >
            Browse machines
          </Link>
          <Link
            href="/quote"
            className="pressable inline-flex items-center rounded border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-graphite"
          >
            Request a quote
          </Link>
        </div>

        {/* Slide dots */}
        <div className="mt-12 flex items-center gap-2.5" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${s.kicker}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 [transition-timing-function:var(--ease-out-strong)] ${
                i === active ? "w-8 bg-cyan" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </Container>

      {/* Prev / next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="pressable absolute left-3 top-1/2 -mt-[22px] hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-graphite/30 text-white hover:bg-graphite/70 md:flex lg:left-6"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="pressable absolute right-3 top-1/2 -mt-[22px] hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-graphite/30 text-white hover:bg-graphite/70 md:flex lg:right-6"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  );
}
