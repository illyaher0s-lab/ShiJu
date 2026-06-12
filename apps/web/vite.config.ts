import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "AI Reading Trainer",
        short_name: "Reading Trainer",
        display: "standalone",
        start_url: "/",
        theme_color: "#2563eb",
        background_color: "#f8fafc",
        icons: []
      }
    })
  ],
  server: {
    port: 5173
  }
});
