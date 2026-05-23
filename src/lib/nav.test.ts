import { describe, it, expect } from "vitest";
import { matchView, axisFor, albumWithNeighbours } from "./nav";
import { ALBUMS } from "../data/albums";

describe("matchView", () => {
  it("maps the home and about paths", () => {
    expect(matchView("/")).toEqual({ view: "home" });
    expect(matchView("/about")).toEqual({ view: "about" });
  });

  it("extracts the album id from a travels path", () => {
    expect(matchView("/travels/italy-2020")).toEqual({
      view: "album",
      albumId: "italy-2020",
    });
  });

  it("falls back to home for an unknown path", () => {
    expect(matchView("/somewhere-else")).toEqual({ view: "home" });
  });
});

describe("axisFor", () => {
  it("slides horizontally into an album and vertically everywhere else", () => {
    expect(axisFor("album")).toBe("horizontal");
    expect(axisFor("home")).toBe("vertical");
    expect(axisFor("about")).toBe("vertical");
  });
});

describe("albumWithNeighbours", () => {
  it("wraps around at both ends of the album list", () => {
    const first = ALBUMS[0];
    const last = ALBUMS.at(-1)!;
    expect(albumWithNeighbours(first.id).prev.id).toBe(last.id);
    expect(albumWithNeighbours(last.id).next.id).toBe(first.id);
  });

  it("returns the immediate neighbours for a middle album", () => {
    const i = 2;
    const { album, prev, next } = albumWithNeighbours(ALBUMS[i].id);
    expect(album.id).toBe(ALBUMS[i].id);
    expect(prev.id).toBe(ALBUMS[i - 1].id);
    expect(next.id).toBe(ALBUMS[i + 1].id);
  });

  it("falls back to the first album for an unknown id", () => {
    expect(albumWithNeighbours("does-not-exist").album.id).toBe(ALBUMS[0].id);
  });
});
