import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
   plugins: [react(), tailwindcss()],
   resolve: {
      alias: {
         '@': path.resolve(import.meta.dirname, './src')
      }
   },
   server: {
      port: 3000
   },
   build: {
      rolldownOptions: {
         output: {
            // Long-lived vendor chunks: an app deploy does not bust the cache for
            // React or Framer Motion, and Leaflet stays out of the first paint
            codeSplitting: {
               groups: [
                  {
                     name: 'react',
                     test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/
                  },
                  {
                     name: 'motion',
                     test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/
                  },
                  {
                     name: 'leaflet',
                     test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/
                  }
               ]
            }
         }
      }
   }
});
