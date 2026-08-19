import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// בילד מיוחד לקובץ HTML עצמאי יחיד (לפרסום כ-Artifact)
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-artifact",
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
});
