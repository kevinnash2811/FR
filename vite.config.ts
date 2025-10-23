import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import VueDevTools from "vite-plugin-vue-devtools";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.xlsx'],
  plugins: [
    vue({
      template: {
        transformAssetUrls,
      },
    }),
    vueJsx(),
    VueDevTools(),
    quasar({
      sassVariables: "@/quasar.variables.sass",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@accounts": fileURLToPath(
        new URL("./src/modules/Accounts", import.meta.url),
      ),
      "@planning": fileURLToPath(
        new URL("./src/modules/Planning", import.meta.url),
      ),
      "@cycle": fileURLToPath(
        new URL("./src/modules/HANRT_ciclos", import.meta.url),
      ),
      "@contacts": fileURLToPath(
        new URL("./src/modules/Contacts", import.meta.url),
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
});
