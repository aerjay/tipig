import { test, expect, showsAlbum, ALBUMS, neighbours } from "./fixtures";

test.describe("Tipig gallery", () => {
  test("opens an album from the Travels grid", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("article");
    await expect(cards).toHaveCount(ALBUMS.length);

    await cards.first().click();

    // The grid renders albums in ALBUMS order, so the first card is ALBUMS[0].
    await expect(page).toHaveURL(new RegExp(`/travels/${ALBUMS[0].id}$`));
    await expect(page.locator("h1")).toHaveText(ALBUMS[0].title);
  });

  test("packs a multi-photo album into rows that fill the width", async ({ page }) => {
    // The justified layout depends on a real layout engine (jsdom can't do it),
    // so this is the one assertion that only an end-to-end test can make. Pick
    // the album with the most photos: whatever the lineup, it's the surest bet
    // to fill at least one full row.
    const richest = [...ALBUMS].sort((a, b) => b.photos.length - a.photos.length)[0];
    await page.goto(`/travels/${richest.id}`);
    await expect(page.locator(".ph").first()).toBeVisible();

    const { rowSpan, containerWidth } = await page.evaluate(() => {
      const firstRow = [...document.querySelectorAll("div")].find((d) => {
        const s = getComputedStyle(d);
        return s.display === "flex" && s.flexDirection === "row" && d.querySelector(".ph");
      })!;
      const gap = parseFloat(getComputedStyle(firstRow).gap) || 0;
      const widths = [...firstRow.children].map((c) => c.getBoundingClientRect().width);
      const span = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
      return { rowSpan: span, containerWidth: firstRow.parentElement!.clientWidth };
    });

    expect(Math.abs(rowSpan - containerWidth)).toBeLessThan(2);
  });

  test("flips albums with the arrow keys and returns home on Escape", async ({ page }) => {
    const start = ALBUMS[0];
    const { next } = neighbours(start.id);

    await page.goto(`/travels/${start.id}`);
    await showsAlbum(page, start.title);

    await page.keyboard.press("ArrowRight"); // start -> next
    await showsAlbum(page, next.title);

    await page.keyboard.press("ArrowLeft"); // next -> start (previous)
    await showsAlbum(page, start.title);

    await page.keyboard.press("Escape"); // back to the grid
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("article")).toHaveCount(ALBUMS.length);
  });

  test("handles a keypress during a transition only once", async ({ page }) => {
    // Regression guard: during the 600ms slide both the outgoing and incoming
    // album are mounted. Only the incoming one may respond to the keyboard —
    // otherwise a single keypress advances two steps at once.
    const start = ALBUMS[0];
    const second = neighbours(start.id).next; // where the first press lands
    const third = neighbours(second.id).next; // where the mid-slide press lands

    await page.goto(`/travels/${start.id}`);
    await expect(page.locator("h1")).toHaveText(start.title);

    await page.keyboard.press("ArrowRight"); // start -> second
    await page.waitForTimeout(120); // land the next press firmly inside the slide
    const before = await page.evaluate(() => history.length);

    await page.keyboard.press("ArrowRight"); // one press, mid-transition
    await showsAlbum(page, third.title); // second -> next, fully settled

    const navigations = (await page.evaluate(() => history.length)) - before;
    expect(navigations).toBe(1); // exactly one listener fired
  });

  test("reaches the About page from the header", async ({ page }) => {
    await page.goto("/");

    await page.locator("nav").getByText("About", { exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toHaveText("tipig");
  });

  test("serves an album directly via a deep link", async ({ page }) => {
    const album = ALBUMS.at(-1)!; // the oldest album, just to pick a non-first one
    await page.goto(`/travels/${album.id}`);
    await expect(page.locator("h1")).toHaveText(album.title);
  });
});
