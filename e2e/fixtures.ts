import { test as base, expect, type Page } from "@playwright/test";
import { ALBUMS } from "../src/data/albums";
import type { Album } from "../src/types";

// Re-export the generated album data so specs assert against the real lineup
// instead of hardcoding counts/ids/titles. `albums.ts` is type-only at the
// import level, so this pulls in no app runtime (no React, no router).
export { ALBUMS };

// The album list's wrap-around neighbours — mirrors albumWithNeighbours() in
// src/lib/nav.ts, which is what the arrow keys actually navigate by. Kept as a
// tiny copy here so the e2e bundle stays free of the app's router imports.
export function neighbours(id: string): { prev: Album; next: Album } {
  const idx = Math.max(0, ALBUMS.findIndex((a) => a.id === id));
  const len = ALBUMS.length;
  return { prev: ALBUMS[(idx - 1 + len) % len], next: ALBUMS[(idx + 1) % len] };
}

// A `page` that fails the test if the app throws or logs an error during the
// run. Every test gets this guard for free, so console health is covered across
// all flows without repeating listener boilerplate.
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
    });

    await use(page);

    expect(errors, "the app logged no errors during this test").toEqual([]);
  },
});

export { expect };

// Wait until the slide transition has fully settled on a specific album — i.e.
// exactly one album view is mounted and it shows `title`. Settling on identity
// (not layer count) matters: a URL change lands a tick before React renders the
// transition, so right after navigating there is a brief window where the URL
// is already the destination but the *source* album is still the only thing
// mounted and listening for keys. Waiting for the destination's <h1> to be the
// sole heading closes that window before the next interaction.
export async function showsAlbum(page: Page, title: string): Promise<void> {
  await page.waitForFunction(
    (t) => {
      const headings = document.querySelectorAll("h1");
      return headings.length === 1 && headings[0].textContent?.trim() === t;
    },
    title
  );
}
