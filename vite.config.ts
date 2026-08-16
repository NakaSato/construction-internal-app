import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

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
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        // Inject the service-worker registration automatically — no app code
        // changes needed. autoUpdate silently activates new versions.
        injectRegister: "auto",
        includeAssets: ["vite.svg", "icons/apple-touch-icon.png"],
        manifest: {
          name: "ICMS – ระบบจัดการโครงการก่อสร้างภายในองค์กร",
          short_name: "ICMS",
          description:
            "ระบบจัดการโครงการก่อสร้างพลังงานแสงอาทิตย์ภายในองค์กร ติดตาม จัดการ และรายงานแบบเรียลไทม์",
          lang: "th",
          dir: "ltr",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          scope: "/",
          categories: ["business", "productivity"],
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
            { src: "icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}"],
          // The lazy pdf chunk is ~1.4 MB; raise the precache size ceiling.
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          navigateFallback: "index.html",
          // Never serve the SPA shell for API/docs requests.
          navigateFallbackDenylist: [/^\/api/, /^\/swagger/],
          runtimeCaching: [
            {
              // Live backend — try network first, fall back to cache offline.
              urlPattern: /^https:\/\/construction-dotnet-rest-api\.onrender\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "image-cache",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
          ],
        },
        devOptions: {
          // Keep the SW out of `vite dev` so it never interferes with HMR.
          enabled: false,
        },
      }),
      analyzer,
    ].filter(Boolean),

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
