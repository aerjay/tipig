import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
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

// A minimal AVIF (ISOBMFF): an `ftyp` box followed by meta → iprp → ipco → ispe
// carrying the pixel dimensions, which is all measure() reads. Lets the tests
// lay down real AVIF/JPG cover pairs.
function avif(width: number, height: number): Buffer {
  const box = (type: string, content: Buffer): Buffer => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(8 + content.length, 0);
    header.write(type, 4, "ascii");
    return Buffer.concat([header, content]);
  };
  const ispe = Buffer.alloc(12); // 4 bytes version/flags, then width + height
  ispe.writeUInt32BE(width, 4);
  ispe.writeUInt32BE(height, 8);
  const ftyp = box("ftyp", Buffer.concat([Buffer.from("avif", "ascii"), Buffer.alloc(4)]));
  const meta = box("meta", Buffer.concat([Buffer.alloc(4), box("iprp", box("ipco", box("ispe", ispe)))]));
  return Buffer.concat([ftyp, meta]);
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

describe("cover format variants (AVIF/JPG split)", () => {
  // Lay down an album with arbitrarily-named image files (mixed formats) + meta.
  function makeMixed(
    rel: string,
    files: Record<string, Buffer>,
    meta: Record<string, unknown> | null = { places: "Somewhere" }
  ): string {
    const dir = join(root, rel);
    mkdirSync(dir, { recursive: true });
    for (const [name, buf] of Object.entries(files)) writeFileSync(join(dir, name), buf);
    if (meta !== null) writeFileSync(join(dir, "album.json"), JSON.stringify(meta));
    return dir;
  }

  // THE BUG: a cover that exists as both 01.JPG and 01.avif must collapse to a
  // SINGLE photo, not appear twice. Before the format-grouping fix, both files
  // matched the image filter and 01 was emitted as two duplicate photos.
  it("collapses a JPG+AVIF pair for one basename into a single photo (no duplicate)", () => {
    makeMixed("2026/04/australia", {
      "01.JPG": jpeg(800, 1000),
      "01.avif": avif(800, 1000),
      "02.avif": avif(1500, 1000),
    });
    const [album] = build(root);
    expect(album.photos).toEqual([
      // 01 appears once, as the AVIF (preferred for the in-page <img>) — not twice
      { src: "/memories/2026/04/australia/01.avif", ratio: 0.8 },
      { src: "/memories/2026/04/australia/02.avif", ratio: 1.5 },
    ]);
    expect(album.photos.filter((p) => p.src.includes("/01.")).length).toBe(1);
  });

  it("derives cover from the JPG (for OG) and coverAvif from the AVIF", () => {
    makeMixed("2026/04/australia", {
      "01.JPG": jpeg(800, 1000),
      "01.avif": avif(800, 1000),
    });
    const [album] = build(root);
    expect(album.cover).toBe("/memories/2026/04/australia/01.JPG");
    expect(album.coverAvif).toBe("/memories/2026/04/australia/01.avif");
  });

  it("omits coverAvif when the cover has no AVIF variant", () => {
    makeMixed("2020/02/italy", { "01.jpeg": jpeg(1000, 1500) });
    const [album] = build(root);
    expect(album.cover).toBe("/memories/2020/02/italy/01.jpeg");
    expect(album.coverAvif).toBeUndefined();
  });

  it("falls back to the AVIF for `cover` when the cover has no JPG variant", () => {
    // e.g. an album whose first photo is AVIF-only — cover is the AVIF and there
    // is no separate JPG to advertise, so coverAvif stays absent.
    makeMixed("2021/05/england", { "02.avif": avif(1000, 1500), "03.avif": avif(1000, 1500) });
    const [album] = build(root);
    expect(album.cover).toBe("/memories/2021/05/england/02.avif");
    expect(album.coverAvif).toBeUndefined();
  });

  it("honours an album.json cover override across both formats", () => {
    makeMixed(
      "2024/06/japan",
      {
        "01.avif": avif(1, 1),
        "02.JPG": jpeg(1, 1),
        "02.avif": avif(1, 1),
      },
      { places: "Tokyo", cover: "02.avif" }
    );
    const [album] = build(root);
    expect(album.cover).toBe("/memories/2024/06/japan/02.JPG");
    expect(album.coverAvif).toBe("/memories/2024/06/japan/02.avif");
  });
});

describe("serialize", () => {
  it("emits an AUTO-GENERATED module that round-trips to the same data", async () => {
    const album: Album = {
      id: "japan-2027",
      title: "Japan",
      when: "March 2027",
      places: "Tokyo · Kyoto",
      cover: "/memories/2027/03/japan/01.JPG",
      coverAvif: "/memories/2027/03/japan/01.avif",
      photos: [{ src: "/memories/2027/03/japan/01.avif", ratio: 0.6667 }],
    };
    const code = serialize([album]);
    expect(code).toContain("AUTO-GENERATED");
    expect(code).toMatch(/export const ALBUMS/);
    expect(code).toContain('coverAvif: "/memories/2027/03/japan/01.avif"');

    // The emitted module is TypeScript (typed import + annotation). Compile it
    // to JS the way the toolchain does, then import it back: the generated
    // ALBUMS must equal what we put in.
    const { code: js } = await transform(code, { loader: "ts" });
    const file = join(root, "albums.mjs");
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href);
    expect(mod.ALBUMS).toEqual([album]);
  });

  it("omits the coverAvif line for an album that has none", () => {
    const album: Album = {
      id: "italy-2020",
      title: "Italy",
      when: "February 2020",
      places: "Roma",
      cover: "/memories/2020/02/italy/01.jpeg",
      photos: [{ src: "/memories/2020/02/italy/01.jpeg", ratio: 0.6667 }],
    };
    const code = serialize([album]);
    expect(code).not.toContain("coverAvif");
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
  // A throwaway git repo with a fixed committer date, so these tests own their
  // data and never read this project's real history. GIT_*_DATE uses local time
  // (no offset) so the rendered %cs date matches what we wrote regardless of the
  // machine's timezone.
  function seedRepo(): string {
    const repo = mkdtempSync(join(tmpdir(), "tipig-git-"));
    execSync("git init -q", { cwd: repo });
    return repo;
  }
  const COMMIT_ENV = {
    ...process.env,
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@example.com",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@example.com",
    GIT_AUTHOR_DATE: "2021-07-15T12:00:00",
    GIT_COMMITTER_DATE: "2021-07-15T12:00:00",
  };

  it("reads the last-commit date (YYYY-MM-DD) for a tracked path", () => {
    const repo = seedRepo();
    try {
      writeFileSync(join(repo, "tracked.txt"), "hi");
      execSync("git add tracked.txt", { cwd: repo });
      execSync("git commit -q -m seed", { cwd: repo, env: COMMIT_ENV });
      expect(gitLastModified("tracked.txt", "FALLBACK", repo)).toBe("2021-07-15");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("returns the fallback when a path has no commits", () => {
    const repo = seedRepo();
    try {
      expect(gitLastModified("no/such/path-xyz-123", "2020-01-01", repo)).toBe("2020-01-01");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
