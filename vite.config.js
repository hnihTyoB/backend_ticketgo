export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9092/",
        changeOrigin: true,
      },
      "/images": {
        target: "http://localhost:9092/",
        changeOrigin: true,
      },
    },
  },
});
