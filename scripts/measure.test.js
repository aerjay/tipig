import { describe, it, expect } from "vitest";
import { measure, toRatio } from "./measure.js";

// These tests build the smallest valid headers the reader cares about, in
// memory — no fixture files. Each helper writes only the bytes measure()
// actually inspects (the signature, the dimension fields, and for JPEG an
// optional EXIF orientation), padding the rest.

// PNG: 8-byte signature, then an IHDR chunk whose width/height sit at byte
// offsets 16 and 20.
function makePng(width, height) {
  const buf = Buffer.alloc(24);
  buf[0] = 0x89;
  buf.write("PNG", 1, "ascii");
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

// An APP1 "Exif" segment carrying a single IFD0 entry: the Orientation tag
// (0x0112). Little-endian ("II") TIFF block.
function exifSegment(orientation) {
  const tiff = Buffer.alloc(26);
  tiff.write("II", 0, "ascii"); // byte order
  tiff.writeUInt16LE(0x2a, 2); // TIFF magic
  tiff.writeUInt32LE(8, 4); // IFD0 begins 8 bytes in
  tiff.writeUInt16LE(1, 8); // one directory entry
  tiff.writeUInt16LE(0x0112, 10); // tag: Orientation
  tiff.writeUInt16LE(3, 12); // type: SHORT
  tiff.writeUInt32LE(1, 14); // count
  tiff.writeUInt16LE(orientation, 18); // value (left-justified in the field)

  const body = Buffer.concat([Buffer.from("Exif\0\0", "ascii"), tiff]);
  const seg = Buffer.alloc(4 + body.length);
  seg[0] = 0xff;
  seg[1] = 0xe1; // APP1
  seg.writeUInt16BE(2 + body.length, 2); // segment length
  body.copy(seg, 4);
  return seg;
}

// JPEG: SOI, an optional EXIF segment, a SOF0 frame holding height/width, EOI.
function makeJpeg(width, height, orientation) {
  const sof = Buffer.alloc(11);
  sof[0] = 0xff;
  sof[1] = 0xc0; // SOF0
  sof.writeUInt16BE(9, 2); // segment length
  sof[4] = 8; // sample precision
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);

  return Buffer.concat([
    Buffer.from([0xff, 0xd8]), // SOI
    orientation ? exifSegment(orientation) : Buffer.alloc(0),
    sof,
    Buffer.from([0xff, 0xd9]), // EOI
  ]);
}

describe("measure", () => {
  it("reads PNG dimensions from the IHDR chunk", () => {
    expect(measure(makePng(800, 600))).toEqual({ width: 800, height: 600 });
  });

  it("reads JPEG dimensions from the SOF frame", () => {
    expect(measure(makeJpeg(1448, 2172))).toEqual({ width: 1448, height: 2172 });
  });

  it("finds the SOF frame even when an EXIF segment precedes it", () => {
    // orientation 1 = upright: dimensions pass through unchanged.
    expect(measure(makeJpeg(1448, 2172, 1))).toEqual({ width: 1448, height: 2172 });
  });

  it("swaps width/height for 90° EXIF orientations (the browser auto-rotates)", () => {
    // A landscape frame shot in portrait: stored 2172×1448, displayed 1448×2172.
    for (const o of [5, 6, 7, 8]) {
      expect(measure(makeJpeg(2172, 1448, o))).toEqual({ width: 1448, height: 2172 });
    }
  });

  it("does NOT swap for upright orientations (1 = normal, 3 = 180°)", () => {
    for (const o of [1, 3]) {
      expect(measure(makeJpeg(2172, 1448, o))).toEqual({ width: 2172, height: 1448 });
    }
  });

  it("returns null for an unrecognised format", () => {
    expect(measure(Buffer.from("not an image at all"))).toBeNull();
    expect(measure(Buffer.from([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });

  it("measures then rounds to a displayed ratio that matches albums.js", () => {
    const dims = measure(makeJpeg(2172, 1448, 6)); // rotated → portrait
    expect(toRatio(dims.width, dims.height)).toBe(0.6667);
  });
});

describe("toRatio", () => {
  it("rounds to four decimal places", () => {
    expect(toRatio(1448, 2172)).toBe(0.6667); // 0.66666… → 0.6667
    expect(toRatio(1059, 1633)).toBe(0.6485);
  });

  it("drops trailing zeros (1.5, not 1.5000)", () => {
    expect(toRatio(2172, 1448)).toBe(1.5);
    expect(toRatio(100, 100)).toBe(1);
  });
});
