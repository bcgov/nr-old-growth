import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = parseInt(env.VITE_PORT) || 8080;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // test: {
    //   globals: true,
    // },
    server: {
      port: port,
      proxy: {
        "/api": {
          target:
            env.VITE_NODE_ENV === "development"
              ? "http://localhost:3000/"
              : "https://gfp-backend-dev.apps.silver.devops.gov.bc.ca",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
