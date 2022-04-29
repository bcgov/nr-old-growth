import { fileURLToPath, URL } from "url";
import "dotenv/config";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = parseInt(process.env.VITE_PORT || "8080");

  console.log("process.env.VITE_BACKEND_URL", process.env.VITE_BACKEND_URL);
  console.log("env.VITE_BACKEND_URL", env.VITE_BACKEND_URL);

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
            process.env.VITE_BACKEND_URL ||
            env.VITE_BACKEND_URL ||
            "http://localhost:3000/",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
