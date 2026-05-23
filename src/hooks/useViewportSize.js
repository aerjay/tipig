import { useEffect, useState } from "react";

// Map viewport width to the spec's three size keys (SPEC §3):
//   mobile  : < 700
//   tablet  : 700 .. 1099
//   desktop : >= 1100
function read() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1440;
  return w < 700 ? "mobile" : w < 1100 ? "tablet" : "desktop";
}

export function useViewportSize() {
  const [size, setSize] = useState(read);
  useEffect(() => {
    const onResize = () => setSize(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}
