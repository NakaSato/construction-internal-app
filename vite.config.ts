import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Bundle analyzer - enabled only when ANALYZE=true.
  // rollup-plugin-visualizer is ESM-only; import it dynamically so it never
  // gets require()'d during config load under Vite 8's rolldown loader.
  const analyzer =
    process.env.ANALYZE === "true"
      ? (await import("rollup-plugin-visualizer")).visualizer({
          filename: "dist/stats.html",
          open: true,
          gzipSize: true,
          brotliSize: true,
        })
      : null;

  return {
    plugins: [react(), analyzer].filter(Boolean),

  server: {
    host: true,
    port: 3000,
    open: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    // The `pdf` chunk (@react-pdf/renderer + fontkit/yoga/brotli/… runtime)
    // is ~1.4 MB but fully lazy — it loads only when a report is generated,
    // never on initial paint. Raise the limit so its size doesn't warn.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Generate random hash-based filenames for better caching
        entryFileNames: "assets/[hash].js",
        chunkFileNames: "assets/[hash].js",
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[hash][extname]";
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[hash][extname]`;
          }
          return `assets/[hash][extname]`;
        },
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Core React libraries
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return "vendor";
          if (id.includes("react-router")) return "router";

          // Heavy, lazy-loadable libraries — isolate each.
          // @react-pdf/renderer + its whole transitive runtime (fontkit,
          // yoga-layout, brotli, pako, hyphen, …). Group them all so they
          // stay in the lazy pdf chunk instead of leaking into the eager
          // bundle.
          if (
            /[\\/]node_modules[\\/](@react-pdf[\\/]|pdfkit|fontkit|yoga-layout|brotli|pako|hyphen|jay-peg|png-js|restructure|linebreak|bidi-js|unicode-properties|unicode-trie|dfa|clone|@foliojs-fork|pdf-parse)/.test(
              id
            )
          )
            return "pdf";
          if (id.includes("tesseract.js")) return "ocr";
          if (id.includes("leaflet")) return "maps";
          if (
            id.includes("chart.js") ||
            id.includes("react-chartjs-2") ||
            id.includes("/d3-") ||
            id.includes("/d3/")
          )
            return "charts";
          if (id.includes("lottie")) return "lottie";

          // MUI + emotion (large UI kit)
          if (id.includes("@mui") || id.includes("@emotion"))
            return "mui";

          // Animation / misc UI
          if (id.includes("framer-motion") || id.includes("react-hot-toast"))
            return "ui";

          // Everything else third-party — split per top-level package
          const m = id.match(/node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)/);
          if (m) return "vm-" + m[1].replace(/[@\\/]/g, "-");
          return "vendor-misc";
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@features": "/src/features",
      "@shared": "/src/shared",
      "@pages": "/src/pages",
      "@widgets": "/src/widgets",
      "@lib": "/src/shared/lib",
      "@utils": "/src/shared/utils",
      "@types": "/src/shared/types",
      "@api": "/src/shared/api",
      "@hooks": "/src/shared/hooks",
    },
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
  };
});
