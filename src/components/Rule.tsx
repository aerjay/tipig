import { D2 } from "../theme";

// A faded gradient hairline used as a soft section break (SPEC §8.2).
export function Rule() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${D2.rule}, transparent)`,
        marginTop: 40,
      }}
    />
  );
}
