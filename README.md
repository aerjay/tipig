# Project Tipig
In Hiligaynon, *tipig* means: 

> preserving, keeping (in a safe state); to guard well, reserve, preserve, keep, and save.

## Background
I have aphantasia (I can only see black when I close my eyes) and a hard time remembering things, so preserving my memories is super important to me. Capturing those imperfect, emotional moments helps me relive them later, no matter how happy or messy they are. [link this to the web app]

## Goal

To preserve these imperfect memories through a camera lens, capturing the feelings and emotions of those precious moments. These photos serve as reminders and help me feel something meaningful. [insert web app link] At the same time, this project allows me to explore and learn new front-end technologies. It is my way of keeping, preserving, and *tipig*an my memories while expanding my technical knowledge.

When accessing this web app, I want to evoke the same feelings you get when walking through a museum or gallery, marveling at beautiful works of art — whether paintings, sculptures, or other creations. In this case, the works are my photos — my memories.

## Design/Implementation

Keep it as simple as possible.

Built from the design handoff in `TIPIG 1.2.zip` (see its
`SPEC.md`) as a Vite + React single-page app with React Router.

## Running it

```bash
npm install       # one-time
npm run dev       # dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # unit tests (Vitest) — pure logic
npm run test:e2e  # end-to-end tests (Playwright) — auto-starts the dev server
```

### Tests

- **Unit (`npm test`)** — fast, in-Node tests of the pure logic, co-located as
  `src/lib/*.test.js`: the justified-rows algorithm (tested against its
  invariants, not hard-coded pixels), date formatting, and routing helpers.
- **End-to-end (`npm run test:e2e`)** — a thin Playwright net in `e2e/` covering
  what unit tests can't: real routing + deep links, the justified layout as
  measured by a real browser, keyboard navigation, and that no view logs an
  error. DOM-bound behavior (layout, fades, transitions) is verified here by
  running the app, not by mocking the DOM.

### Structure

- `src/views/` — the three views: `Home` (Travels grid), `Album`
  (justified-strips gallery), `About` (artist statement).
- `src/App.jsx` — the page-transition controller (two-layer slide pair).
- `src/lib/justified.js` — the row-packing algorithm for the album view.
- `public/memories/<year>/<month>/<country>/` — one folder per album and the
  source of truth: the photos (`01.jpeg…`, numbered in display order) plus an
  `album.json`. One country = one album; list its cities/towns in `places`.
- `src/data/albums.js` — **auto-generated; do not edit by hand.** Built from the
  folders above by `npm run build:albums` (which also runs automatically before
  `npm run dev` and `npm run build`).
- `scripts/build-albums.js` — the generator. `scripts/measure.js` reads image
  aspect ratios (`npm run measure` to spot-check a folder).

### Adding an album

1. Make the folder `public/memories/<year>/<month>/<country>/` — month is two
   digits, e.g. `public/memories/2027/03/japan/`.
2. Drop the photos in, named `01.jpeg`, `02.jpeg`, … **in the order you want them
   shown**. `01` is the cover by default.
3. Add an `album.json` in that folder with the cities/towns:
   ```json
   { "places": "Tokyo · Kyoto" }
   ```
   Optional keys: `"title"` (override the auto Title-case, e.g. `"USA"`) and
   `"cover"` (a different photo filename, e.g. `"03.jpeg"`).
4. Run `npm run build:albums` (or just `npm run dev`, which regenerates first).

Everything else is derived from the folder: `id` (`japan-2027`), `title`
(`Japan`), date (`March 2027`), each photo's aspect ratio, and the album's
reverse-chronological position in the grid.

### Routes

- `/` → Travels · `/about` → About · `/travels/:albumId` → Album
  (e.g. `/travels/italy-2020`).
