# ZANFIT

PWA para registrar entrenamientos de gimnasio. Todo se guarda localmente (IndexedDB); no hay backend.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:5173 (el service worker también está activo en dev)
- `npm run build`: chequeo de tipos (`tsc -b`) y build de producción en `dist/`
- `npm run preview`: sirve `dist/` para probar la instalación y el modo offline

Antes de dar algo por terminado, corre `npm run build`, que también hace el chequeo de tipos.

## Stack

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 vía `@tailwindcss/vite`. **No hay `tailwind.config.js`**: el tema se define con `@theme` en `src/index.css`
- Dexie + `dexie-react-hooks` (`useLiveQuery`) para IndexedDB
- React Router (`react-router-dom`, `BrowserRouter`)
- `vite-plugin-pwa` (generateSW, `registerType: 'autoUpdate'`), configurado en `vite.config.ts`
- Recharts para gráficos (pantalla Progreso)
- Fuentes self-hosted con `@fontsource-variable/*` (no usar Google Fonts: la app tiene que funcionar offline)

## Reglas de producto y diseño

- **Marca:** sin logo. La marca es solo el texto "ZANFIT", con el componente `<Marca />` (Space Grotesk, bold, color lima). No crear logos, isotipos ni imágenes de marca.
- **Mobile-first:** diseñar para ~375px de ancho; el contenido está centrado con `max-w-lg` en pantallas grandes.
- **Modo oscuro por defecto** (y único por ahora). Fondo `#0A0A0A`.
- **Acento:** verde lima `#C6FF3D` (`text-lima`, `bg-lima`). Sobre fondo lima el texto va en `text-fondo` (negro), nunca en blanco.
- **Pensar en manos sudadas:** elementos tocables de al menos 48px de alto (de preferencia 56px o más en acciones principales), buena separación entre botones, sin gestos finos ni objetivos pequeños. Inputs numéricos grandes con `inputMode="decimal"` o `"numeric"`.
- **Navegación inferior fija** con 4 tabs, en este orden: Entrenar, Rutinas, Progreso, Ejercicios.
- **Respetar safe areas** del iPhone: utilidades `pt-safe` y `pb-safe` definidas en `src/index.css`.
- **Offline primero:** nada puede depender de la red. No usar CDNs ni llamadas a APIs externas.

## Idioma

- Todos los textos de la interfaz van en **español de Chile**: neutro, cercano y con tuteo ("Agrega tu primera rutina", "¿Terminaste?"). Evitar el voseo argentino y los modismos de España ("vale", "vosotros"). Usar "kg" para el peso.
- El código del dominio (tipos, tablas, variables y componentes de dominio) también va en español: `Ejercicio`, `Rutina`, `Sesion`, `Serie`, `pesoKg`. Lo técnico y genérico puede quedar en inglés (`Layout`, `BottomNav`).
- Fechas y números con `Intl` y locale `es-CL`.

## Estructura de carpetas

```
public/              icon.svg y assets estáticos que copia la PWA
src/
  main.tsx           punto de entrada (BrowserRouter + StrictMode)
  App.tsx            definición de rutas
  index.css          Tailwind + tema (@theme) + utilidades propias
  components/        componentes reutilizables (Layout, BottomNav, Marca, PantallaVacia…)
  pages/             una pantalla por ruta: Entrenar, Rutinas, Progreso, Ejercicios
  db/index.ts        instancia de Dexie y esquema de tablas
  types/index.ts     tipos del dominio
```

Cuando crezca, crea `src/hooks/` para hooks con `useLiveQuery` (por ejemplo `useRutinas`) y `src/lib/` para utilidades puras (formateo, cálculos de volumen o 1RM). Las subpantallas van dentro de `pages/<tab>/`.

## Convenciones

- Componentes en PascalCase, un componente por archivo y `export default`.
- Imports relativos (no hay alias `@/`).
- Estilos solo con clases de Tailwind usando los tokens del tema (`bg-superficie`, `border-borde`, `text-texto-suave`, `text-lima`). No escribir colores hex sueltos en los componentes; si hace falta un color nuevo, se agrega a `@theme`.
- Íconos: SVG inline con `stroke="currentColor"`, sin librerías de íconos por ahora.
- **Dexie:** leer con `useLiveQuery` y escribir con `db.<tabla>.add/put/update`. En el esquema solo se indexan los campos por los que se consulta. **Nunca modificar una `db.version(n)` existente**: para cambiar el esquema, agrega `db.version(n + 1)` con su `upgrade()` si hace falta migrar datos.
- Las fechas se guardan como timestamp numérico (`Date.now()`) y los pesos siempre en kg.
- Rutas en minúscula y en español (`/entrenar`, `/rutinas/:id`).

## Estado actual

Esqueleto listo: las 4 pantallas existen pero están vacías (usan `<PantallaVacia />`). El esquema de Dexie v1 tiene `ejercicios`, `rutinas` y `sesiones`; todavía no se usa en ninguna pantalla.

Íconos de la PWA: `public/icon-192.png` y `public/icon-512.png` (texto ZANFIT en Space Grotesk 700, lima sobre `#0A0A0A`, dentro de la zona segura para `maskable`), más `icon.svg` como favicon. Se generaron renderizando el texto con Chrome headless a 512 px y reduciendo a 192 px con `sips`. Si cambia la marca, se regeneran de la misma forma.
