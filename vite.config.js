import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'multi-page-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If the request is for /index or /about without extension, map to .html
          if (req.url === '/index') {
            req.url = '/index.html';
          } else if (req.url === '/about') {
            req.url = '/about.html';
          } else if (req.url === '/gold-testing') {
            req.url = '/gold-testing.html';
          } else if (req.url === '/partnerships') {
            req.url = '/partnerships.html';
          } else if (req.url === '/digital-solutions') {
            req.url = '/digital-solutions.html';
          } else if (req.url === '/watch-services') {
            req.url = '/watch-services.html';
          } else if (req.url === '/contact') {
            req.url = '/contact.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        goldTesting: resolve(__dirname, 'gold-testing.html'),
        partnerships: resolve(__dirname, 'partnerships.html'),
        digitalSolutions: resolve(__dirname, 'digital-solutions.html'),
        watchServices: resolve(__dirname, 'watch-services.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
