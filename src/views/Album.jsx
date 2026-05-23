import { useEffect } from "react";
import { D2 } from "../theme";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AlbumTitle } from "../components/AlbumTitle";
import { AlbumColumn } from "../components/AlbumColumn";
import { PrevNext } from "../components/PrevNext";
import { useViewportSize } from "../hooks/useViewportSize";
import { useGalleryNav, albumWithNeighbours } from "../lib/nav";
import { DEFAULT_TWEAKS } from "./Home";

// Album view: title block, justified-strips gallery, prev/next row (SPEC §7).
// Keyboard nav: ← previous album, → next album, Esc back to home (SPEC §10).
//
// `active` is false while this album is the *outgoing* layer of a page
// transition (both views are mounted during the 600ms slide). Only the active
// album binds the keyboard listener, so a keypress mid-transition can't be
// handled by two albums at once.
export default function Album({ albumId, active = true, tweaks = DEFAULT_TWEAKS }) {
  const size = useViewportSize();
  const nav = useGalleryNav();
  const { album, prev, next } = albumWithNeighbours(albumId);

  useEffect(() => {
    if (!active) return;
    function handler(e) {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        nav.goHome();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nav.prevAlbum(prev.id);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nav.nextAlbum(next.id);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, album.id, prev.id, next.id]);

  return (
    <div style={{ background: D2.bg, color: D2.ink, fontFamily: D2.sans, minHeight: "100%" }}>
      <Header view="album" />
      <AlbumTitle album={album} size={size} />
      <AlbumColumn album={album} size={size} tweaks={tweaks} />
      <PrevNext
        prev={prev}
        next={next}
        size={size}
        onPrev={() => nav.prevAlbum(prev.id)}
        onNext={() => nav.nextAlbum(next.id)}
      />
      <Footer />
    </div>
  );
}
