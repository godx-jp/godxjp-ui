import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  server: { port: 5180, strictPort: true },
  resolve: { dedupe: ["react", "react-dom"] },
});
