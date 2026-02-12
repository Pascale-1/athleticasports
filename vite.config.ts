import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: isCapacitor ? './' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI component libraries
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
          ],
          // Data and state management
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Forms and validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Charts and visualization
          'vendor-charts': ['recharts'],
          // Animations
          'vendor-animations': ['framer-motion'],
          // Date utilities
          'vendor-dates': ['date-fns', 'react-day-picker'],
          // Other utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    !isCapacitor && VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "Athletica Sports",
        short_name: "Athletica",
        description: "Empowering women in sports through community and teamwork",
        theme_color: "#9361E0",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["sports", "fitness", "social"],
        shortcuts: [
          {
            name: "Log Activity",
            short_name: "Log",
            description: "Quickly log a new activity",
            url: "/track",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "My Teams",
            short_name: "Teams",
            description: "View your teams",
            url: "/teams",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
