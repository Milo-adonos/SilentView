import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    // Enable history API fallback for client-side routing
    historyApiFallback: true,
  },
  // Ensure all routes fall back to index.html in preview mode too
  preview: {
    port: 5173,
    host: true,
  },
});
