# [Tipig](https://www.tipg.kingham-italia.co.uk)
In Hiligaynon, *tipig* means: 

> preserving, keeping (in a safe state); to guard well, reserve, preserve, keep, and save.

## Background

When I close my eyes I just see black, and memories fade on me fast. So I keep them with a camera instead. The photos here are the imperfect, messy, happy moments I never want to lose.

## Goal

To preserve these memories through a camera lens and present them in a gallery-like setting, where the works on display are photographs rather than paintings or sculpture.

The project also served as an exercise in AI-assisted development with Claude Code, Claude Design, Perplexity Labs, Lovable, and Cursor, building the site through prompt engineering.

## Design/Implementation

Keep it as simple as possible.

Built from the design handoff in `TIPIG 1.2.zip` (see its `SPEC.md`) as a
Vite + React + TypeScript single-page app — React Router for navigation,
Framer Motion for the page transitions — deployed to Cloudflare Workers.

The album view uses a **justified-strips layout** (the Flickr / Google Photos
style): photos keep their native aspect ratio and flow into rows, where every row
is scaled to fill the container width edge-to-edge and all photos in a row share
one height. Photos read in filename order (left-to-right, top-to-bottom), but
because each row holds a different number of photos depending on their shapes, it
reads as strips rather than a fixed grid. Mobile falls back to a single column.

## Running it

```bash
npm install        # one-time
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # build, then serve via Wrangler (Cloudflare Workers, local)
npm run deploy     # build, then deploy to Cloudflare Workers
npm run typecheck  # type-check only (tsc --noEmit)
npm test           # unit tests (Vitest) — pure logic
npm run test:e2e   # end-to-end tests (Playwright) — auto-starts the dev server
npm run verify     # regenerate albums, then typecheck + unit + e2e (full gate)
```

### Tests

- **Unit (`npm test`)** — fast, in-Node tests of the pure logic, co-located as
  `*.test.ts` beside the code they cover: the justified-rows algorithm (tested
  against its invariants, not hard-coded pixels), date formatting, routing
  helpers, the `srcset` URL encoder, image measurement, and the album generator.
- **End-to-end (`npm run test:e2e`)** — a thin Playwright net in `e2e/` covering
  what unit tests can't: real routing + deep links, the justified layout as
  measured by a real browser, keyboard navigation, and that no view logs an
  error. DOM-bound behavior (layout, fades, transitions) is verified here by
  running the app, not by mocking the DOM.

### Structure

- `src/views/` — the three views: `Home` (Travels grid), `Album`
  (justified-strips gallery), `About` (artist statement).
- `src/App.tsx` — the page-transition controller (two-layer slide pair).
- `src/components/`, `src/hooks/`, `src/theme.ts` — shared UI pieces (Header,
  Footer, cards, album strips), the hooks (viewport size, reduced-motion, and
  `useDocumentHead` for per-route `<title>`/description/Open Graph tags), and
  design tokens.
- `src/types.ts` — the shared domain types (`Album`, `Photo`, `Size`, `View`).
- `src/lib/` — the pure helpers: `justified.ts` (the row-packing algorithm for
  the album view), `nav.ts` (route ↔ view matching + transition axis),
  `format.ts` (date formatting), and `responsive.ts` / `srcset.ts`
  (viewport-based sizing and `srcset` URL encoding for the responsive images).
- `public/memories/<year>/<month>/<country>/` — one folder per album and the
  source of truth: the photos as AVIF (`01.avif…`, sorted by filename — the album
  reads in that sequence left-to-right, top-to-bottom),
  optionally a JPG/JPEG twin of the cover (`01.jpg` — served to non-mobile and
  used as the social-share image), plus an `album.json`. One country = one
  album; list its cities/towns in `places`.
- `src/data/albums.ts` — **auto-generated; do not edit by hand.** Built from the
  folders above by `npm run build:albums` (which also runs automatically before
  `npm run dev`, `npm run build`, and `npm run verify`).
- `scripts/build-albums.ts` — the generator. Besides `src/data/albums.ts` it also
  writes `public/sitemap.xml` (just the two crawlable routes — `/` and `/about` —
  each stamped with the git last-modified date of its content). `scripts/measure.ts`
  reads image aspect ratios (`npm run measure` to spot-check a folder). Both run via `tsx`.
- `public/robots.txt`, `public/sitemap.xml` — SEO. `robots.txt` `Disallow`s
  `/travels/*` (the per-album pages are intentionally not indexed), so the sitemap
  lists only `/` and `/about`. `sitemap.xml` is auto-generated — see above.

### Adding an album

1. Make the folder `public/memories/<year>/<month>/<country>/` — month is two
   digits, e.g. `public/memories/2027/03/japan/`.
2. Drop the photos in as AVIF, named `01.avif`, `02.avif`, … **in the order you
   want them shown** — zero-pad to a consistent width so they sort correctly
   (use `001.avif…` once an album has 100+ photos). The album view is a
   justified-strips layout, so photos repack into rows of varying counts to fill
   each row's width; the *sequence* still follows the filenames (read
   left-to-right, top-to-bottom), it just isn't a fixed numbered grid. `01` is the
   cover by default.
   Optionally add a JPG/JPEG twin of the cover (e.g. `01.jpg`): it's served to
   non-mobile viewers and used as the social-share (Open Graph) image, while
   mobile gets the AVIF.
3. Add an `album.json` in that folder with the cities/towns:
   ```json
   { "places": "Tokyo · Kyoto" }
   ```
   Optional keys: `"title"` (override the auto Title-case, e.g. `"USA"`) and
   `"cover"` (a different photo filename, e.g. `"03.avif"`).
4. Run `npm run verify` — regenerates `src/data/albums.ts` from the folder,
   then runs typecheck + unit + e2e to confirm the new album is wired up.
   (To just preview it instead, `npm run dev` regenerates first too.)

Everything else is derived from the folder: `id` (`japan-2027`), `title`
(`Japan`), date (`March 2027`), each photo's aspect ratio, and the album's
reverse-chronological position in the grid.

### Routes

- `/` → Travels · `/about` → About · `/travels/:albumId` → Album
  (e.g. `/travels/italy-2020`).
