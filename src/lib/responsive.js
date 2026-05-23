// Pick a value for the current viewport size (the SPEC §3 spacing matrix),
// e.g. bySize(size, 22, 36, 56) -> mobile 22 / tablet 36 / desktop 56.
export const bySize = (size, mobile, tablet, desktop) =>
  size === "mobile" ? mobile : size === "tablet" ? tablet : desktop;

// The page's horizontal padding is the same on every view, so it gets a name.
export const pageX = (size) => bySize(size, 22, 36, 56);
