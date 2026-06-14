import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/campaign": {
        target: "https://ai-native-mini-crm-dq9h.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
