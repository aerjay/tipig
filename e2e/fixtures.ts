import { test as base, expect, type Page } from "@playwright/test";

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
