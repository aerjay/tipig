import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  // Vitest runs the co-located unit tests under src/ and scripts/. The
  // Playwright end-to-end specs live in e2e/ and are run separately
  // (npm run test:e2e).
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});