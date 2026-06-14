import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/campaign": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
