import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"], // Add .tsx here
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
