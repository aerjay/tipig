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
function preloadLcpCover(): Plugin {
  const cover = ALBUMS[0]?.cover;
  const type = cover?.endsWith(".avif")
    ? "image/avif"
    : cover?.endsWith(".png")
      ? "image/png"
      : "image/jpeg";
  return {
    name: "preload-lcp-cover",
    transformIndexHtml: () =>
      cover
        ? [
            {
              tag: "link",
              attrs: { rel: "preload", as: "image", href: cover, type, fetchpriority: "high" },
              injectTo: "head",
            },
          ]
        : [],
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