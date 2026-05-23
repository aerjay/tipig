import { D2 } from "../theme";
import { ALBUMS } from "../data/albums";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TravelCard } from "../components/TravelCard";
import { useViewportSize } from "../hooks/useViewportSize";
import { useGalleryNav } from "../lib/nav";

// Travels (home): a uniform grid of album cards. No hero, no intro, no
// section labels — the grid is the page (SPEC §6). Column gap === row gap so
// the negative space reads as one museum-wall rhythm.
export default function Home({ tweaks = DEFAULT_TWEAKS }) {
  const size = useViewportSize();
  const nav = useGalleryNav();
  const compact = size === "mobile";
  const mid = size === "tablet";
  const padX = compact ? 22 : mid ? 36 : 56;
  const padTop = compact ? 28 : mid ? 44 : 64;
  const cols = compact ? 1 : mid ? 2 : 3;
  const baseGap = compact ? 26 : mid ? 38 : 64;
  const gap = baseGap * (tweaks.density === "tight" ? 0.55 : 1);

  return (
    <div style={{ background: D2.bg, color: D2.ink, fontFamily: D2.sans, minHeight: "100%" }}>
      <Header view="home" />
      <section style={{ padding: `${padTop}px ${padX}px 0` }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            columnGap: gap,
            rowGap: gap,
          }}
        >
          {ALBUMS.map((alb) => (
            <TravelCard
              key={alb.id}
              album={alb}
              size={size}
              tweaks={tweaks}
              onOpen={() => nav.openAlbum(alb.id)}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export const DEFAULT_TWEAKS = { aspect: "natural", density: "airy" };
