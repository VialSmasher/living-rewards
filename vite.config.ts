import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    envDir: __dirname,
    envPrefix: ["VITE_"],
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "apps", "web", "src")
      },
      dedupe: ["react", "react-dom"]
    },
    root: path.resolve(__dirname, "apps", "web"),
    build: {
      target: "es2022",
      minify: "esbuild",
      sourcemap: false,
      modulePreload: { polyfill: false },
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            query: ["@tanstack/react-query"]
          }
        }
      },
      outDir: path.resolve(__dirname, "apps", "web", "dist"),
      emptyOutDir: true
    },
    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true
        }
      }
    }
  };
});
