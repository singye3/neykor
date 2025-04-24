import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    manifest: true, 
  },
  server: {
    // Define the port for the development server
    port: 5000, // Or any port you prefer
    // Optional: Proxy API requests if your backend runs separately during development
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080', // Your backend server address
    //     changeOrigin: true,
    //   }
    // }
  }
});