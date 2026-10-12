# ZANFIT

PWA para registrar entrenamientos de gimnasio. Todo se guarda localmente (IndexedDB); no hay backend. Los datos viven solo en el teléfono, así que el respaldo JSON (Ajustes) es la única copia de seguridad.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:5173 (el service worker también está activo en dev)
- `npm run build`: chequeo de tipos (`tsc -b`) y build de producción en `dist/`
- `npm run preview`: sirve `dist/` en http://localhost:4173 para probar instalación y modo offline (el offline real solo se prueba aquí, no en dev)

Antes de dar algo por terminado, corre `npm run build`, que también hace el chequeo de tipos.

## Stack

- React 19 + Vite 8 + TypeScript 7 (strict). Node >= 22.12
- Tailwind CSS v4 vía `@tailwindcss/vite`. **No hay `tailwind.config.js`**: el tema se define con `@theme` en `src/index.css`
- Dexie + `dexie-react-hooks` (`useLiveQuery`) para IndexedDB
- React Router (`react-router-dom`, `BrowserRouter`)
- `vite-plugin-pwa` (generateSW, `registerType: 'autoUpdate'`), configurado en `vite.config.ts`
- Recharts para gráficos. Solo se usa en `ProgresoEjercicio`, que se carga con `React.lazy` para sacar unos 380 kB del bundle principal (igual queda en el precache offline)
- Fuentes self-hosted con `@fontsource-variable/*` (no usar Google Fonts: la app tiene que funcionar offline)

## Reglas de producto y diseño

- **Marca:** dentro de la app, la marca es solo el texto "ZANFIT" con `<Marca />` (Space Grotesk, bold, color lima). No crear logos ni isotipos.
- **Ícono de la app:** el texto "ZF" en Space Grotesk 700, negro (`#0A0A0A`) sobre lima (`#C6FF3D`). Ver "Íconos" más abajo.
- **Mobile-first:** diseñar para 375px de ancho; el contenido está centrado con `max-w-lg` en pantallas grandes.
- **Modo oscuro por defecto** (y único por ahora). Fondo `#0A0A0A`.
- **Acento:** verde lima `#C6FF3D` (`text-lima`, `bg-lima`). Sobre fondo lima el texto va en `text-fondo` (negro), nunca en blanco.
- **Pensar en manos sudadas:** todo lo que se toca mide al menos 44×44px (de preferencia 48px, y 56px o más en acciones principales), con buena separación. Sin gestos finos (no hay arrastrar para reordenar: se usan flechas). Inputs numéricos grandes con `inputMode="decimal"` o `"numeric"`.
- **Navegación inferior fija** con 4 tabs, en este orden: Entrenar, Rutinas, Progreso, Ejercicios. Ajustes se abre con el engranaje del encabezado (`/ajustes`), no es una tab.
- **Respetar safe areas** del iPhone: utilidades `pt-safe` y `pb-safe` definidas en `src/index.css`.
- **Offline primero:** nada puede depender de la red. No usar CDNs ni llamadas a APIs externas.
- **Siempre mostrar la imagen del ejercicio:** la gente nueva no se sabe los nombres. Donde se elige o se hace un ejercicio (entreno, selector, rutinas, plan, lista), va `<MiniaturaEjercicio>`: el dibujo de inicio o, si no hay, la silueta con el músculo principal. En el entreno, cada tarjeta tiene "Cómo se hace", que abre `<GuiaEjercicio>` (dibujos, pasos y músculos) con `usePanel`, sin salir del entreno.
- **Textos largos:** los nombres de ejercicios y rutinas pueden ser largos. Usa `line-clamp-2` (o deja que hagan salto de línea) en vez de `truncate`, y no pongas varios botones al lado de un nombre.

## Idioma

- Todos los textos de la interfaz van en **español de Chile**: neutro, cercano y con tuteo ("Agrega tu primera rutina", "¿Terminaste?"). Evitar el voseo argentino y los modismos de España ("vale", "vosotros").
- Cuida los plurales con números: "1 serie" / "3 series", "1 entreno" / "2 entrenos".
- **Nombres en el código:** las entidades van en inglés, porque así se definió el esquema: tablas (`exercises`, `routines`, `workouts`, `sets`), tipos (`Exercise`, `Routine`, `Workout`, `WorkoutSet`), ids de relación (`exerciseId`, `routineId`, `workoutId`) y archivos de datos (`db/exercises.ts`, `hooks/useExercises.ts`). Los **campos** van en español (`nombre`, `grupoMuscular`, `seriesObjetivo`, `fechaInicio`, `peso`). Las funciones, variables y componentes de interfaz también van en español (`crearEjercicio`, `ListaEjercicios`). Lo técnico y genérico puede ir en inglés (`Layout`, `BottomNav`).
- Fechas y números con `Intl` y locale `es-CL` (funciones en `lib/formato.ts`).

## Modelo de datos (Dexie, `src/db/index.ts`)

Esquema actual: **v6**.

| Tabla | Campos | Índices |
| --- | --- | --- |
| `exercises` | id, nombre, grupoMuscular, equipo, instrucciones?, propio | nombre, grupoMuscular, equipo |
| `routines` | id, nombre, ejercicios: `{ exerciseId, seriesObjetivo, repsObjetivo, descansoSeg, pesoSugerido? }[]` (en orden) | nombre |
| `workouts` | id, routineId?, nombre, fechaInicio, fechaFin?, notas? | routineId, fechaInicio |
| `sets` | id, workoutId, exerciseId, numeroSerie, reps, peso (kg), completada | workoutId, exerciseId, [workoutId+exerciseId] |
| `ajustes` | id (`'general'`), unidad (`'kg'`/`'lb'`), descansoPorDefectoSeg | id |
| `perfil` | id (`'general'`), sexo, anioNacimiento, pesoKg, alturaCm, objetivo, zonas, experiencia, lugar, diasPorSemana, minutosPorSesion, lesiones, precaucion | id |
| `plan` | id (`'actual'`), division, rutinaIds (orden de la semana), creadoEn | id |

Historial de versiones: v1 eran tablas de prueba en español, que se eliminaron. La v2 crea las tablas actuales y carga el catálogo. La v3 no cambia tablas, solo carga las rutinas de ejemplo en bases que venían de la v2. La v4 agrega `ajustes`. La v6 agrega `perfil` y `plan` (evaluación inicial y plan generado). La v5 no cambia tablas: agrega a las bases existentes los ejercicios nuevos del catálogo, comparando nombres normalizados para no duplicar ejercicios propios. **Si agregas ejercicios al catálogo, crea una versión nueva con un upgrade igual**, porque `populate` solo corre en bases nuevas.

`Equipo`: barra, mancuernas, maquina, smith (Máquina Smith), polea, peso-corporal, kettlebell, banda, otro. Las etiquetas están en `lib/catalogos.ts`.

- **Pesos siempre en kg** en la base. La unidad del usuario solo afecta cómo se muestran e ingresan (ver Convenciones).
- `exercises.propio`: `false` en el catálogo y `true` en los que crea el usuario. **Solo los propios se pueden editar o eliminar**; `db/exercises.ts` lo valida. Un ejercicio en uso (en una rutina o en `sets`) no se puede eliminar.
- `workouts.nombre`: copia del nombre de la rutina al iniciar ("Entreno libre" si no hay rutina). Así el historial sobrevive aunque se borre la rutina.
- **Entreno en curso** = el workout sin `fechaFin`. Solo hay uno a la vez (`iniciarEntreno` devuelve el existente). Como todo se guarda al instante, cerrar la app no pierde nada y `/entrenar` lo retoma.
- **Orden de los ejercicios en un entreno:** sale del id de su primera serie (`agruparPorEjercicio`). Por eso un ejercicio siempre tiene al menos una serie; para sacarlo entero se usa `quitarEjercicio`.
- **Al finalizar** se borran las series sin marcar (`completada: false`).
- **Precarga:** las series nuevas toman peso y reps del último entreno terminado con ese ejercicio (`ultimasSeries`). Si no hay historial, usan el `pesoSugerido` de la rutina (o 0) y las reps objetivo.
- **Progresión (`debeSubir`):** si la última vez hiciste al menos las series objetivo y todas llegaron a las reps objetivo, el peso precargado sube: 2 kg en mancuernas y kettlebell, 2,5 kg en barra, máquina, Smith y polea, nada con el peso corporal. La tarjeta muestra "Última vez: …" y "↑ Completaste todo".
- **Reemplazar un ejercicio en el entreno (`reemplazarEjercicio`):** reutiliza las mismas filas de `sets` (cambia `exerciseId` y vuelve a precargar), así el ejercicio nuevo queda en la misma posición.
- **Récords:** se comparan contra entrenos terminados que empezaron antes. La primera vez que haces un ejercicio no cuenta como récord. 1RM estimado con Epley: `peso × (1 + reps / 30)`, y con 1 rep es el mismo peso (`lib/calculos.ts`).
- **Semanas** de lunes a domingo (`inicioSemana`). La racha semanal cuenta semanas seguidas con al menos un entreno; si esta semana todavía no entrenas, se cuenta desde la anterior.
- `routines.ejercicios` no tiene índice: Dexie no indexa propiedades dentro de arrays de objetos, así que se usa `.filter()`.
- **Datos iniciales:** 80 ejercicios en `db/ejerciciosBase.ts` (42 básicos + 38 de gimnasio: máquinas, poleas y Smith) y las rutinas Push, Pull y Legs en `db/rutinasBase.ts` (buscan los ejercicios por nombre). Se cargan desde `populate` cuando la base es nueva y desde los `upgrade()` de la v2, la v3 y la v5.
- **Respaldo** (`db/respaldo.ts`): JSON con `{ app: 'zanfit', formato, exportadoEn, datos: { exercises, routines, workouts, sets, ajustes } }`. Importar valida todo antes y después **reemplaza** todos los datos en una sola transacción; no los mezcla. Si cambias el esquema, revisa `crearRespaldo`, `leerRespaldo` y `restaurarRespaldo`, y sube `FORMATO` si cambia la forma del archivo.

## Evaluación y plan de entrenamiento

- **`/evaluacion?paso=N`:** 10 pantallas, una pregunta por pantalla. Cada paso es una entrada del historial, así que el botón atrás vuelve a la pregunta anterior; el estado vive en el componente. Si se entra directo a un paso, redirige al primero sin responder. Pregunta:
  - Sexo: **obligatorio, hombre o mujer**. Lo pidió el dueño del producto, porque las referencias de fuerza son distintas.
  - Edad, peso y altura.
  - Objetivo y zonas a mejorar.
  - Experiencia, lugar (gimnasio o casa), días por semana y minutos por sesión.
  - Lesiones (rodillas, espalda baja, hombros).
  - Salud: preguntas adaptadas del PAR-Q; la de embarazo solo aparece para mujeres. Cualquier "sí" activa `precaucion`.
- **Generador (`lib/plan.ts`, función pura, sin IA, offline):**
  - División según los días: 2 → cuerpo completo; 3 → cuerpo completo para principiantes, PPL para el resto; 4 → torso y pierna; 5 → PPL + torso + pierna; 6 → PPL ×2.
  - Cada tipo de día tiene "huecos" de patrones de movimiento en orden de prioridad (`huecos`). Las zonas a mejorar adelantan patrones (`refuerzos`).
  - Los ejercicios salen del catálogo según su clasificación en `db/patronesEjercicios.ts` (patrón, nivel técnico 1–3, zonas de riesgo). El filtro descarta lesiones, nivel 3 para principiantes o con precaución, y lo que no sea para la casa si entrena en casa. Se prefieren máquinas para principiantes y peso libre para avanzados, variando entre días.
  - Series, reps y descanso dependen del objetivo y de si el ejercicio es compuesto; se ajustan por experiencia, por edad ≥ 50 y por precaución.
  - Se corta por tiempo (minutos por sesión) y por un máximo de ejercicios (6, 7 u 8 según la experiencia).
  - `pesoSugerido` = peso corporal × factor según patrón y equipo, ajustado por sexo, experiencia, objetivo, precaución y edad, y redondeado según el equipo. Es un punto de partida y así se le explica al usuario.
- **Guardar (`db/plan.ts`, `guardarEvaluacion`):** guarda el perfil y crea una rutina normal por día ("Plan · Día A — Torso"). Si ya había un plan, borra sus rutinas; el historial se mantiene porque los entrenos guardan su propio nombre.
- **Qué día toca (`siguienteDiaDelPlan`):** el día siguiente al último entreno terminado con una rutina del plan.
- **Dónde aparece:**
  - `/plan`: perfil con IMC (solo como referencia), semana, recomendaciones, rehacer o eliminar el plan.
  - Entrenar: tarjeta "Hoy te toca", o una invitación a hacer la evaluación si no hay perfil.
  - Rutinas: etiqueta "Tu plan".
  - Ajustes: "Mi evaluación y plan".
- **Si agregas ejercicios al catálogo:** clasifícalos en `CLASIFICACION`. Si no, el generador no los usa.

## Estructura de carpetas

```
public/                  íconos (ZF), _redirects (Netlify) y medios/ (dibujos y diagramas de músculos de wger)
src/
  main.tsx               punto de entrada (BrowserRouter + StrictMode); pide almacenamiento persistente
  App.tsx                rutas + ProveedorAjustes + ProveedorDescanso
  index.css              Tailwind + tema (@theme) + utilidades propias (pt-safe, pb-safe, sin-scrollbar)
  components/            reutilizables: Layout, BottomNav, Marca, BotonVolver, BotonFlotante, ZonaEliminar,
                         SelectorOpciones, Stepper, SelectorEjercicios, DatosEntreno, NotasEntreno,
                         GraficoProgreso, DiagramaMusculos, DibujosEjercicio, MiniaturaEjercicio, GuiaEjercicio,
                         OpcionGrande, ProveedorAjustes, ProveedorDescanso
  contexts/              objetos de contexto (AjustesContext, DescansoContext); los proveedores están en components/
  pages/entrenar/        Entrenar (elige o retoma), ElegirEntreno, EntrenoActivo, TarjetaEjercicio, ResumenEntreno
  pages/rutinas/         ListaRutinas, DetalleRutina, NuevaRutina, EditarRutina, FormularioRutina, RutinaNoEncontrada
  pages/progreso/        Progreso (calendario + historial/récords), CalendarioEntrenos, DetalleEntreno, ProgresoEjercicio
  pages/ejercicios/      ListaEjercicios, DetalleEjercicio, NuevoEjercicio, EditarEjercicio, FormularioEjercicio, EjercicioNoEncontrado
  pages/ajustes/         Ajustes (unidad, descanso por defecto, respaldo), Creditos (licencias CC BY-SA)
  pages/evaluacion/      Evaluacion (cuestionario paso a paso), MiPlan (/plan)
  db/index.ts            instancia de Dexie, esquema, ajustes y carga de datos iniciales
  db/<tabla>.ts          escrituras y consultas: exercises.ts, routines.ts, workouts.ts
  db/progreso.ts         consultas de historial, récords, evolución y fechas entrenadas
  db/respaldo.ts         exportar, validar e importar el respaldo JSON
  db/ejerciciosBase.ts, db/rutinasBase.ts   datos iniciales
  db/mediosEjercicios.ts músculos y dibujos de cada ejercicio del catálogo
  db/patronesEjercicios.ts clasificación para el generador (patrón, nivel, riesgos)
  db/plan.ts             guardar la evaluación, rutinas del plan y qué día toca
  hooks/                 lectura con useLiveQuery (useExercises, useRoutines, useWorkouts…), useAjustes/useUnidad,
                         useDescanso, usePanel, useAhora
  lib/                   utilidades puras: texto.ts, catalogos.ts, formato.ts (Intl, unidades), calculos.ts (Epley,
                         volumen, semanas, rachas), sonido.ts (pitidos con Web Audio y vibración)
  types/index.ts         tipos del dominio
vercel.json, netlify.toml   despliegue (SPA + caché del service worker)
```

## Convenciones

- Componentes en PascalCase, un componente exportado por archivo, con `export default`. Los auxiliares chicos que solo se usan en ese archivo pueden quedarse ahí sin exportar.
- Imports relativos (no hay alias `@/`).
- Estilos solo con clases de Tailwind usando los tokens del tema (`bg-superficie`, `border-borde`, `text-texto-suave`, `text-lima`, `text-peligro`). No escribir colores hex sueltos en los componentes; si hace falta un color nuevo, se agrega a `@theme`. En Recharts usa `var(--color-…)`.
- Íconos: SVG inline con `stroke="currentColor"`, sin librerías de íconos.
- **Dexie:** leer con `useLiveQuery` y escribir con funciones de `db/<tabla>.ts`. En el esquema solo se indexan los campos por los que se consulta. **Nunca modificar una `db.version(n)` existente**: para cambiar el esquema, agrega `db.version(n + 1)` con su `upgrade()` si hace falta migrar datos.
- Hooks de lectura con `useLiveQuery`: devuelven `undefined` mientras cargan. Si buscas un registro por id, devuelve `null` cuando no existe, para poder distinguir "cargando" de "no encontrado".
- **Pesos en pantalla:** usa siempre `useUnidad()` (`u.peso(kg)`, `u.volumen(kg)`, `u.aUnidad`, `u.aKg`). Nunca muestres `kg` fijo. Los valores estimados (1RM) van con 1 decimal: `u.peso(x, 1)`.
- **Inputs que escriben en la base en cada tecla** (peso y reps del entreno, notas): el texto vive en estado local con valor inicial desde la base, y se guarda en cada cambio. Nunca leas el valor del input desde `useLiveQuery`, porque se pierden teclas. Si cambia la unidad, la fila se remonta (`key` incluye la unidad).
- **Stepper:** `onChange` recibe una función `(anterior) => nuevo`. Aplícala con un `setState` funcional para no perder toques rápidos.
- **Paneles a pantalla completa** (selector de ejercicios, hoja de finalizar): ábrelos con `usePanel(clave)`. Agrega una entrada al historial con `state`, así el botón atrás del teléfono los cierra sin desmontar la pantalla de abajo ni perder un formulario sin guardar.
- **Temporizador de descanso:** es global (`ProveedorDescanso` + `useDescanso`). Guarda la hora de término en `localStorage` y sigue corriendo al cambiar de tab o al recargar. `prepararAudio()` se llama dentro del toque del usuario (requisito de iOS y Chrome para poder sonar después).
- Búsquedas y comparaciones de nombres siempre con `normalizar()` de `lib/texto.ts` (ignora tildes y mayúsculas). Para ordenar, usa `compararNombres()`.
- Formularios de edición: el componente padre carga el registro y monta el formulario con `key={id}` y los valores iniciales como props. No sincronices el estado con `useEffect`.
- Acciones destructivas: usa `<ZonaEliminar>`, que pide la confirmación dentro de la pantalla (sin `window.confirm`), con "Cancelar" y "Sí, eliminar" en `bg-peligro`.
- Botones flotantes: usa `<BotonFlotante>`. La pantalla debe tener `pb-20` para que el botón no tape el último elemento.
- `html` tiene `scroll-padding` para que el scroll automático no deje elementos bajo el header ni bajo la barra inferior. Si algo aparece abajo de la pantalla (por ejemplo, una confirmación), desplázalo con `scrollIntoView({ block: 'nearest' })`.
- Rutas en minúscula y en español. Patrón: `/<tab>`, `/<tab>/nuevo` (o `/nueva`, según el género: `/rutinas/nueva`), `/<tab>/:id` (detalle) y `/<tab>/:id/editar`.
- Filtros, búsquedas y vistas de una lista van en la URL (`?q=&grupo=`, `?vista=records`, con `replace: true`) para que se mantengan al volver desde el detalle. El texto de un input se guarda en estado local y se copia a la URL.
- Después de crear algo, navega a su detalle con `replace: true`. Después de editar, usa `navigate(-1)`, o `replace` si se entró directo por URL (`location.key === 'default'`).
- Para elegir entre pocas opciones, usa `<SelectorOpciones>` (botones grandes) en vez de `<select>`. Para números chicos, usa `<Stepper>`.
- Gráficos: una serie por gráfico y un solo eje (peso y volumen van en gráficos separados), sin leyenda (el título de la sección la nombra), con tooltip y con una tabla de los mismos datos debajo.

## Estado actual

Las 4 tabs y Ajustes están completas:

- **Entrenar:** elegir una rutina o hacer un entreno libre. Cada ejercicio muestra sus series en filas peso | reps | listo, precargadas con la última vez. Al marcar una serie parte el descanso (barra flotante con +15s y Saltar; al terminar vibra y suena). Se pueden agregar o quitar series y ejercicios. Hay cronómetro total, y "Finalizar" muestra un resumen con duración, volumen, series y récords nuevos, más notas. El entreno se retoma si se cierra la app, y la tab Entrenar muestra un punto cuando hay uno en curso.
- **Rutinas:** listar, crear, editar (nombre, ejercicios desde la biblioteca, series, reps y descanso, reordenar con flechas), duplicar y eliminar.
- **Progreso:** racha semanal, esta semana, mejor racha y mapa de calor de las últimas 18 semanas. Historial por mes con detalle de cada entreno (series, récords, notas, eliminar). Récords por ejercicio (peso máximo y 1RM estimado) y, al tocar uno, gráficos de peso máximo y volumen por sesión con su tabla.
- **Ejercicios:** 80 en el catálogo (incluye máquinas, poleas y Smith). Lista agrupada con buscador y filtros; detalle con dibujos de inicio y final (en 64), diagrama de músculos, instrucciones, registro y enlace a su progreso; ejercicios propios.
- **Evaluación y plan:** cuestionario inicial y plan generado según sexo, edad, peso, altura, objetivo, zonas, experiencia, lugar, tiempo, lesiones y salud. En el entreno: peso sugerido, subida automática de peso, "Última vez" y cambiar ejercicio.
- **Ajustes:** unidad kg/lb, descanso por defecto, exportar o importar el respaldo JSON, y Créditos. En el teléfono, exportar usa la hoja de compartir; si no está disponible, descarga el archivo.

## Recursos gráficos de ejercicios

El detalle de cada ejercicio muestra dibujos de inicio y final (en 64 de los 80) y un diagrama de músculos de frente y espalda (en todos). Los datos están en `src/db/mediosEjercicios.ts` (se buscan por nombre del catálogo con `mediosDe()`) y los archivos en `public/medios/`. Todo entra en el precache, así que funciona offline.

- **Dibujos** (`public/medios/ejercicios/`):
  - `ek-<id>-inicio|final.svg`: de **Everkinetic** (repositorio `github.com/everkinetic/data`, carpeta `dist/svg`, licencia **CC BY-SA 4.0**). `<id>` es el id de 4 dígitos de `dist/exercises.json` (por ejemplo, `0127` = Leg Press). Se recolorearon invirtiendo la luminosidad: líneas a `#E5E5E5` y relleno a `#161616`, el color de la tarjeta, para que tapen las líneas de atrás. Después se optimizaron con svgo.
  - `wger-<id>-1|2.webp`: solo 2 ejercicios (Remo con barra y Press de hombros con mancuernas), que faltan en el repositorio original y vienen de la copia de Everkinetic en wger (CC BY-SA 3.0). Se muestran con `invert` (`invertir: true`).
  - **Faltan en Everkinetic** (no hay SVG ni PNG): jalón con barra ancha (0097), press inclinado en máquina (0084), butterfly (0047), press de hombros en máquina (0003), entre otros. Esos ejercicios solo tienen diagrama de músculos.
  - **El dibujo tiene que coincidir con las instrucciones.** Antes de asignarlo, míralo: el Press militar de wger era sentado y nuestras instrucciones dicen de pie, así que se quitó; "High Cable Curls" (0229) era acostado y se descartó.
- **Diagramas de músculos** (`public/medios/musculos/`): `frente.svg` y `espalda.svg` son las siluetas; `principal-N.svg` y `secundario-N.svg` son capas por músculo (N = id de músculo de wger, ver `MUSCULOS`). Origen: «Muscular system» de Termininja (Wikimedia Commons), adaptado por wger, **CC BY-SA 3.0**. Principal en lima al 100% y secundario al 40%. Ojo: los SVG de wger traían `opacity:.52` en ambos, por eso al principio se veían iguales. Las capas se apilan con `<img>` absolutos alineados arriba a la izquierda (`DiagramaMusculos`).
- **Músculos de cada ejercicio:** los asignamos nosotros, sin copiarlos de wger, cuyos datos de usuarios son irregulares. Los ejercicios propios usan los músculos típicos de su grupo (`POR_GRUPO`).
- **No usar otras imágenes de wger:** las fotos y renders 3D que suben los usuarios tienen licencias dudosas (una tenía marca de agua "© HOIST" y estaba etiquetada como CC BY-SA), y algunas son generadas con IA. La atribución no arregla una imagen con copyright.
- **Atribución obligatoria (CC BY-SA):** cada dibujo y diagrama lleva su crédito con enlace a `/ajustes/creditos`, donde se listan autores, licencias y cambios. Si agregas recursos, actualiza los créditos.
- **Para agregar un ejercicio con dibujo:**
  1. Búscalo en `everkinetic/data/dist/exercises.json`.
  2. Revisa el dibujo.
  3. Descarga `dist/svg/<id>-relaxation.svg` y `<id>-tension.svg`, recoloréalos igual y optimízalos con `svgo --multipass -p 1`.
  4. Agrégalo a `ejerciciosBase.ts` y a `CATALOGO`.
  5. Crea una versión de Dexie que lo agregue a las bases existentes.

## Íconos y PWA

- Íconos en `public/`: `icon-192.png`, `icon-512.png` (purpose `any`, "ZF" grande), `icon-maskable-512.png` (texto más chico, dentro de la zona segura del 80%), `apple-touch-icon.png` (180) y `favicon-64.png`.
- **Cómo regenerarlos:** se renderiza un HTML con Chrome headless a 512×512 (`--window-size=512,512 --screenshot`, con la fuente desde `node_modules/@fontsource-variable/space-grotesk`) y se reduce a los otros tamaños con `sips -z`. Chrome no permite ventanas de menos de unos 500px, así que nunca se renderiza directo a 192.
- `index.html` tiene los meta de iOS (`apple-mobile-web-app-capable`, título y `status-bar-style: black-translucent`).
- Chrome no reporta errores de instalabilidad (`Page.getInstallabilityErrors`), y con el build de producción todas las rutas cargan offline.

## Despliegue

- **Vercel:** `vercel.json` (Vite, `dist/`, todo a `index.html`, sin caché para `sw.js`, `index.html` y el manifest; `assets/` inmutable).
- **Netlify:** `netlify.toml` (lo mismo) y `public/_redirects`, que sirve si se publica arrastrando `dist/` a Netlify Drop.
- La PWA necesita HTTPS (los dos lo dan). Con `autoUpdate`, una versión nueva se activa la próxima vez que se abre la app.
