import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { D2 } from "./theme";
import { matchView, axisFor } from "./lib/nav";
import Home from "./views/Home";
import Album from "./views/Album";
import About from "./views/About";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

// Page transitions (SPEC §10) — a two-layer slide pair (Codrops "Move to /
// Move from"). On navigation we render BOTH the outgoing view and the
// incoming view as full-viewport layers and slide them together:
//
//   • axis comes from the DESTINATION view (Album → horizontal, else vertical)
//   • direction (forward / back) is carried on the navigation's location state
//
// Each layer keeps a stable React key (the location key), so the settled view
// is never remounted when a transition ends — without this, every photo's
// lazy fade-in would re-run and flicker.
const EASE = [0.7, 0, 0.3, 1];
const DURATION = 0.6; // seconds

// `active` is true for the settled/incoming layer and false for the outgoing
// layer during a transition. Only the active Album wires up keyboard nav.
function renderView(location, active) {
  const m = matchView(location.pathname);
  if (m.view === "about") return <About />;
  if (m.view === "album") return <Album key={m.albumId} albumId={m.albumId} active={active} />;
  return <Home />;
}

// Start ("from") and end ("exit") offsets for the entering/leaving layers.
function offsets(axis, dir) {
  if (axis === "horizontal") {
    return dir === "back"
      ? { from: { x: "-100%" }, exit: { x: "100%" } }
      : { from: { x: "100%" }, exit: { x: "-100%" } };
  }
  return dir === "back"
    ? { from: { y: "-100%" }, exit: { y: "100%" } }
    : { from: { y: "100%" }, exit: { y: "-100%" } };
}

const layerBase = {
  background: D2.bg,
  width: "100%",
  minHeight: "100vh",
};
// During a transition each layer is its own fixed, clipped viewport so the
// off-screen page never grows the document or shows a scrollbar.
const transLayer = {
  position: "fixed",
  inset: 0,
  overflowX: "hidden",
  overflowY: "auto",
};

export default function App() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const [stack, setStack] = useState(() => ({
    current: location,
    leaving: null,
    axis: "vertical",
    dir: "forward",
  }));
  const timer = useRef(null);

  useEffect(() => {
    if (location.key === stack.current.key) return;
    const dest = matchView(location.pathname);
    const axis = axisFor(dest.view);
    const dir = location.state?.dir || "forward";
    window.scrollTo(0, 0);

    if (reduced) {
      setStack({ current: location, leaving: null, axis, dir });
      return;
    }
    setStack({ current: location, leaving: stack.current, axis, dir });
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setStack((s) => ({ ...s, leaving: null })),
      DURATION * 1000 + 40
    );
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, reduced]);

  const { current, leaving, axis, dir } = stack;
  const transitioning = leaving !== null;
  const off = offsets(axis, dir);

  return (
    <>
      {leaving && (
        <motion.div
          key={leaving.key}
          initial={{ x: 0, y: 0 }}
          animate={off.exit}
          transition={{ duration: DURATION, ease: EASE }}
          style={{ ...layerBase, ...transLayer, zIndex: 1 }}
        >
          {renderView(leaving, false)}
        </motion.div>
      )}
      <motion.div
        key={current.key}
        initial={transitioning ? off.from : false}
        animate={{ x: 0, y: 0 }}
        transition={{ duration: DURATION, ease: EASE }}
        style={{
          ...layerBase,
          ...(transitioning ? { ...transLayer, zIndex: 2 } : { position: "relative" }),
        }}
      >
        {renderView(current, true)}
      </motion.div>
    </>
  );
}
