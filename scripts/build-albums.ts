// Generate src/data/albums.ts from the photo folders + per-album album.json.
//
// Source of truth is the filesystem: each album is a folder
//   public/memories/<year>/<month>/<country>/
// holding its photos (01.jpeg…, numbered in display order) and an album.json.
//
// album.json supplies the only hand-authored field, `places`, plus optional
// `title` / `cover` overrides. Everything else is derived:
//   id     ← <country>-<year>            (e.g. italy-2020)
//            …-<month> appended when a country has 2+ albums in one year
//   title  ← Title-cased <country>       (override for casing, e.g. "USA")
//   when   ← <month> + <year>            (e.g. February 2020)
//   cover  ← first photo                 (override with a filename)
//   photos ← every image, sorted, each measured for its aspect ratio
//   order  ← reverse-chronological (ties broken by country name)
//
// Run `npm run build:albums`; also runs automatically before dev/build.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { measure, toRatio } from "./measure";
import type { Album } from "../src/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const memoriesDir = join(root, "public", "memories");
const outFile = join(root, "src", "data", "albums.ts");
const sitemapFile = join(root, "public", "sitemap.xml");

// Canonical production origin (also used by the per-route <head> tags in
// src/hooks/useDocumentHead.ts — keep the two in sync).
const SITE_URL = "https://www.tipg.kingham-italia.co.uk";

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const isImage = (f: string): boolean => /\.(jpe?g|png)$/i.test(f);
const subdirs = (d: string): string[] =>
  readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
export const titleCase = (slug: string): string =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// The hand-authored album.json. Only `places` is required; the rest is derived.
interface AlbumMeta {
  places?: string;
  cover?: string;
  title?: string;
}

// An album plus the scratch fields used only for ordering the output.
interface BuiltAlbum extends Album {
  sortKey: string;
  country: string;
  mm: string;
}

// Walk <baseDir>/<year>/<MM>/<country>/ and build one album per folder.
export function build(baseDir: string = memoriesDir): BuiltAlbum[] {
  const albums: BuiltAlbum[] = [];
  for (const year of subdirs(baseDir).filter((y) => /^\d{4}$/.test(y))) {
    for (const mm of subdirs(join(baseDir, year)).filter((m) => /^(0[1-9]|1[0-2])$/.test(m))) {
      for (const country of subdirs(join(baseDir, year, mm))) {
        const rel = `${year}/${mm}/${country}`;
        const dir = join(baseDir, rel);
        const photos = readdirSync(dir).filter(isImage).sort();
        if (photos.length === 0) continue;

        const metaPath = join(dir, "album.json");
        if (!existsSync(metaPath)) throw new Error(`${rel}: missing album.json`);
        let meta: AlbumMeta;
        try {
          meta = JSON.parse(readFileSync(metaPath, "utf8")) as AlbumMeta;
        } catch (e) {
          throw new Error(`${rel}/album.json: invalid JSON — ${(e as Error).message}`);
        }
        if (typeof meta.places !== "string" || !meta.places.trim())
          throw new Error(`${rel}/album.json: "places" is required`);

        const cover = meta.cover || photos[0];
        if (!photos.includes(cover))
          throw new Error(`${rel}/album.json: cover "${cover}" is not a photo in this folder`);

        albums.push({
          sortKey: year + mm,
          country,
          mm,
          id: `${country}-${year}`,
          title: meta.title || titleCase(country),
          when: `${MONTHS[Number(mm) - 1]} ${year}`,
          places: meta.places,
          cover: `/memories/${rel}/${cover}`,
          photos: photos.map((file) => {
            const dims = measure(readFileSync(join(dir, file)));
            if (!dims || !dims.width || !dims.height)
              throw new Error(`${rel}/${file}: unreadable image`);
            return { src: `/memories/${rel}/${file}`, ratio: toRatio(dims.width, dims.height) };
          }),
        });
      }
    }
  }
  if (albums.length === 0)
    throw new Error("No albums found under public/memories/<year>/<month>/<country>/");
  // Disambiguate collisions: a country with 2+ albums in one year would otherwise
  // share the same <country>-<year> id, so append the month to each of those.
  const idCounts = new Map<string, number>();
  for (const a of albums) idCounts.set(a.id, (idCounts.get(a.id) ?? 0) + 1);
  for (const a of albums) if (idCounts.get(a.id)! > 1) a.id = `${a.id}-${a.mm}`;
  // Newest first; same-month albums fall back to alphabetical country order.
  albums.sort((a, b) => b.sortKey.localeCompare(a.sortKey) || a.country.localeCompare(b.country));
  return albums;
}

export function serialize(albums: Album[]): string {
  const q = JSON.stringify;
  const block = (a: Album): string =>
    [
      "  {",
      `    id: ${q(a.id)},`,
      `    title: ${q(a.title)},`,
      `    when: ${q(a.when)},`,
      `    places: ${q(a.places)},`,
      `    cover: ${q(a.cover)},`,
      "    photos: [",
      ...a.photos.map((p) => `      { src: ${q(p.src)}, ratio: ${p.ratio} },`),
      "    ],",
      "  },",
    ].join("\n");

  return `// AUTO-GENERATED by \`npm run build:albums\` — do not edit by hand.
// Source of truth: the photos + album.json in each
// public/memories/<year>/<month>/<country>/ folder. Regenerated automatically
// before \`npm run dev\` and \`npm run build\`; run \`npm run build:albums\` to
// refresh it manually. See scripts/build-albums.ts for what's derived.
import type { Album } from "../types";

export const ALBUMS: Album[] = [
${albums.map(block).join("\n")}
];
`;
}

// A crawlable page in the sitemap: its absolute URL and an honest last-modified
// date. Google reads <lastmod> only when it's accurate, so we derive it from the
// content's real history rather than stamping the build date everywhere.
interface SitemapPage {
  loc: string;
  lastmod: string;
}

// Last git commit date (YYYY-MM-DD) that touched a path, e.g. the album photos
// behind "/" or the About copy behind "/about". Falls back to `fallback` when
// git is unavailable (shallow clone / no VCS) so the build never breaks.
export function gitLastModified(relPath: string, fallback: string): string {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${relPath}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || fallback;
  } catch {
    return fallback;
  }
}

// The sitemap's URL set. Deliberately only the two crawlable routes: the
// /travels/* albums are Disallowed in public/robots.txt, so listing them would
// produce "Indexed, though blocked by robots.txt" in Search Console. `lookup`
// resolves a path to its last-modified date (gitLastModified in the CLI).
export function sitemapPages(lookup: (relPath: string) => string): SitemapPage[] {
  return [
    { loc: `${SITE_URL}/`, lastmod: lookup("public/memories") },
    { loc: `${SITE_URL}/about`, lastmod: lookup("src/views/About.tsx") },
  ];
}

// Serialize pages to a sitemap. We emit just <loc> + <lastmod> — Google ignores
// <priority>/<changefreq>, so they're omitted as dead weight.
export function serializeSitemap(pages: SitemapPage[]): string {
  const url = (p: SitemapPage): string =>
    ["  <url>", `    <loc>${p.loc}</loc>`, `    <lastmod>${p.lastmod}</lastmod>`, "  </url>"].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- AUTO-GENERATED by \`npm run build:albums\` — do not edit by hand.
     Lists only crawlable pages; /travels/* albums are intentionally excluded
     (they are Disallowed in public/robots.txt). -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(url).join("\n")}
</urlset>
`;
}

// Run as a CLI (tsx scripts/build-albums.ts); skipped when imported by the test.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const albums = build();
  writeFileSync(outFile, serialize(albums));
  console.log(`Generated src/data/albums.ts — ${albums.length} albums:`);
  for (const a of albums) console.log(`  ${a.when.padEnd(15)} ${a.id} (${a.photos.length} photos)`);

  const today = new Date().toISOString().slice(0, 10);
  const pages = sitemapPages((p) => gitLastModified(p, today));
  writeFileSync(sitemapFile, serializeSitemap(pages));
  console.log(`Generated public/sitemap.xml — ${pages.length} crawlable pages:`);
  for (const p of pages) console.log(`  ${p.lastmod}  ${p.loc}`);
}
