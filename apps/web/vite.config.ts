import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3004,
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /@\/(.*)/,
        replacement: path.join(path.resolve(__dirname, "src"), "$1"),
      },
    ],
  },
});
