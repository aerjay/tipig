import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build, serialize, titleCase } from "./build-albums.js";

// A minimal JPEG: SOI + a SOF0 frame carrying the given pixel dimensions + EOI.
// Enough for measure() to read width/height (and thus the derived ratio).
function jpeg(width, height) {
  const sof = Buffer.alloc(11);
  sof[0] = 0xff;
  sof[1] = 0xc0;
  sof.writeUInt16BE(9, 2);
  sof[4] = 8;
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), sof, Buffer.from([0xff, 0xd9])]);
}

let root;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tipig-albums-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

// Lay down an album folder under root: numbered JPEGs + an album.json.
// `photos` is an array of [width, height]; pass meta:null to skip album.json.
function makeAlbum(rel, photos, meta = { places: "Somewhere" }) {
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
    const album = {
      id: "japan-2027",
      title: "Japan",
      when: "March 2027",
      places: "Tokyo · Kyoto",
      cover: "/memories/2027/03/japan/01.jpeg",
      photos: [{ src: "/memories/2027/03/japan/01.jpeg", ratio: 0.6667 }],
    };
    const code = serialize([album]);
    expect(code).toContain("AUTO-GENERATED");
    expect(code).toMatch(/export const ALBUMS = \[/);

    // Write it out and import it back: the generated file must be valid JS
    // whose ALBUMS equals what we put in.
    const file = join(root, "albums.mjs");
    writeFileSync(file, code);
    const mod = await import(pathToFileURL(file).href);
    expect(mod.ALBUMS).toEqual([album]);
  });
});
