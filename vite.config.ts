import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const publishedOrigin = loadEnv(mode, process.cwd(), "").PUBLISHED_SITE_URL;
  return ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    proxy: publishedOrigin ? {
      "^/api/(content|media)(\\?|$)": { target: publishedOrigin, changeOrigin: true, proxyTimeout: 20000, timeout: 25000, bypass(req) {
        if (req.method !== "GET" && req.method !== "HEAD") return false;
      } },
    } : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
});
