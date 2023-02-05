/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({})],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setup-tests.ts"],
  },
  build: {
    outDir: ".",
    lib: {
      entry: path.resolve("index.ts"),
      name: "@nkaplak/zodform",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
