import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";
import { ALBUMS } from "./src/data/albums";

// Preload the home view's LCP image — the newest album's cover (ALBUMS[0]) — so
// the browser fetches it straight from the initial HTML instead of waiting for
// React to hydrate and the IntersectionObserver to fire (see Placeholder's
// `priority`). Album deep-links share this static HTML and pay a small unused
// preload, but "/" is the primary route and the only one search/PSI hit.
//
// The cover is served responsively (Placeholder's <picture>): AVIF to mobile,
// JPG to non-mobile. So the preload is media-scoped to match — each viewport
// preloads only the one format it actually paints, with no double fetch. The
// media boundary here must stay in sync with the <source> in Placeholder.
const PRELOAD_BREAKPOINT = 768;
function preloadLcpCover(): Plugin {
  const jpg = ALBUMS[0]?.cover;
  const avif = ALBUMS[0]?.coverAvif;
  const typeOf = (href: string): string =>
    href.endsWith(".avif") ? "image/avif" : href.endsWith(".png") ? "image/png" : "image/jpeg";
  const preload = (href: string, media?: string) => ({
    tag: "link",
    attrs: {
      rel: "preload",
      as: "image",
      href,
      type: typeOf(href),
      fetchpriority: "high",
      ...(media ? { media } : {}),
    },
    injectTo: "head" as const,
  });
  return {
    name: "preload-lcp-cover",
    transformIndexHtml: () => {
      if (!jpg) return [];
      // With both formats, preload each behind the matching media query; with
      // only one, preload it unconditionally.
      return avif
        ? [
            preload(avif, `(max-width: ${PRELOAD_BREAKPOINT - 1}px)`),
            preload(jpg, `(min-width: ${PRELOAD_BREAKPOINT}px)`),
          ]
        : [preload(jpg)];
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare(), preloadLcpCover()],
  // Vitest runs the co-located unit tests under src/ and scripts/. The
  // Playwright end-to-end specs live in e2e/ and are run separately
  // (npm run test:e2e).
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});