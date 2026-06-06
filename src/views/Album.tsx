import { useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AlbumTitle } from "../components/AlbumTitle";
import { AlbumColumn } from "../components/AlbumColumn";
import { PrevNext } from "../components/PrevNext";
import { useViewportSize } from "../hooks/useViewportSize";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { useGalleryNav, albumWithNeighbours } from "../lib/nav";

interface AlbumProps {
  albumId: string;
  active?: boolean;
}

// Album view: title block, justified-strips gallery, prev/next row (SPEC §7).
// Keyboard nav: ← previous album, → next album, Esc back to home (SPEC §10).
//
// `active` is false while this album is the *outgoing* layer of a page
// transition (both views are mounted during the 600ms slide). Only the active
// album binds the keyboard listener, so a keypress mid-transition can't be
// handled by two albums at once.
export default function Album({ albumId, active = true }: AlbumProps) {
  const size = useViewportSize();
  const nav = useGalleryNav();
  const { album, prev, next } = albumWithNeighbours(albumId);

  // Albums are Disallowed from crawling, so this isn't for search — it makes a
  // shared album link render a correct title/preview. Gated on `active` so the
  // outgoing layer during a transition can't clobber the head.
  useDocumentHead(
    active
      ? {
          title: `${album.title} — Tipig`,
          description: `${album.title} · ${album.when} · ${album.places}.`,
          path: `/travels/${album.id}`,
          image: album.cover,
        }
      : null
  );

  useEffect(() => {
    // Keyboard nav is desktop-only; mobile/tablet have no keyboard to drive it.
    if (!active || size !== "desktop") return;
    function handler(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
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
  }, [active, size, album.id, prev.id, next.id]);

  return (
    <>
      <Header view="album" />
      <main>
        <AlbumTitle album={album} size={size} />
        <AlbumColumn album={album} size={size} />
        <PrevNext
          prev={prev}
          next={next}
          size={size}
          onPrev={() => nav.prevAlbum(prev.id)}
          onNext={() => nav.nextAlbum(next.id)}
        />
      </main>
      <Footer />
    </>
  );
}

// Don't hijack arrow/Escape keys while the user is typing into a field.
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}
