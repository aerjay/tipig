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
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { measure, toRatio } from "./measure";
import type { Album } from "../src/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const memoriesDir = join(root, "public", "memories");
const outFile = join(root, "src", "data", "albums.ts");

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

// Run as a CLI (tsx scripts/build-albums.ts); skipped when imported by the test.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const albums = build();
  writeFileSync(outFile, serialize(albums));
  console.log(`Generated src/data/albums.ts — ${albums.length} albums:`);
  for (const a of albums) console.log(`  ${a.when.padEnd(15)} ${a.id} (${a.photos.length} photos)`);
}
