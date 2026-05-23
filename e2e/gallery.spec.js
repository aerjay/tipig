import { test, expect, showsAlbum } from "./fixtures";

test.describe("Tipig gallery", () => {
  test("opens an album from the Travels grid", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("article");
    await expect(cards).toHaveCount(5);

    await cards.first().click();

    await expect(page).toHaveURL(/\/travels\/[\w-]+$/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("packs a multi-photo album into rows that fill the width", async ({ page }) => {
    // The justified layout depends on a real layout engine (jsdom can't do it),
    // so this is the one assertion that only an end-to-end test can make.
    await page.goto("/travels/scotland-2021");
    await expect(page.locator(".ph").first()).toBeVisible();

    const { rowSpan, containerWidth } = await page.evaluate(() => {
      const firstRow = [...document.querySelectorAll("div")].find((d) => {
        const s = getComputedStyle(d);
        return s.display === "flex" && s.flexDirection === "row" && d.querySelector(".ph");
      });
      const gap = parseFloat(getComputedStyle(firstRow).gap) || 0;
      const widths = [...firstRow.children].map((c) => c.getBoundingClientRect().width);
      const span = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
      return { rowSpan: span, containerWidth: firstRow.parentElement.clientWidth };
    });

    expect(Math.abs(rowSpan - containerWidth)).toBeLessThan(2);
  });

  test("flips albums with the arrow keys and returns home on Escape", async ({ page }) => {
    await page.goto("/travels/italy-2020");
    await showsAlbum(page, "Italy");

    await page.keyboard.press("ArrowRight"); // Italy -> France (next)
    await showsAlbum(page, "France");

    await page.keyboard.press("ArrowLeft"); // France -> Italy (previous)
    await showsAlbum(page, "Italy");

    await page.keyboard.press("Escape"); // back to the grid
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("article")).toHaveCount(5);
  });

  test("handles a keypress during a transition only once", async ({ page }) => {
    // Regression guard: during the 600ms slide both the outgoing and incoming
    // album are mounted. Only the incoming one may respond to the keyboard —
    // otherwise a single keypress advances two steps at once.
    await page.goto("/travels/italy-2020");
    await expect(page.locator("h1")).toHaveText("Italy");

    await page.keyboard.press("ArrowRight"); // start Italy -> France
    await page.waitForTimeout(120); // land the next press firmly inside the slide
    const before = await page.evaluate(() => history.length);

    await page.keyboard.press("ArrowRight"); // one press, mid-transition
    await showsAlbum(page, "Philippines"); // France -> next, fully settled

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
    await page.goto("/travels/france-2020");
    await expect(page.locator("h1")).toHaveText("France");
  });
});
