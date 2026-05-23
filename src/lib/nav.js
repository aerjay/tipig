// Route <-> view mapping and direction-aware navigation.
//
// The page-transition system (SPEC §10) needs two things on every navigation:
//   • an AXIS, derived purely from the destination view
//       - destination = Album  -> horizontal slide
//       - destination = Home/About -> vertical slide
//   • a DIRECTION (forward / back), which is intent we attach to the
//     navigation via React Router's location state.
import { useNavigate } from "react-router-dom";
import { ALBUMS } from "../data/albums";

export function matchView(pathname) {
  if (pathname === "/about") return { view: "about" };
  const m = pathname.match(/^\/travels\/([^/]+)/);
  if (m) return { view: "album", albumId: decodeURIComponent(m[1]) };
  return { view: "home" };
}

export function axisFor(view) {
  return view === "album" ? "horizontal" : "vertical";
}

// Hook returning direction-tagged navigation actions. Components call these
// instead of useNavigate directly so the transition picks the right direction.
export function useGalleryNav() {
  const navigate = useNavigate();
  return {
    goHome: () => navigate("/", { state: { dir: "back" } }),
    goAbout: () => navigate("/about", { state: { dir: "forward" } }),
    openAlbum: (id) => navigate(`/travels/${id}`, { state: { dir: "forward" } }),
    nextAlbum: (id) => navigate(`/travels/${id}`, { state: { dir: "forward" } }),
    prevAlbum: (id) => navigate(`/travels/${id}`, { state: { dir: "back" } }),
  };
}

// Resolve the album for an id, plus its wrap-around neighbours (SPEC §7.3).
export function albumWithNeighbours(albumId) {
  const album = ALBUMS.find((a) => a.id === albumId) || ALBUMS[0];
  const idx = ALBUMS.findIndex((a) => a.id === album.id);
  const prev = ALBUMS[(idx - 1 + ALBUMS.length) % ALBUMS.length];
  const next = ALBUMS[(idx + 1) % ALBUMS.length];
  return { album, prev, next };
}
