// Measure photo aspect ratios for src/data/albums.ts.
//
// The justified-strips layout needs each photo's `ratio` (native width ÷
// height, as the browser DISPLAYS it). This script walks public/memories/
// (the per-album <year>/<month>/<country>/ folders) straight from each file header —
// no dependencies — and emits ready-to-paste `{ src, ratio }` lines, grouped
// by folder, so adding an album is pure copy/paste.
//
// Usage:
//   npm run measure          # every photo under public/memories
//   npm run measure -- --new # only photos not already in albums.ts
//
// Ratio matches what the browser shows: an <img> auto-rotates by EXIF
// orientation, so for orientation 5–8 (90° turns) we swap width/height to get
// the displayed ratio, not the stored one.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const memoriesDir = join(root, "public", "memories");
const albumsFile = join(root, "src", "data", "albums.ts");

export interface Dims {
  width: number;
  height: number;
}

// --- JPEG ------------------------------------------------------------------
// Walk the marker segments. SOF markers carry the frame's height/width;
// an APP1 "Exif" segment carries the orientation we need to honour.
function readJpeg(buf: Buffer): Dims | null {
  let off = 2; // skip SOI (FFD8)
  let orientation = 1;
  let dims: Dims | null = null;
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
      if (payload + 5 > buf.length) break; // SOF truncated — treat as unreadable
      dims = { height: buf.readUInt16BE(payload + 1), width: buf.readUInt16BE(payload + 3) };
    } else if (marker === 0xe1 && buf.toString("ascii", payload, payload + 4) === "Exif") {
      orientation = readExifOrientation(buf, payload + 6, len - 8) ?? 1;
    }
    // SOF always follows the APP1/EXIF segment in a valid JPEG, so once we have
    // dims the orientation is already settled. Stop here rather than scanning on
    // into entropy-coded data, where a stray 0xff can be misread as another SOF
    // and clobber the real dimensions.
    if (dims) break;
    off = payload + (len - 2);
  }
  if (!dims) return null;
  // Orientations 5–8 are 90° rotations: the image displays with axes swapped.
  return orientation >= 5 && orientation <= 8
    ? { width: dims.height, height: dims.width }
    : dims;
}

// Minimal TIFF/EXIF reader: find tag 0x0112 (Orientation) in IFD0.
function readExifOrientation(buf: Buffer, tiffStart: number, tiffLen: number): number | null {
  if (tiffStart + 8 > buf.length) return null;
  const le = buf.toString("ascii", tiffStart, tiffStart + 2) === "II";
  const u16 = (o: number) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o: number) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
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
function readPng(buf: Buffer): Dims | null {
  if (buf.length < 24) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// --- AVIF (ISOBMFF) --------------------------------------------------------
// AVIF wraps the image in an ISO Base Media File: a tree of [size:u32][type:4cc]
// boxes. The pixel dimensions live in an `ispe` property nested under
// meta → iprp → ipco, and an optional `irot` sibling records a 90° rotation the
// browser applies on display (the AVIF analogue of EXIF orientation).
interface Box {
  type: string;
  start: number; // first content byte (after the header)
  end: number; // one past the last content byte
}

// Iterate the boxes lying in [start, end). Handles the 64-bit (size===1) and
// to-EOF (size===0) length encodings; stops cleanly on a truncated/garbage box.
function* boxes(buf: Buffer, start: number, end: number): Generator<Box> {
  let off = start;
  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    let header = 8;
    if (size === 1) {
      if (off + 16 > end) return;
      // 53-bit safe: AVIF photo boxes are far below 2^53 bytes.
      size = buf.readUInt32BE(off + 8) * 2 ** 32 + buf.readUInt32BE(off + 12);
      header = 16;
    } else if (size === 0) {
      size = end - off;
    }
    if (size < header || off + size > end) return;
    yield { type, start: off + header, end: off + size };
    off += size;
  }
}

// First child box of `type` within [start, end), or null.
function firstBox(buf: Buffer, start: number, end: number, type: string): Box | null {
  for (const b of boxes(buf, start, end)) if (b.type === type) return b;
  return null;
}

function readAvif(buf: Buffer): Dims | null {
  // `meta` is a FullBox, so its children begin 4 bytes (version+flags) in.
  const meta = firstBox(buf, 0, buf.length, "meta");
  if (!meta) return null;
  const iprp = firstBox(buf, meta.start + 4, meta.end, "iprp");
  if (!iprp) return null;
  const ipco = firstBox(buf, iprp.start, iprp.end, "ipco");
  if (!ipco) return null;

  // ipco holds one property per item (main image, alpha, maybe a thumbnail).
  // The largest `ispe` is the main image; `irot` carries its display rotation.
  let dims: Dims | null = null;
  let rotation = 0;
  for (const p of boxes(buf, ipco.start, ipco.end)) {
    if (p.type === "ispe" && p.start + 12 <= p.end) {
      const w = buf.readUInt32BE(p.start + 4); // skip 4-byte version/flags
      const h = buf.readUInt32BE(p.start + 8);
      if (!dims || w * h > dims.width * dims.height) dims = { width: w, height: h };
    } else if (p.type === "irot" && p.start < p.end) {
      rotation = buf[p.start] & 0x03; // angle = rotation × 90° counter-clockwise
    }
  }
  if (!dims) return null;
  // 90°/270° rotations swap the displayed axes, mirroring the EXIF 5–8 case.
  return rotation === 1 || rotation === 3
    ? { width: dims.height, height: dims.width }
    : dims;
}

export function measure(buf: Buffer): Dims | null {
  if (buf[0] === 0xff && buf[1] === 0xd8) return readJpeg(buf);
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return readPng(buf);
  // ISOBMFF (AVIF/HEIF): the file opens with an `ftyp` box at offset 4.
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") return readAvif(buf);
  return null;
}

// Round to 4 decimals and drop trailing zeros (1.5, not 1.5000).
export const toRatio = (w: number, h: number): number => parseFloat((w / h).toFixed(4));

// Every image under dir, as paths relative to it, using "/" separators so they
// match the URL form regardless of platform.
function walk(dir: string, base: string = dir): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, base));
    else if (/\.(jpe?g|png|avif)$/i.test(entry.name)) found.push(relative(base, full).split(sep).join("/"));
  }
  return found;
}

// --- run -------------------------------------------------------------------
function main(): void {
  const onlyNew = process.argv.includes("--new");
  const referenced: Set<string> | null = onlyNew
    ? new Set(
        [...readFileSync(albumsFile, "utf8").matchAll(/\/memories\/[^"']+/g)].map((m) => m[0])
      )
    : null;

  const rels = walk(memoriesDir).sort();

  // Group lines under their folder (one folder == one album), so the output
  // drops straight into a new album's `photos: [...]`.
  const groups = new Map<string, string[]>();
  const failed: string[] = [];
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
    let group = groups.get(folder);
    if (!group) {
      group = [];
      groups.set(folder, group);
    }
    group.push(`      { src: "${src}", ratio: ${toRatio(dims.width, dims.height)} },`);
  }

  const blocks = [...groups]
    .map(([folder, lines]) => `    // ${folder}\n${lines.join("\n")}`)
    .join("\n");
  if (blocks) {
    console.log(blocks);
  } else if (onlyNew) {
    console.log("// No new photos — every file under public/memories is already in albums.ts.");
  }

  const notes: string[] = [];
  if (onlyNew && skipped) notes.push(`${skipped} already referenced`);
  if (failed.length) notes.push(`${failed.length} unreadable: ${failed.join(", ")}`);
  if (notes.length) console.error(`\n// ${notes.join(" · ")}`);
  if (failed.length) process.exitCode = 1;
}

// Run the CLI only when invoked directly (tsx scripts/measure.ts), not when
// imported by the test — the test exercises measure()/toRatio() in isolation.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
