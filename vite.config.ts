import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // Use the /personal/ base ONLY in production (for GitHub Pages).
  // Keep "/" during dev so localhost works normally.
  base: mode === "production" ? "/personal/" : "/",
  plugins: [react()],
}));
