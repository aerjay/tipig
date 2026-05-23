import { useEffect, useRef, useState } from "react";

// Renders a real <img> at a given aspect ratio and fades it up the first time
// it scrolls into view (IntersectionObserver, rootMargin 120px). SPEC §10.
//
// Accepts EITHER a numeric `ratio` (w/h) OR a CSS `aspect` string ("4/5").
// The fade transform lives on this WRAPPER; the hover lift (see index.css)
// lives on the inner <img>, so the two transforms never fight.
//
// `prefers-reduced-motion` is honoured purely in CSS (.ph override), which
// pins opacity/transform and removes the transition.
export function Placeholder({ src, ratio, aspect, alt = "", lazyFade = true }) {
  let ar;
  if (typeof ratio === "number" && isFinite(ratio) && ratio > 0) {
    ar = `${ratio}`;
  } else if (aspect) {
    ar = aspect.replace("/", " / ");
  } else {
    ar = "3 / 4";
  }

  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(!lazyFade);

  useEffect(() => {
    if (visible) return;
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
  }, [visible]);

  const fadeStyle = {
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
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
