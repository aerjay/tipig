// Shared domain types for the gallery.

// A single photo: its URL and aspect ratio (native width ÷ height, as the
// browser displays it). See scripts/measure for how `ratio` is derived.
export interface Photo {
  src: string;
  ratio: number;
}

// One travel album. Produced by scripts/build-albums (the auto-generated
// src/data/albums.ts) and consumed throughout the UI.
export interface Album {
  id: string;
  title: string;
  when: string;
  places: string;
  // The home-grid cover. `cover` is a JPG (served to non-mobile and used as the
  // OG share image, which link-preview scrapers render more reliably than AVIF);
  // `coverAvif`, when present, is the AVIF the grid serves to mobile via
  // <picture>. Absent when the album has no JPG/AVIF pair for its cover.
  cover: string;
  coverAvif?: string;
  photos: Photo[];
}

// The three viewport size keys (SPEC §3).
export type Size = "mobile" | "tablet" | "desktop";

// The top-level views a route can map to (SPEC §10).
export type View = "home" | "album" | "about";
