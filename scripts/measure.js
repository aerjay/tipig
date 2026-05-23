// Measure photo aspect ratios for src/data/albums.js.
//
// The justified-strips layout needs each photo's `ratio` (native width ÷
// height, as the browser DISPLAYS it). This script walks public/memories/
// (the per-album <year>/<month>/<country>/ folders) straight from each file header —
// no dependencies — and emits ready-to-paste `{ src, ratio }` lines, grouped
// by folder, so adding an album is pure copy/paste.
//
// Usage:
//   npm run measure          # every photo under public/memories
//   npm run measure -- --new # only photos not already in albums.js
//
// Ratio matches what the browser shows: an <img> auto-rotates by EXIF
// orientation, so for orientation 5–8 (90° turns) we swap width/height to get
// the displayed ratio, not the stored one.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const memoriesDir = join(root, "public", "memories");
const albumsFile = join(root, "src", "data", "albums.js");

// --- JPEG ------------------------------------------------------------------
// Walk the marker segments. SOF markers carry the frame's height/width;
// an APP1 "Exif" segment carries the orientation we need to honour.
function readJpeg(buf) {
  let off = 2; // skip SOI (FFD8)
  let orientation = 1;
  let dims = null;
  while (off < buf.length - 1) {
    if (buf[off] !== 0xff) {
      off++;
      continue;
    }
    let marker = buf[off + 1];
    off += 2;
    while (marker === 0xff && off < buf.length) marker = buf[off++]; // skip fill bytes
    // Standalone markers (SOI/EOI/RSTn/TEM) have no length payload.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue;
    }
    if (off + 2 > buf.length) break;
    const len = buf.readUInt16BE(off);
    const payload = off + 2;
    // SOF0–SOF15 hold the dimensions, except DHT(C4)/JPG(C8)/DAC(CC).
    const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      dims = { height: buf.readUInt16BE(payload + 1), width: buf.readUInt16BE(payload + 3) };
    } else if (marker === 0xe1 && buf.toString("ascii", payload, payload + 4) === "Exif") {
      orientation = readExifOrientation(buf, payload + 6, len - 8) ?? 1;
    }
    if (dims && orientation !== 1) break; // have everything we need
    off = payload + (len - 2);
  }
  if (!dims) return null;
  // Orientations 5–8 are 90° rotations: the image displays with axes swapped.
  return orientation >= 5 && orientation <= 8
    ? { width: dims.height, height: dims.width }
    : dims;
}

// Minimal TIFF/EXIF reader: find tag 0x0112 (Orientation) in IFD0.
function readExifOrientation(buf, tiffStart, tiffLen) {
  if (tiffStart + 8 > buf.length) return null;
  const le = buf.toString("ascii", tiffStart, tiffStart + 2) === "II";
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd0 = tiffStart + u32(tiffStart + 4);
  if (ifd0 + 2 > buf.length) return null;
  const count = u16(ifd0);
  for (let i = 0; i < count; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (entry + 12 > tiffStart + tiffLen || entry + 12 > buf.length) break;
    if (u16(entry) === 0x0112) return u16(entry + 8); // value sits in the entry
  }
  return null;
}

// --- PNG -------------------------------------------------------------------
// Dimensions live in the IHDR chunk, the first chunk after the 8-byte sig.
function readPng(buf) {
  if (buf.length < 24) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function measure(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return readJpeg(buf);
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return readPng(buf);
  return null;
}

// Round to 4 decimals and drop trailing zeros (1.5, not 1.5000).
export const toRatio = (w, h) => parseFloat((w / h).toFixed(4));

// Every image under dir, as paths relative to it, using "/" separators so they
// match the URL form regardless of platform.
function walk(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, base));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) found.push(relative(base, full).split(sep).join("/"));
  }
  return found;
}

// --- run -------------------------------------------------------------------
function main() {
  const onlyNew = process.argv.includes("--new");
  const referenced = onlyNew
    ? new Set(
        [...readFileSync(albumsFile, "utf8").matchAll(/\/memories\/[^"']+/g)].map((m) => m[0])
      )
    : null;

  const rels = walk(memoriesDir).sort();

  // Group lines under their folder (one folder == one album), so the output
  // drops straight into a new album's `photos: [...]`.
  const groups = new Map();
  const failed = [];
  let skipped = 0;
  for (const rel of rels) {
    const src = `/memories/${rel}`;
    if (referenced && referenced.has(src)) {
      skipped++;
      continue;
    }
    const dims = measure(readFileSync(join(memoriesDir, rel)));
    if (!dims || !dims.width || !dims.height) {
      failed.push(rel);
      continue;
    }
    const folder = rel.slice(0, rel.lastIndexOf("/"));
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(`      { src: "${src}", ratio: ${toRatio(dims.width, dims.height)} },`);
  }

  const blocks = [...groups]
    .map(([folder, lines]) => `    // ${folder}\n${lines.join("\n")}`)
    .join("\n");
  if (blocks) {
    console.log(blocks);
  } else if (onlyNew) {
    console.log("// No new photos — every file under public/memories is already in albums.js.");
  }

  const notes = [];
  if (onlyNew && skipped) notes.push(`${skipped} already referenced`);
  if (failed.length) notes.push(`${failed.length} unreadable: ${failed.join(", ")}`);
  if (notes.length) console.error(`\n// ${notes.join(" · ")}`);
  if (failed.length) process.exitCode = 1;
}

// Run the CLI only when invoked directly (node scripts/measure.js), not when
// imported by the test — the test exercises measure()/toRatio() in isolation.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
