import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// El frontend vive en ./client y su build sale a ./public,
// que es lo que sirve NestJS en producción.
const clientDir = fileURLToPath(new URL("./client", import.meta.url));
const publicDir = fileURLToPath(new URL("./public", import.meta.url));

export default defineConfig(({ mode }) => {
  // Las variables VITE_* se leen de client/.env
  const env = loadEnv(mode, clientDir, "");
  const backendTarget = env.VITE_BACKEND_URL || "http://localhost:3000";

  return {
    root: clientDir,
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.VITE_PORT ?? "5173", 10),
      // Proxy: el frontend habla con el backend en el mismo origen (localhost:5173).
      // Permite cookies httpOnly con sameSite=lax sin CORS ni HTTPS en desarrollo.
      proxy: {
        "/api": { target: backendTarget, changeOrigin: true, secure: false },
        "/static": { target: backendTarget, changeOrigin: true, secure: false },
      },
    },
    build: {
      sourcemap: false,
      outDir: publicDir,
      emptyOutDir: true,
    },
  };
});
