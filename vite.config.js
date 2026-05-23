/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest runs only the co-located unit tests under src/. The Playwright
  // end-to-end specs live in e2e/ and are run separately (npm run test:e2e).
  test: {
    include: ["src/**/*.test.js"],
  },
});
