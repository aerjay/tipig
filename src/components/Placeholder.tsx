import { useEffect, useRef, useState, type CSSProperties } from "react";
import { srcsetUrl } from "../lib/srcset";

interface PlaceholderProps {
  // The in-page <img>. For covers this is the AVIF, so mobile (and the eager
  // LCP fetch) only ever pulls the light format; for album photos it's the only
  // format. Required to render anything.
  src?: string;
  // Optional JPG variant, served to non-mobile (>= 768px) via a <picture>
  // <source>. The JPG never matches on mobile, so mobile can't fetch it; it also
  // doubles as the OG share image (set separately, from Album.cover). No-op when
  // absent — a plain <img src> is rendered.
  jpgSrc?: string;
  ratio?: number;
  aspect?: string;
  alt?: string;
  // The LCP image of a view (home's first cover, an album's first photo). It
  // renders eagerly at high fetch priority and skips the scroll-in gate, so the
  // browser starts fetching it from the initial paint rather than after React
  // hydrates and the IntersectionObserver fires.
  priority?: boolean;
}

// Renders a real <img> at a given aspect ratio and fades it up the first time
// it scrolls into view (IntersectionObserver, rootMargin 120px). SPEC §10.
//
// Accepts EITHER a numeric `ratio` (w/h) OR a CSS `aspect` string ("4/5").
// The fade transform lives on this WRAPPER; the hover lift (see index.css)
// lives on the inner <img>, so the two transforms never fight.
//
// `prefers-reduced-motion` is honoured purely in CSS (.ph override), which
// pins opacity/transform and removes the transition.
export function Placeholder({ src, jpgSrc, ratio, aspect, alt = "", priority = false }: PlaceholderProps) {
  let ar: string;
  if (typeof ratio === "number" && isFinite(ratio) && ratio > 0) {
    ar = `${ratio}`;
  } else if (aspect) {
    ar = aspect.replace("/", " / ");
  } else {
    ar = "3 / 4";
  }

  const wrapRef = useRef<HTMLDivElement>(null);
  // Priority images start visible (no fade-in wait) and never observe.
  const [visible, setVisible] = useState(priority);

  useEffect(() => {
    if (priority || visible) return;
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [priority, visible]);

  const fadeStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : "translateY(8px)",
    transition:
      "opacity 700ms cubic-bezier(.2,.7,.2,1), transform 700ms cubic-bezier(.2,.7,.2,1)",
  };

  return (
    <div
      ref={wrapRef}
      className="ph"
      style={{
        aspectRatio: ar,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#1a1814",
        ...fadeStyle,
      }}
    >
      {src && (
        <picture>
          {/* Non-mobile (>= 768px) gets the JPG source; mobile falls through to
              the AVIF <img>, which also carries loading/fetchPriority for the LCP
              fetch. Keeping AVIF as the <img> means the preload scanner can't
              double-fetch a heavier JPG fallback on mobile. srcsetUrl encodes
              spaces/commas so a path like ".../united states/..." isn't mangled
              by srcset's delimiter rules (which would drop the JPG source). */}
          {jpgSrc && (
            <source srcSet={srcsetUrl(jpgSrc)} media="(min-width: 768px)" type="image/jpeg" />
          )}
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </picture>
      )}
    </div>
  );
}
