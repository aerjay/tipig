import { ALBUMS } from "../data/albums";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TravelCard } from "../components/TravelCard";
import { useViewportSize } from "../hooks/useViewportSize";
import { useGalleryNav } from "../lib/nav";
import { bySize, pageX } from "../lib/responsive";

// Travels (home): a uniform grid of album cards. No hero, no intro, no
// section labels — the grid is the page (SPEC §6). Column gap === row gap so
// the negative space reads as one museum-wall rhythm.
export default function Home() {
  const size = useViewportSize();
  const nav = useGalleryNav();
  const cols = bySize(size, 1, 2, 3);
  const gap = bySize(size, 26, 38, 64);

  return (
    <>
      <Header view="home" />
      <section style={{ padding: `${bySize(size, 28, 44, 64)}px ${pageX(size)}px 0` }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            columnGap: gap,
            rowGap: gap,
          }}
        >
          {ALBUMS.map((album) => (
            <TravelCard
              key={album.id}
              album={album}
              size={size}
              onOpen={() => nav.openAlbum(album.id)}
            />
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
