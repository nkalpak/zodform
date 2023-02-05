/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setup-tests.ts"],
  },
  build: {
    lib: {
      entry: path.resolve("src/index.ts"),
      name: "@nkaplak/zodform",
      fileName: "zodform",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
