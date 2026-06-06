import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transform } from "esbuild";
import { build, serialize, titleCase, sitemapPages, serializeSitemap, gitLastModified } from "./build-albums";
import type { Album } from "../src/types";

// A minimal JPEG: SOI + a SOF0 frame carrying the given pixel dimensions + EOI.
// Enough for measure() to read width/height (and thus the derived ratio).
function jpeg(width: number, height: number): Buffer {
  const sof = Buffer.alloc(11);
  sof[0] = 0xff;
  sof[1] = 0xc0;
  sof.writeUInt16BE(9, 2);
  sof[4] = 8;
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), sof, Buffer.from([0xff, 0xd9])]);
}

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tipig-albums-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

// Lay down an album folder under root: numbered JPEGs + an album.json.
// `photos` is an array of [width, height]; pass meta:null to skip album.json.
function makeAlbum(
  rel: string,
  photos: Array<[number, number]>,
  meta: Record<string, unknown> | null = { places: "Somewhere" }
): string {
  const dir = join(root, rel);
  mkdirSync(dir, { recursive: true });
  photos.forEach(([w, h], i) => {
    writeFileSync(join(dir, `${String(i + 1).padStart(2, "0")}.jpeg`), jpeg(w, h));
  });
  if (meta !== null) writeFileSync(join(dir, "album.json"), JSON.stringify(meta));
  return dir;
}

describe("titleCase", () => {
  it("title-cases a single-word country", () => {
    expect(titleCase("italy")).toBe("Italy");
  });
  it("title-cases a hyphenated country", () => {
    expect(titleCase("new-zealand")).toBe("New Zealand");
  });
});

describe("build", () => {
  it("derives id, title, date, cover, and measured photos from the folder + album.json", () => {
    makeAlbum("2020/02/italy", [[1000, 1500], [1500, 1000]], { places: "Roma · Milano" });
    const [album] = build(root);
    expect(album).toMatchObject({
      id: "italy-2020",
      title: "Italy",
      when: "February 2020",
      places: "Roma · Milano",
      cover: "/memories/2020/02/italy/01.jpeg",
    });
    // photos stay in filename order, each carrying its measured ratio
    expect(album.photos).toEqual([
      { src: "/memories/2020/02/italy/01.jpeg", ratio: 0.6667 },
      { src: "/memories/2020/02/italy/02.jpeg", ratio: 1.5 },
    ]);
  });

  it("lets album.json override the derived Title-case", () => {
    makeAlbum("2024/06/usa", [[1, 1]], { places: "New York", title: "USA" });
    expect(build(root)[0].title).toBe("USA");
  });

  it("lets album.json override the cover", () => {
    makeAlbum("2024/06/japan", [[1, 1], [1, 1], [1, 1]], { places: "Tokyo", cover: "03.jpeg" });
    expect(build(root)[0].cover).toBe("/memories/2024/06/japan/03.jpeg");
  });

  it("orders albums newest-first, breaking ties by country name", () => {
    makeAlbum("2020/01/france", [[1, 1]]);
    makeAlbum("2020/02/italy", [[1, 1]]);
    makeAlbum("2026/03/australia", [[1, 1]]);
    makeAlbum("2026/03/zanzibar", [[1, 1]]); // same year+month as australia
    expect(build(root).map((a) => a.id)).toEqual([
      "australia-2026", // 2026-03, alphabetically before zanzibar
      "zanzibar-2026",
      "italy-2020",
      "france-2020",
    ]);
  });

  it("appends the month to disambiguate a country with multiple albums in one year", () => {
    makeAlbum("2025/12/united-kingdom", [[1, 1]]);
    makeAlbum("2025/08/united-kingdom", [[1, 1]]);
    makeAlbum("2025/01/united-kingdom", [[1, 1]]);
    makeAlbum("2025/03/ireland", [[1, 1]]); // sole album that year keeps the clean id
    const ids = build(root).map((a) => a.id);
    expect(ids).toEqual([
      "united-kingdom-2025-12",
      "united-kingdom-2025-08",
      "ireland-2025",
      "united-kingdom-2025-01",
    ]);
    expect(new Set(ids).size).toBe(ids.length); // all unique
  });

  it("skips image-less folders and ignores non-conforming directories", () => {
    makeAlbum("2020/02/italy", [[1, 1]]);
    makeAlbum("2021/05/ghost", [], { places: "nowhere" }); // album.json but no photos
    mkdirSync(join(root, "drafts"), { recursive: true }); // not a 4-digit year
    mkdirSync(join(root, "2020/13/x"), { recursive: true }); // 13 isn't a valid month
    expect(build(root).map((a) => a.id)).toEqual(["italy-2020"]);
  });

  it("throws when album.json is missing", () => {
    makeAlbum("2020/02/italy", [[1, 1]], null);
    expect(() => build(root)).toThrow(/2020\/02\/italy: missing album\.json/);
  });

  it("throws when places is missing or blank", () => {
    makeAlbum("2020/02/italy", [[1, 1]], { places: "   " });
    expect(() => build(root)).toThrow(/"places" is required/);
  });

  it("throws when the cover filename isn't a photo in the folder", () => {
    makeAlbum("2020/02/italy", [[1, 1]], { places: "Roma", cover: "99.jpeg" });
    expect(() => build(root)).toThrow(/cover "99\.jpeg" is not a photo/);
  });

  it("throws on invalid album.json", () => {
    const dir = makeAlbum("2020/02/italy", [[1, 1]], null);
    writeFileSync(join(dir, "album.json"), "{ not valid json");
    expect(() => build(root)).toThrow(/invalid JSON/);
  });
});

describe("serialize", () => {
  it("emits an AUTO-GENERATED module that round-trips to the same data", async () => {
    const album: Album = {
      id: "japan-2027",
      title: "Japan",
      when: "March 2027",
      places: "Tokyo · Kyoto",
      cover: "/memories/2027/03/japan/01.jpeg",
      photos: [{ src: "/memories/2027/03/japan/01.jpeg", ratio: 0.6667 }],
    };
    const code = serialize([album]);
    expect(code).toContain("AUTO-GENERATED");
    expect(code).toMatch(/export const ALBUMS/);

    // The emitted module is TypeScript (typed import + annotation). Compile it
    // to JS the way the toolchain does, then import it back: the generated
    // ALBUMS must equal what we put in.
    const { code: js } = await transform(code, { loader: "ts" });
    const file = join(root, "albums.mjs");
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href);
    expect(mod.ALBUMS).toEqual([album]);
  });
});

describe("sitemapPages", () => {
  it("lists only the two crawlable routes — never a /travels/* album", () => {
    const pages = sitemapPages(() => "2026-01-01");
    expect(pages.map((p) => p.loc)).toEqual([
      "https://www.tipg.kingham-italia.co.uk/",
      "https://www.tipg.kingham-italia.co.uk/about",
    ]);
    expect(pages.some((p) => p.loc.includes("/travels/"))).toBe(false);
  });

  it("dates each page from the lookup, keyed by its underlying content path", () => {
    const lookup = (p: string) => (p === "public/memories" ? "2026-06-06" : "2026-05-23");
    expect(sitemapPages(lookup)).toEqual([
      { loc: "https://www.tipg.kingham-italia.co.uk/", lastmod: "2026-06-06" },
      { loc: "https://www.tipg.kingham-italia.co.uk/about", lastmod: "2026-05-23" },
    ]);
  });
});

describe("serializeSitemap", () => {
  const pages = [
    { loc: "https://www.tipg.kingham-italia.co.uk/", lastmod: "2026-06-06" },
    { loc: "https://www.tipg.kingham-italia.co.uk/about", lastmod: "2026-05-23" },
  ];

  it("wraps every page in a <url> with <loc> + <lastmod>", () => {
    const xml = serializeSitemap(pages);
    expect((xml.match(/<url>/g) ?? []).length).toBe(2);
    expect(xml).toContain("<loc>https://www.tipg.kingham-italia.co.uk/</loc>");
    expect(xml).toContain("<lastmod>2026-06-06</lastmod>");
    expect(xml).toContain("<loc>https://www.tipg.kingham-italia.co.uk/about</loc>");
    expect(xml).toContain("<lastmod>2026-05-23</lastmod>");
  });

  it("emits a valid prolog + sitemap namespace", () => {
    const xml = serializeSitemap(pages);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("omits <priority>/<changefreq> (Google ignores them)", () => {
    const xml = serializeSitemap(pages);
    expect(xml).not.toContain("<priority>");
    expect(xml).not.toContain("<changefreq>");
  });

  it("renders an empty urlset without any <url> entries", () => {
    const xml = serializeSitemap([]);
    expect(xml).not.toContain("<url>");
    expect(xml).toContain("<urlset");
  });
});

describe("gitLastModified", () => {
  it("reads the last-commit date (YYYY-MM-DD) for a tracked path", () => {
    expect(gitLastModified("scripts/build-albums.ts", "FALLBACK")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the fallback when a path has no commits", () => {
    expect(gitLastModified("no/such/path-xyz-123", "2020-01-01")).toBe("2020-01-01");
  });
});
