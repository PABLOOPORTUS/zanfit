import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-64.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'ZANFIT',
        short_name: 'ZANFIT',
        description: 'Registro de entrenamientos para el gimnasio',
        lang: 'es-CL',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0A0A',
        theme_color: '#0A0A0A',
        categories: ['health', 'fitness', 'sports'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        // De las fotos de ejercicios solo las miniaturas van al precache (~6 MB); las grandes (~50 MB en total) se
        // guardan la primera vez que se abre cada ejercicio (ver runtimeCaching).
        globIgnores: ['medios/fotos/!(*-mini).webp'],
        navigateFallback: '/index.html',
        // Videos del fondo del login: no van al precache (pesan ~1 MB c/u); se guardan la primera vez que se ven.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/medios/fondo/') && url.pathname.endsWith('.mp4'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos-fondo',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 8 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/medios/fotos/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fotos-ejercicios',
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 600 },
            },
          },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
})
