import { D2 } from "../theme";
import { useViewportSize } from "../hooks/useViewportSize";

// Single baseline-aligned row: "Tipig" left, "MMXXVI" right. No hairline
// rule above (SPEC §5).
export function Footer() {
  const size = useViewportSize();
  const compact = size === "mobile";
  return (
    <footer
      style={{
        marginTop: compact ? 60 : 100,
        padding: compact ? "26px 22px" : "40px 56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        font: `400 11px/1.4 ${D2.mono}`,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: D2.inkSoft,
      }}
    >
      <span>Tipig</span>
      <span>MMXXVI</span>
    </footer>
  );
}
