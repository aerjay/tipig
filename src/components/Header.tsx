import { D2 } from "../theme";
import { useViewportSize } from "../hooks/useViewportSize";
import { useGalleryNav } from "../lib/nav";
import { bySize, pageX } from "../lib/responsive";
import type { View } from "../types";

interface HeaderProps {
  view: View;
}

// Single header row: wordmark left, two-item nav right. No mobile menu —
// there are only two items and they always fit (SPEC §4).
export function Header({ view }: HeaderProps) {
  const size = useViewportSize();
  const compact = size === "mobile";
  const nav = useGalleryNav();

  // The wordmark and the "Travels" link both go home.
  const goHome = () => view !== "home" && nav.goHome();
  const goAbout = () => view !== "about" && nav.goAbout();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${bySize(size, 22, 30, 40)}px ${pageX(size)}px`,
        gap: 18,
      }}
    >
      <div
        onClick={goHome}
        style={{
          font: `700 ${bySize(size, "20px", "24px", "26px")}/1 ${D2.serif}`,
          letterSpacing: "-0.06em",
          textTransform: "uppercase",
          color: D2.ink,
          cursor: "pointer",
        }}
      >
        TIPIG
      </div>
      <nav
        style={{
          display: "flex",
          gap: compact ? 16 : 28,
          font: `400 ${compact ? "11px" : "12px"}/1 ${D2.sans}`,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: D2.inkSoft,
        }}
      >
        <span
          onClick={goHome}
          style={{ cursor: "pointer", color: view === "home" ? D2.ink : D2.inkSoft }}
        >
          Travels
        </span>
        <span
          onClick={goAbout}
          style={{ cursor: "pointer", color: view === "about" ? D2.ink : D2.inkSoft }}
        >
          About
        </span>
      </nav>
    </header>
  );
}
