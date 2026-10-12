import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * En `npm run dev` no corren las funciones de Vercel: este plugin atiende `/api/plan-ia` con el mismo código
 * (api/plan-ia.ts). La clave sale de `.env` (GEMINI_API_KEY=…, ignorado por git) o del entorno.
 */
function apiLocal(): Plugin {
  return {
    name: 'zanfit-api-local',
    configureServer(server) {
      server.middlewares.use('/api/plan-ia', async (req, res) => {
        const partes: Buffer[] = []
        for await (const parte of req) partes.push(parte as Buffer)
        const modulo = (await server.ssrLoadModule('/api/plan-ia.ts')) as { POST: (r: Request) => Promise<Response> }
        const respuesta = await modulo.POST(
          new Request('http://localhost/api/plan-ia', {
            method: req.method,
            headers: Object.entries(req.headers).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v] as [string, string]] : [])),
            body: req.method === 'POST' ? Buffer.concat(partes) : undefined,
          }),
        )
        res.statusCode = respuesta.status
        res.setHeader('content-type', respuesta.headers.get('content-type') ?? 'application/json')
        res.end(await respuesta.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Variables sin prefijo VITE_ (como GEMINI_API_KEY) quedan solo en el servidor de desarrollo, nunca en el bundle.
  const env = loadEnv(mode, process.cwd(), '')
  // (Ojo: asignar `undefined` a process.env lo guarda como el texto "undefined".)
  for (const nombre of ['GEMINI_API_KEY', 'GEMINI_MODEL']) if (env[nombre] && !process.env[nombre]) process.env[nombre] = env[nombre]
  return {
    plugins: [
      apiLocal(),
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
          navigateFallbackDenylist: [/^\/api\//],
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
  }
})
