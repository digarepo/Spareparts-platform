import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {port: 3001},
  plugins: [tailwindcss() as PluginOption, reactRouter() as PluginOption, tsconfigPaths() as PluginOption],
});
