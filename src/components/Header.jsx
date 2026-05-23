import { D2 } from "../theme";
import { useViewportSize } from "../hooks/useViewportSize";
import { useGalleryNav } from "../lib/nav";

// Single header row: wordmark left, two-item nav right. No mobile menu —
// there are only two items and they always fit (SPEC §4).
export function Header({ view }) {
  const size = useViewportSize();
  const compact = size === "mobile";
  const mid = size === "tablet";
  const nav = useGalleryNav();

  const goHome = () => {
    if (view !== "home") nav.goHome();
  };
  const goTravels = () => {
    if (view !== "home") nav.goHome();
  };
  const goAbout = () => {
    if (view !== "about") nav.goAbout();
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: compact ? "22px 22px" : mid ? "30px 36px" : "40px 56px",
        gap: 18,
      }}
    >
      <div
        onClick={goHome}
        style={{
          font: `400 ${compact ? "20px" : mid ? "24px" : "26px"}/1 ${D2.serif}`,
          letterSpacing: "0.24em",
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
          onClick={goTravels}
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
