# ZANFIT

PWA para registrar entrenamientos de gimnasio. Todo se guarda localmente (IndexedDB); no hay backend. Los datos viven solo en el teléfono, así que el respaldo JSON (Ajustes) es la única copia de seguridad.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:5173 (el service worker también está activo en dev)
- `npm run build`: chequeo de tipos (`tsc -b`) y build de producción en `dist/`
- `npm test`: pruebas con Vitest (por ahora, el motor de rutinas)
- `npm run preview`: sirve `dist/` en http://localhost:4173 para probar instalación y modo offline (el offline real solo se prueba aquí, no en dev)

Antes de dar algo por terminado, corre `npm run build`, que también hace el chequeo de tipos.

## Stack

- React 19 + Vite 8 + TypeScript 7 (strict). Node >= 22.12
- Tailwind CSS v4 vía `@tailwindcss/vite`. **No hay `tailwind.config.js`**: el tema se define con `@theme` en `src/index.css`
- Dexie + `dexie-react-hooks` (`useLiveQuery`) para IndexedDB
- React Router (`react-router-dom`, `BrowserRouter`)
- `vite-plugin-pwa` (generateSW, `registerType: 'autoUpdate'`), configurado en `vite.config.ts`
- `react-body-highlighter` para el mapa muscular (ver "Recursos gráficos").
- Recharts para gráficos. Solo se usa en `ProgresoEjercicio`, que se carga con `React.lazy` para sacar unos 380 kB del bundle principal (igual queda en el precache offline)
- Fuentes self-hosted con `@fontsource-variable/*` (no usar Google Fonts: la app tiene que funcionar offline)

## Reglas de producto y diseño

- **Logo (`<Marca tamano={px} />`):** un cuadrado lima con "ZF" grande en negro y "ZANFIT" abajo en mayúsculas espaciadas (mismo estilo que el ícono de Alarma Comunitaria; pedido del dueño en octubre de 2026). Va grande en el ingreso y en las pantallas de aviso. En el encabezado va chico (30 px, solo "ZF") seguido de "ZANFIT" en texto espaciado.
- **Ícono de la app:** igual que el logo: "ZF" en Space Grotesk 700 y "ZANFIT" abajo (600, letter-spacing 0.2em), negro (`#0A0A0A`) sobre lima (`#C6FF3D`). Ver "Íconos" más abajo.
- **Mobile-first:** diseñar para 375px de ancho; el contenido está centrado con `max-w-lg` en pantallas grandes.
- **Modo oscuro por defecto** (y único por ahora). Fondo `#0A0A0A`.
- **Acento:** verde lima `#C6FF3D` (`text-lima`, `bg-lima`). Sobre fondo lima el texto va en `text-fondo` (negro), nunca en blanco.
- **Línea de diseño común (`~/proyectos/LINEA-DE-DISENO.md`):** ZANFIT sigue la misma línea minimalista de ESCENA y Alarma Comunitaria (pedido del dueño: nada "pomposo"). En el tema (`src/index.css`) la escala de texto es más chica que la de Tailwind (`text-lg` 17 px, `xl` 18, `2xl` 22, `3xl` 26, `4xl` 32) y `rounded-2xl` = 14 px, `rounded-3xl` = 22 px. Títulos de página `text-3xl`; nombres en tarjetas `text-lg`; secciones `text-xs` en mayúsculas. Tarjetas con `bg-superficie` **sin** borde (o borde sin fondo, nunca los dos). Botones principales `h-13` (52 px), secundarios e inputs `h-12` (48 px), texto de botones de 16 px; inputs de texto con `text-base` (16 px, evita el zoom de iPhone). **Fino y amigable:** pesos `font-semibold` (el `font-bold` queda para números), íconos con trazo de 2 (1.8 en la barra inferior). En selectores y pestañas, la opción activa va con un tinte suave (`bg-lima/10 text-lima`, o `bg-borde text-lima` en segmentos), no con un bloque lima entero. El lima sólido queda para el botón principal, las series hechas y los logros.
- **Pensar en manos sudadas:** todo lo que se toca mide al menos 44×44px (de preferencia 48px; acciones principales 52px), con buena separación. Sin gestos finos (no hay arrastrar para reordenar: se usan flechas). Inputs numéricos grandes con `inputMode="decimal"` o `"numeric"`.
- **Navegación inferior fija** con 4 tabs, en este orden: Entrenar, Rutinas, Progreso, Ejercicios. Ajustes se abre con el engranaje del encabezado (`/ajustes`), no es una tab.
- **Respetar safe areas** del iPhone: utilidades `pt-safe` y `pb-safe` definidas en `src/index.css`.
- **Offline primero:** nada puede depender de la red. No usar CDNs ni llamadas a APIs externas. Única excepción: el ajuste del plan con IA (`api/plan-ia`), que es opcional y siempre tiene el plan por reglas de respaldo.
- **Siempre mostrar la imagen del ejercicio:** prioridad en `<MiniaturaEjercicio>`: foto o video propio > foto del ejercicio > dibujo > silueta con el músculo. la gente nueva no se sabe los nombres. Donde se elige o se hace un ejercicio (entreno, selector, rutinas, plan, lista), va `<MiniaturaEjercicio>`: el dibujo de inicio o, si no hay, la silueta con el músculo principal. En el entreno, cada tarjeta tiene "Cómo se hace", que abre `<GuiaEjercicio>` (dibujos, pasos y músculos) con `usePanel`, sin salir del entreno.
- **Textos largos:** los nombres de ejercicios y rutinas pueden ser largos. Usa `line-clamp-2` (o deja que hagan salto de línea) en vez de `truncate`, y no pongas varios botones al lado de un nombre.

## Idioma

- Todos los textos de la interfaz van en **español de Chile**: neutro, cercano y con tuteo ("Agrega tu primera rutina", "¿Terminaste?"). Evitar el voseo argentino y los modismos de España ("vale", "vosotros").
- Cuida los plurales con números: "1 serie" / "3 series", "1 entreno" / "2 entrenos".
- **Nombres en el código:** las entidades van en inglés, porque así se definió el esquema: tablas (`exercises`, `routines`, `workouts`, `sets`), tipos (`Exercise`, `Routine`, `Workout`, `WorkoutSet`), ids de relación (`exerciseId`, `routineId`, `workoutId`) y archivos de datos (`db/exercises.ts`, `hooks/useExercises.ts`). Los **campos** van en español (`nombre`, `grupoMuscular`, `seriesObjetivo`, `fechaInicio`, `peso`). Las funciones, variables y componentes de interfaz también van en español (`crearEjercicio`, `ListaEjercicios`). Lo técnico y genérico puede ir en inglés (`Layout`, `BottomNav`).
- Fechas y números con `Intl` y locale `es-CL` (funciones en `lib/formato.ts`).

## Modelo de datos (Dexie, `src/db/index.ts`)

Esquema actual: **v9** (local, por usuario). En la nube, una sola tabla: `datos_usuario`.

| Tabla | Campos | Índices |
| --- | --- | --- |
| `exercises` | id, nombre, grupoMuscular, equipo, instrucciones?, propio | nombre, grupoMuscular, equipo |
| `routines` | id, nombre, ejercicios: `{ exerciseId, seriesObjetivo, repsObjetivo, descansoSeg, pesoSugerido?, nota? }[]` (en orden); en las del plan además `foco?`, `nota?` y `calentamiento?: { exerciseId, segundos }[]` | nombre |
| `workouts` | id, routineId?, nombre, fechaInicio, fechaFin?, notas? | routineId, fechaInicio |
| `sets` | id, workoutId, exerciseId, numeroSerie, reps, peso (kg), completada; en el cardio además `minutos?`, `velocidad?` (km/h), `inclinacion?` (%), `nivel?` | workoutId, exerciseId, [workoutId+exerciseId] |
| `ajustes` | id (`'general'`), unidad (`'kg'`/`'lb'`), descansoPorDefectoSeg | id |
| `perfil` | id (`'general'`), sexo, anioNacimiento, pesoKg, alturaCm, objetivo, zonas, experiencia, lugar, equipamiento?, diasPorSemana, minutosPorSesion, lesiones, precaucion, salud? | id |
| `plan` | id (`'actual'`), division, rutinaIds (orden de la semana), creadoEn | id |
| `medios` | id, exerciseId, tipo (`'foto'`/`'video'`), archivo (Blob), miniatura (Blob JPEG), creadoEn | exerciseId |

Historial de versiones: v1 eran tablas de prueba en español, que se eliminaron. La v2 crea las tablas actuales y carga el catálogo. La v3 no cambia tablas, solo carga las rutinas de ejemplo en bases que venían de la v2. La v4 agrega `ajustes`. La v8 no cambia tablas: saca del catálogo los ejercicios sin ninguna imagen libre (`RETIRADOS_DEL_CATALOGO`, hoy solo Pallof press), salvo que el usuario ya los use en una rutina o en su historial. La v7 agrega `medios` (fotos y videos propios). La v6 agrega `perfil` y `plan` (evaluación inicial y plan generado). La v5 no cambia tablas: agrega a las bases existentes los ejercicios nuevos del catálogo, comparando nombres normalizados para no duplicar ejercicios propios. La v9 hace lo mismo con el catálogo ampliado (`EJERCICIOS_EXTRA`); ambas usan `sumarAlCatalogo`. **Si agregas ejercicios al catálogo, crea una versión nueva con un upgrade igual**, porque `populate` solo corre en bases nuevas.

`Equipo`: barra, mancuernas, maquina, smith (Máquina Smith), polea, peso-corporal, kettlebell, banda, balon-medicinal, fitball, rodillo (de espuma), otro. `GrupoMuscular`: pecho, espalda, piernas, hombros, biceps, triceps, antebrazos, core. Las etiquetas están en `lib/catalogos.ts`.

- **Pesos siempre en kg** en la base. La unidad del usuario solo afecta cómo se muestran e ingresan (ver Convenciones).
- `exercises.propio`: `false` en el catálogo y `true` en los que crea el usuario. **Solo los propios se pueden editar o eliminar**; `db/exercises.ts` lo valida. Un ejercicio en uso (en una rutina o en `sets`) no se puede eliminar.
- `workouts.nombre`: copia del nombre de la rutina al iniciar ("Entreno libre" si no hay rutina). Así el historial sobrevive aunque se borre la rutina.
- **Entreno en curso** = el workout sin `fechaFin`. Solo hay uno a la vez (`iniciarEntreno` devuelve el existente). Como todo se guarda al instante, cerrar la app no pierde nada y `/entrenar` lo retoma.
- **Orden de los ejercicios en un entreno:** sale del id de su primera serie (`agruparPorEjercicio`). Por eso un ejercicio siempre tiene al menos una serie; para sacarlo entero se usa `quitarEjercicio`.
- **Al finalizar** se borran las series sin marcar (`completada: false`).
- **Precarga:** las series nuevas toman peso y reps del último entreno terminado con ese ejercicio (`ultimasSeries`). Si no hay historial, usan el `pesoSugerido` de la rutina (o 0) y las reps objetivo.
- **Progresión (`debeSubir`, `sesionesAnteriores`):** si en **las dos últimas sesiones** con el ejercicio hiciste al menos las series objetivo, todas llegaron a las reps objetivo y con el mismo peso (`completoTodo`), el peso precargado sube: 2 kg en mancuernas y kettlebell, 2,5 kg en barra, máquina, Smith y polea, nada con el peso corporal, bandas y balones. La tarjeta muestra "Última vez: …", "↑ Completaste todo dos veces seguidas" o, con una sola sesión completa, que la próxima sube.
- **Entreno "uno a la vez" (por defecto) o "Todos":** la preferencia queda en `localStorage` (`zanfit:modoEntreno`). En "uno a la vez" se parte en el primer ejercicio con series pendientes y se queda ahí hasta tocar "Siguiente" (que se destaca al completar sus series); en el último, el botón es "Finalizar". Si la rutina es del plan, arriba va el calentamiento (`CalentamientoEntreno`), que se marca y se cierra con "Listo, a entrenar" (recordado en `sessionStorage` por entreno).
- **Cambiar ejercicio (`CambiarEjercicio`):** botón "Cambiar" sobre la foto de cada tarjeta (máquina ocupada, no le acomoda…). Muestra solo los que de verdad lo reemplazan (`alternativas` en `lib/plan.ts`: mismo patrón de movimiento o, sin clasificar, mismo tipo y músculo principal; con el equipo del perfil, sin sus lesiones y sin los de nivel 3 para principiantes o con precaución), agrupados por equipo (primero el mismo, hasta 5 por equipo), y abajo "Buscar en todos los ejercicios". Pruebas en `plan.test.ts`. El mismo panel (`components/CambiarEjercicio.tsx`) está en las rutinas y en /plan: "Cambiar" en cada ejercicio (`<BotonCambiarEjercicio>`, guarda al tiro con `reemplazarEnRutina`) y "Cambiar por otro" al editar. En la rutina se mantienen series, reps y descanso, se quita la nota del anterior y el peso sugerido se recalcula (`reemplazoEnRutina`).
- **Reemplazar un ejercicio en el entreno (`reemplazarEjercicio`):** reutiliza las mismas filas de `sets` (cambia `exerciseId` y vuelve a precargar), así el ejercicio nuevo queda en la misma posición.
- **Cardio (`lib/cardio.ts`):** los ejercicios de categoría cardio (y los propios con nombre de trotadora, bicicleta, elíptica…) no piden kilos ni reps: cada fila es un **tramo** con minutos y, según la máquina, velocidad e inclinación (trotadora, caminata, trote) o nivel (bicicleta, elíptica, escaladora, remo). Peso y reps quedan en 0, así que no suman volumen ni récords (y no salen en Récords). Al marcar un tramo no parte el descanso. Se precargan de la última vez; sin historial, 1 tramo de 20 min. En las rutinas, las "reps" de un ejercicio de cardio son minutos ("Tramos" y "Minutos" en el formulario; "20 min" en el detalle y en /plan), y al cambiar entre cardio y fuerza se parte con los valores por defecto. Calorías: los tramos con minutos se calculan aparte con su tiempo real y, en la trotadora, con las ecuaciones del ACSM según velocidad e inclinación (`metTrotadora`). Se agregó sin versión nueva de Dexie (los campos no se indexan).
- **Récords:** se comparan contra entrenos terminados que empezaron antes. La primera vez que haces un ejercicio no cuenta como récord. 1RM estimado con Epley: `peso × (1 + reps / 30)`, y con 1 rep es el mismo peso (`lib/calculos.ts`).
- **Semanas** de lunes a domingo (`inicioSemana`). La racha semanal cuenta semanas seguidas con al menos un entreno; si esta semana todavía no entrenas, se cuenta desde la anterior.
- `routines.ejercicios` no tiene índice: Dexie no indexa propiedades dentro de arrays de objetos, así que se usa `.filter()`.
- **Datos iniciales:** 873 ejercicios: los 79 "básicos" de `db/ejerciciosBase.ts` (escritos a mano; salen primero en las listas) y 794 de `db/ejerciciosExtra.ts` (generado desde free-exercise-db, con nombres e instrucciones traducidos y resumidos). Más las rutinas Push, Pull y Legs en `db/rutinasBase.ts` (buscan los ejercicios por nombre). Se cargan desde `populate` cuando la base es nueva y desde los `upgrade()` de la v2, la v3, la v5 y la v9.
- **Respaldo** (`db/respaldo.ts`): JSON con `{ app: 'zanfit', formato, exportadoEn, datos: { exercises, routines, workouts, sets, ajustes } }`. Importar valida todo antes y después **reemplaza** todos los datos en una sola transacción; no los mezcla. Si cambias el esquema, revisa `crearRespaldo`, `leerRespaldo` y `restaurarRespaldo`, y sube `FORMATO` si cambia la forma del archivo.

## Evaluación y plan de entrenamiento

- **Obligatoria al entrar:** quien no tiene perfil (cuenta nueva o que nunca se evaluó) parte directo en `/evaluacion`, sin barra inferior (`Layout`); solo puede abrir además Ajustes y `/admin`. Se espera una sincronización que funcione (no basta con estar sin señal) para no mandar ahí a quien ya tiene su evaluación en la nube.
- **`/evaluacion?paso=N`:** una pregunta por pantalla, con barra de progreso. Cada paso es una entrada del historial, así que el botón atrás vuelve a la pregunta anterior; el estado vive en el componente. Si se entra directo a un paso, redirige al primero sin responder. Los pasos salen de `pasosPara(lugar)` (`lib/evaluacion.ts`). Pregunta:
  - Inicio con el aviso de que no reemplaza a un profesional (`AVISO_SALUD`, `<AvisoSalud>`; también aparece en /plan).
  - Sexo: **obligatorio, hombre o mujer** (la guía de rediseño lo pedía opcional, pero el dueño del producto lo quiere obligatorio: las referencias de fuerza son distintas). Edad, peso y altura también son obligatorios.
  - Objetivo (músculo, grasa, fuerza, resistencia, salud general; `condicion` = "Salud general", se mantuvo el valor para no migrar perfiles) y zonas a mejorar.
  - Experiencia, lugar (gimnasio, casa, aire libre) y, si no es gimnasio, **qué equipo tiene** (`equipamiento`: mancuernas, kettlebell, bandas, barra de dominadas o paralelas, barra con discos, fitball, balón medicinal; sin nada = solo peso corporal). Perfiles antiguos de "casa" sin esta respuesta usan `EQUIPAMIENTO_POR_DEFECTO`.
  - Días por semana (2–6) y minutos por sesión (30, 45, 60, 90).
  - Lesiones (rodillas, espalda baja, hombros, muñecas).
  - Salud: preguntas adaptadas del PAR-Q; la de embarazo solo aparece para mujeres. Cualquier "sí" activa `precaucion`; cada respuesta queda en `salud`.
- **Editar una respuesta:** /plan → "Tus respuestas" → "Cambiar" abre `/evaluacion?paso=N&editar=1`: solo esa pregunta, con lo guardado, y "Guardar y actualizar el plan" regenera el plan. Si cambia de gimnasio a casa o aire libre, antes pasa por la pregunta del equipo.
- **Motor por reglas (`lib/plan.ts`, función pura, sin IA, offline; pruebas en `lib/plan.test.ts`, `npm test`):**
  - División: 2–3 días → cuerpo completo; 4 → torso y pierna; 5 → empuje/tirón/pierna + torso + pierna; 6 → empuje/tirón/pierna ×2. En las divisiones por grupos, dos días seguidos no repiten el grupo principal (`GRUPOS_TIPO`).
  - Cada tipo de día tiene "huecos" de patrones de movimiento en orden de prioridad (`huecos`). Las zonas a mejorar adelantan patrones (`refuerzos`). Al final se ordena: compuestos primero, aislamiento al final.
  - Clasificación (`lib/clasificacion.ts`): los 79 básicos a mano en `db/patronesEjercicios.ts` (patrón, nivel técnico 1–3, zonas de riesgo); el resto del catálogo, con reglas sobre su ficha (músculo principal, mecánica, empuje/tirón y palabras del id en inglés). Estiramientos, cardio, pliometría, halterofilia, strongman, isométricos y equipo "otro" no entran. Se prefieren los básicos.
  - Filtros: lesiones (`riesgos`), equipo disponible (`tieneEquipo`: fuera del gimnasio nada de máquinas, poleas ni aparatos; `necesitaBarras` para dominadas y fondos), y nivel 3 fuera para principiantes o con precaución.
  - Series, reps y descanso (`TABLA`): músculo 3–4 × 8–12, 60–90 s; fuerza 4–5 × 3–6, 2–3 min; grasa y resistencia 2–3 × 12–20, 30–60 s; salud general 2–3 × 10–12. Solo los dos primeros compuestos del día van con la prescripción "principal"; el resto, como accesorios. Ajustes por experiencia, edad ≥ 50 y precaución; core y pantorrillas con más reps y menos descanso.
  - Se corta por tiempo (calentamiento + `minutosDe` de cada ejercicio, contra los minutos por sesión) y por un máximo de 6, 7 u 8 ejercicios según la experiencia.
  - Calentamiento por día: 5 min de elíptica o bicicleta en el gimnasio (2 min de skipping fuera; nada de saltos con lesión de rodilla) + 3 movimientos de movilidad del tren que se va a trabajar.
  - `pesoSugerido` = peso corporal × factor según patrón y equipo, ajustado por sexo, experiencia, objetivo, precaución, edad y si es a una mano o pierna; redondeado según el equipo. Es un punto de partida y así se le explica al usuario.
- **IA (Gemini, Etapa 4):** el motor arma el plan y `pedidoIa` prepara, por día, los candidatos ya filtrados por las reglas (los del plan + hasta 5 por patrón) y los rangos de series/reps/descanso del objetivo (`rangosPara`). `api/plan-ia.ts` (función de Vercel) le pide a Gemini que elija y ordene **solo entre esos ids**, en JSON (`ESQUEMA_RESPUESTA`), y valida con `validarRespuesta` (`lib/planIa.ts`, compartido por app y servidor): ids fuera de los candidatos, repetidos o formato distinto se rechazan; los números fuera de rango se ajustan. Si falla, reintenta una vez. `aplicarIa` usa sus ejercicios, notas del día y de cada ejercicio, con el peso sugerido de las reglas y compuestos primero.
  - **Respaldo:** sin internet, sin sesión, límite (429), respuesta inválida dos veces o sin clave: queda el plan por reglas (`plan.origen = 'reglas'`, `motivoSinIa`), y /plan ofrece "Ajustar con IA". Timeout de 25 s.
  - **Seguridad y privacidad:** la clave va solo en la variable `GEMINI_API_KEY` (Vercel → Settings → Environment Variables; en local, `.env`, ignorado por git; ver `.env.example`). Nunca en el código ni con prefijo `VITE_`. La función solo atiende a usuarios con sesión de Supabase (verifica el token). Se envía solo objetivo, experiencia, lugar, equipo, días, minutos, zonas, lesiones y si hay alerta de salud (sí/no): nada de nombre, correo, peso, edad ni respuestas de salud. En el plan gratuito, Google puede usar lo enviado.
  - **Modelos:** `GEMINI_MODEL` acepta una lista en orden de preferencia; por defecto `gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash`. En las pruebas de octubre de 2026 con la clave gratuita, los Flash normales (3.6, 3.7, 3.8) respondían casi siempre 503 por demanda y `gemini-2.5-flash` ya no existía (404); los lite respondían en ~4 s con buena calidad. Si un modelo da 404, 408, 500, 503 o 504 (o tarda más de 15 s), se prueba el siguiente; 429 también pasa al siguiente y, si ninguno sirve, se responde 429. `vercel.json` le da 60 s a la función; la app espera hasta 50 s. Prueba real (gasta cuota): `GEMINI_API_KEY=$(cat ~/.zanfit-gemini) npx vitest run src/lib/planIa.real.test.ts --silent=false --reporter=verbose`. En `npm run dev`, el plugin `apiLocal` de `vite.config.ts` atiende `/api/plan-ia` con el mismo código. `vercel.json` excluye `/api/` del rewrite a `index.html` y el service worker no la intercepta. En Netlify la función no existe: siempre queda el plan por reglas.
- **Guardar (`db/plan.ts`, `guardarEvaluacion`):** guarda el perfil y crea una rutina normal por día ("Plan · Día A — Torso"), con `foco` y `calentamiento` (la rutina los muestra arriba de los ejercicios). Si ya había un plan, borra sus rutinas; el historial se mantiene porque los entrenos guardan su propio nombre.
- **Qué día toca (`siguienteDiaDelPlan`):** el día siguiente al último entreno terminado con una rutina del plan.
- **Dónde aparece:**
  - `/plan`: perfil con IMC (solo como referencia), semana, recomendaciones, rehacer o eliminar el plan.
  - Entrenar: tarjeta "Hoy te toca", o una invitación a hacer la evaluación si no hay perfil.
  - Rutinas: etiqueta "Tu plan".
  - Ajustes: "Mi evaluación y plan".
- **Si agregas ejercicios básicos al catálogo:** clasifícalos en `CLASIFICACION`. Los del catálogo ampliado se clasifican solos; revisa con `IMPRIMIR=1 npx vitest run src/lib/plan.test.ts`, que imprime los planes de 3 perfiles de prueba.

## Cuentas y sincronización (Supabase)

- **Proyecto:** `pjjjfonkccmhrswujysy`. URL y clave `anon` en `src/lib/supabase.ts`; son públicas por diseño y se pueden sobrescribir con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. **Nunca poner la `service_role` en el código.**
- **Tabla:** `public.datos_usuario` (`supabase/esquema.sql`), con una fila por usuario: `datos` (jsonb con el mismo formato del respaldo JSON) y `actualizado_en`. RLS: cada usuario solo ve y modifica su fila. Si la tabla no existe, la app muestra "Falta crear la tabla en Supabase".
- **Ingreso:** correo y **PIN de 6 números** elegido por el usuario (crear cuenta exige además un código de acceso, ver abajo) (es la contraseña de Supabase), más nombre en `user_metadata.nombre`. **La cuenta es obligatoria**: sin sesión, `<ConSesion>` lleva a `/cuenta` (pantalla de acceso a pantalla completa, fuera del `Layout`) y después vuelve a la pantalla pedida. "Crear cuenta" se compacta (`<Pantalla compacto>`, los dos PIN lado a lado) para caber en la pantalla igual que Ingresar. Hay un bloqueo local de 1 minuto tras 5 intentos fallidos, además del límite de Supabase. "Confirm email" debe estar **apagado** en Supabase: el correo gratis está muy limitado. Todavía no hay recuperación de PIN.
- **Acceso pagado (prueba gratis + suscripción por transferencia; `supabase/acceso.sql` y `supabase/acceso-v2.sql`):** el registro público está **cerrado** en Supabase ("Allow new users to sign up" apagado): las cuentas solo las crea `api/registro.ts` (función de Vercel con `SUPABASE_SERVICE_ROLE_KEY`, solo en variables de entorno).
  - **Sin código** (lo normal): la cuenta parte en `prueba` por `ajustes_venta.dias_prueba` días (7). **Con código** (opcional, para regalar; "Tengo un código" en Crear cuenta o link `/cuenta?modo=registro&codigo=…`): `ZF-XXXX-XXXX` de un solo uso (`lib/codigos.ts`; también se aceptan personalizados de 4–30 caracteres), de prueba o de compra (`activa`).
  - Al vencer la prueba o el período pagado (`activa_hasta`; vacío = sin vencimiento), `<ConAcceso>` (dentro de `<ConSesion>`) muestra `<PantallaBloqueo>`: precio, qué incluye, datos de transferencia, botón verde **"Escríbeme por WhatsApp"** (`wa.me/<contacto>` con un mensaje que trae su correo) y "Ya pagué: revisar de nuevo". Los datos no se pierden.
  - El estado se consulta al abrir, al volver a la app y cada 6 h, y se guarda en `localStorage` (`zanfit:acceso:<uid>`) para funcionar sin internet; si nunca se pudo consultar, deja pasar. Si las tablas no existen, no se bloquea a nadie.
  - **Seguridad real en la nube:** RLS de `datos_usuario` solo deja guardar con `puede_usar()` (activa sin vencer o prueba vigente); `cuentas`, `codigos` y `ajustes_venta` solo los modifica un admin (`es_admin()`, tabla `admins`).
  - **Administración (`/admin`, solo admins; enlace en Ajustes):** **Pendientes de activación** (`esperaPago`: prueba o período vencido), En prueba, Activas y Pausadas. "Activar…" pide el período pagado (`PERIODOS`: 1, 3, 6 meses, 1 año o sin vencimiento; `activarPor` suma desde el vencimiento actual si renueva antes), "+7 días de prueba" y "Pausar". Además: regalar acceso con códigos y editar los datos de venta (precio, transferencia, WhatsApp, días de prueba). En Entrenar, quien está en prueba ve "te quedan N días".
- **Aporte voluntario (`supabase/aporte-voluntario.sql`, desde octubre de 2026):** se regalaron 3 meses a todas las cuentas (y `dias_prueba` = 90 para las nuevas), y con `ajustes_venta.aporte_voluntario = true` **nadie se bloquea por fecha**, solo las cuentas pausadas: `puede_usar()` en la nube y `puedeUsar()` en la app (`Acceso.voluntario`, que `revisarAcceso` lee de `ajustes_venta`). En Entrenar aparece `<TarjetaAporte>` ("ZANFIT es gratis · Apoyar", la ✕ la oculta 30 días) y en Ajustes "Apoyar ZANFIT con un aporte". Las dos abren `<HojaAporte>`, **sin monto sugerido** (cada uno aporta lo que quiera; el campo `precio` solo se usa si se vuelve a cobrar), con los datos para transferir ("Copiar datos") y "Avisar mi aporte por WhatsApp". No se muestra "te quedan N días". En Administración, el interruptor "Aporte voluntario" lo apaga y vuelve el cobro con prueba; con el modo encendido no hay "Pendientes de activación".
- **Un teléfono a la vez (`supabase/dispositivo.sql`, `lib/dispositivo.ts`):** cada teléfono (o navegador) tiene un id en `localStorage` (`zanfit:dispositivo`) que la app manda en el encabezado `x-dispositivo` a Supabase (`global.headers` en `lib/supabase.ts`). Al ingresar (y al tocar "Usar aquí") se llama `usar_este_dispositivo`, que deja ese id en `cuentas.dispositivo_id` y suma `cambios_dispositivo` si cambió. Si `revisarAcceso` ve otro id, `<ConAcceso>` muestra `<PantallaOtroDispositivo>` ("Tu cuenta se abrió en otro teléfono" + "Usar aquí"). En la nube, `puede_usar()` exige que el encabezado coincida (cuentas sin id asignado: el primer teléfono que revisa la toma). Administración muestra los cambios de teléfono (5 o más: probablemente compartida). En iPhone, Safari y la app del ícono cuentan como dos teléfonos.
- **Entrar sin internet:** con una sesión guardada se entra al tiro, leyendo el usuario desde `localStorage` (`usuarioGuardado`), sin esperar a Supabase. Solo se cierra la sesión si Supabase responde que ya no es válida, nunca por falta de señal.
- **Una base local por persona:** sin sesión, `zanfit` (solo para la pantalla de acceso y los datos antiguos sin cuenta); con cuenta, `zanfit-u-<id>`. `db` es un `let` exportado y `usarBase()` lo cambia. `ProveedorCuenta` vuelve a montar toda la app (`<Fragment key={base}>`) para que nada siga leyendo la base anterior. Al cerrar sesión se vuelve a `zanfit`.
- **Sincronización (`db/nube.ts`):** se sube la copia completa (`crearRespaldo`) y gana lo más reciente.
  - Los hooks de Dexie anotan en `localStorage` (`zanfit:cambio:<base>`) que hay cambios por subir, salvo durante `populate` y al restaurar desde la nube (`sinAnotarCambios`).
  - Se sincroniza 4 s después de cada cambio, al volver la conexión, al ocultar la app con cambios pendientes y al iniciar sesión.
  - Si la nube es más nueva que lo último conocido y aquí no hay cambios más nuevos, se baja; si no, se sube. **Un teléfono que nunca bajó la copia de la nube** (recién instalado, otra dirección) **siempre baja primero**, aunque tenga cambios locales: así una base nueva nunca pisa los datos de la cuenta.
  - La evaluación obligatoria (`Layout`) solo se exige después de una sincronización que funcionó (`ultimaSync`), nunca por falta de señal o un error: la evaluación puede estar en la nube.
  - Las **fotos y videos propios no se sincronizan** (se comparten con el archivo de Ajustes).
- **El catálogo se completa solo (`completarCatalogo`):** una copia de la nube o un respaldo hechos con una versión anterior traen menos ejercicios, y restaurarlos reemplaza la tabla `exercises`. Por eso, después de cada `restaurarRespaldo` y al abrir la base (`on('ready')`) se agregan los del catálogo que falten, sin anotarlo como cambio local (para no pisar la nube). Pasó de verdad al publicar el catálogo de 873: el teléfono bajaba la copia vieja y quedaba con 79.
- **Primer ingreso:** si la nube está vacía y hay datos sin cuenta en el teléfono (de antes de que la cuenta fuera obligatoria), se pregunta si guardarlos en la cuenta (`copiarInvitadoAUsuario`, que copia también las fotos y videos) o empezar de cero.
- **Supabase se carga bajo demanda (`lib/clienteNube.ts`):** son unos 215 kB en un chunk aparte. Sin sesión guardada nunca se descarga.
- **Foto de perfil:** `ajustes.fotoPerfil`, un JPEG cuadrado de hasta 720 px como data URL (~60–90 kB). Antes de guardarla se **encuadra** (`<EncuadrarFoto>`): arrastrar para mover, pellizcar o usar la barra para el zoom (1–4×), con guías de la franja del banner de Entrenar (`object-[center_30%]`, 37% del alto) y del círculo del encabezado. "Encuadrar foto" en Ajustes vuelve a abrirlo con la foto guardada. Viaja con la sincronización y se muestra en el encabezado (`<Avatar>`) y como **banner** (`<BannerPerfil>`): en Entrenar, con "Hola, …" y el último entreno (lleva a Ajustes); en Ajustes, con el nombre, el correo, el nivel y "Cambiar foto" / "Quitar foto". Sin foto, un degradado lima con la inicial.
- **Pruebas:** el login se prueba con un Supabase **simulado** (Puppeteer intercepta `*.supabase.co`). No crear cuentas de prueba en el proyecto real.

## Motivación

- **Meta semanal (`<MetaSemanal>` en Entrenar):** muestra los entrenos de esta semana (lunes a domingo) contra la meta. La meta sale de los días por semana de la evaluación; si no hay evaluación, de los días del plan; si tampoco, es 3. Incluye la racha de semanas (con fuego animado), un mensaje según el avance (`mensajeSemana`) y las kcal estimadas de la semana.
- **Niveles y puntos (`lib/juego.ts`, `calcularJuego`, `<TarjetaNivel>`):** 8 niveles de animales fuertes, de menor a mayor: Hormiga (0), Zorro (100), Lobo (250), Toro (500), Oso (900), Gorila (1.500), León (2.500) y Dragón (4.000). Puntos por entreno terminado: 10 por terminarlo + 1 por serie completada (máx. 30) + 15 si era un día del plan + 10 si completó todas las series de su rutina (`diaCumplido`) + 10 por récord. Como los logros, **no se guardan**: se calculan del historial. En Entrenar va la tarjeta del nivel (animal animado, puntos que suben, barra que se llena); en Progreso → Logros, la galería de niveles.
- **Logros (`lib/logros.ts`, `calcularLogros`):** 22 medallas en 6 categorías: entrenos (1, 5, 10, 25, 50, 100), racha de semanas (2, 4, 8, 12), récords (1, 10, 50), toneladas levantadas (10, 50, 100, 500), semanas con el plan completo (1, 4; solo si hay plan) y días cumplidos (1, 10, 30). **No se guardan:** se calculan recorriendo el historial en orden. Los récords se cuentan con `recordsPorEntreno`, igual que `recordsDelEntreno`: la primera vez que haces un ejercicio no cuenta.
- **Calorías (`lib/calorias.ts`):** método MET (Compendium of Physical Activities): kcal = MET × peso × horas. MET por ejercicio (`metDe`): pesas 3,5, compuestos 5, calistenia 3,8–4,5, estiramientos 2,3, pliometría 8, cardio según la máquina. Un entreno usa su duración real (entre 5 min y 3 h) y el MET promedio ponderado por series; una rutina, su duración estimada. Peso de la evaluación (sin evaluación, 70 kg). Siempre se muestran como aproximadas.
- **Al terminar un entreno (`ResumenEntreno`):** confeti (`<Confeti>`), puntos y kcal que suben (`useContador`) con el detalle de los puntos, celebración si subió de nivel, la equivalencia del peso total, los logros nuevos y **"Compartir en redes"**.
- **Compartir (`lib/imagenCompartir.ts`, `<BotonCompartir>`):** arma con canvas una imagen de historia (1080×1920) con el animal del nivel y los datos, y abre la hoja de compartir del teléfono (Instagram, Facebook, WhatsApp…); en el computador la descarga. En iPhone `navigator.share` tiene que llamarse en el mismo toque, por eso la imagen se arma **antes** (al mostrar el botón).
- **Animaciones (`index.css`):** `animate-entrar` (pantallas, con `key={pathname}` en `Layout`, y listas escalonadas con `animation-delay`), `animate-pop` (series marcadas, ícono activo de la barra), `animate-flotar`, `animate-caer` (confeti), `animate-brillo`, y botones que se achican al tocarlos. Todo respeta `prefers-reduced-motion`. **Las animaciones de entrada usan fill-mode `backwards`, nunca `forwards`**: un `transform` que queda puesto descoloca los elementos `fixed` de adentro (paneles, botón flotante).
- **Animales (`public/medios/animales/`):** emojis animados de Google (Noto Emoji Animation, CC BY 4.0, crédito en Créditos), WebP de 512 px descargados de `fonts.gstatic.com/s/e/notoemoji/latest/<codepoint>/512.webp`, más `<nombre>-quieto.webp` de 160 px (un cuadro, sacado con canvas; el del dragón con `ImageDecoder` porque su primer cuadro está vacío). Los animados no van al precache: se guardan la primera vez que se ven.

## Estructura de carpetas

```
public/                  íconos (ZF), _redirects (Netlify) y medios/ (fotos de ejercicios y videos del login)
src/
  main.tsx               punto de entrada (BrowserRouter + StrictMode); pide almacenamiento persistente
  App.tsx                rutas + ProveedorAjustes + ProveedorDescanso
  index.css              Tailwind + tema (@theme) + utilidades propias (pt-safe, pb-safe, sin-scrollbar)
  components/            reutilizables: Layout, BottomNav, Marca, BotonVolver, BotonFlotante, ZonaEliminar,
                         SelectorOpciones, Stepper, SelectorEjercicios, DatosEntreno, NotasEntreno,
                         GraficoProgreso, DiagramaMusculos, CuerpoMusculos, MiniaturaEjercicio, GuiaEjercicio,
                         OpcionGrande, ProveedorAjustes, ProveedorDescanso
  contexts/              objetos de contexto (AjustesContext, DescansoContext); los proveedores están en components/
  pages/entrenar/        Entrenar (elige o retoma), ElegirEntreno, EntrenoActivo, TarjetaEjercicio, ResumenEntreno
  pages/rutinas/         ListaRutinas, DetalleRutina, NuevaRutina, EditarRutina, FormularioRutina, RutinaNoEncontrada
  pages/progreso/        Progreso (calendario + historial/récords), CalendarioEntrenos, DetalleEntreno, ProgresoEjercicio
  pages/ejercicios/      ListaEjercicios, DetalleEjercicio, NuevoEjercicio, EditarEjercicio, FormularioEjercicio, EjercicioNoEncontrado
  pages/ajustes/         Ajustes (unidad, descanso por defecto, respaldo), Creditos (fuentes y licencias), Privacidad (qué datos se guardan y qué se envía a la IA)
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
- **Ejercicios:** 873 en el catálogo (gimnasio, casa, aire libre, bandas, kettlebell, estiramientos, pliometría, cardio, halterofilia…). Lista agrupada con buscador y filtros por grupo, equipo y tipo, de a 50 (`POR_PAGINA`, botón "Mostrar más"); detalle con fotos de inicio y final, nivel, mapa muscular, instrucciones, registro y enlace a su progreso; ejercicios propios.
- **Evaluación y plan:** cuestionario inicial y plan generado según sexo, edad, peso, altura, objetivo, zonas, experiencia, lugar, tiempo, lesiones y salud. En el entreno: peso sugerido, subida automática de peso, "Última vez" y cambiar ejercicio.
- **Ajustes:** unidad kg/lb, descanso por defecto, exportar o importar el respaldo JSON, y Créditos. En el teléfono, exportar usa la hoja de compartir; si no está disponible, descarga el archivo.

## Recursos gráficos de ejercicios

Orden en la ficha y en la guía: **fotos y videos propios** (si hay) → **foto del ejercicio** (inicio y final alternando, `useAlternar`) → **pestañas** (`PestanasEjercicio`: Instrucciones, Músculos con el mapa, Equipamiento con nivel, tipo y movimiento; en la ficha la pestaña va en la URL, `?pestana=`). Nivel y tipo también van como etiquetas bajo el nombre. En /plan, cada ejercicio de la semana lleva una silueta chica con sus músculos.

- **Fotos y videos propios (`medios`, `<MediosPropios>`):** el usuario graba la máquina de su gimnasio. `lib/medios.ts` los reduce en el teléfono: fotos a JPEG de 1280 px; videos recodificados con canvas + MediaRecorder a unos 540 px, 1,2 Mbps y máximo 15 s, con portada JPEG. Si no se puede recodificar, se guarda el original. Viven solo en el teléfono y **no entran en el respaldo general**. Se comparten aparte (Ajustes → "Fotos y videos de tu gimnasio"): un JSON con base64 que, al importarse, **se suma** por nombre de ejercicio sin borrar nada y sin duplicar.
- **Regla: ningún ejercicio sin ejemplo.** Los 873 ejercicios tienen foto. Si un ejercicio nuevo no tiene ninguna imagen, no entra al catálogo (por eso faltan 3 de kettlebell de free-exercise-db: no tienen fotos).
- **Fichas y fotos (`db/fichasEjercicios.ts`, generado; `public/medios/fotos/`):** todo viene de **free-exercise-db** (`github.com/yuhonas/free-exercise-db`), por decisión del dueño del producto. `FICHAS[nombre]` trae `archivo`, `id` (carpeta en el repositorio), músculos principales y secundarios, nivel, categoría (tipo), equipamiento detallado, mecánica y `nota` cuando la foto muestra una variante. Etiquetas en español en `lib/musculos.ts`. Cada ejercicio tiene `<archivo>.webp` (inicio, 800 px), `<archivo>-final.webp` y `<archivo>-mini.webp` (200 px, 4:3, del final). **Solo las miniaturas van al precache** (~6 MB); las grandes (~50 MB en total) se guardan la primera vez que se ven (`runtimeCaching`, caché `fotos-ejercicios`).
  - **Generador:** `scripts/catalogo-fedb/generar.mjs` (instrucciones de uso arriba del archivo), con `mapa.json` (los 79 básicos → id) y `traducciones.json` (id → nombre e instrucciones en español). Regenera fotos, `fichasEjercicios.ts` y `ejerciciosExtra.ts`. Si cambian los nombres de `ejerciciosExtra`, ojo: los ejercicios se buscan por nombre, y las bases existentes ya los tienen guardados con el nombre anterior.
  - **Ojo con la licencia:** el repositorio las publica como Unlicense (dominio público), pero su autor reconoce que se sacaron de internet; muchas traen el logo de bodybuilding.com. Es un riesgo aceptado mientras la app sea de uso personal. **Si la app se abre al público o se cobra, hay que reemplazarlas** por fotos con licencia verificada (Commons/Openverse, Pixabay, Mixkit; ver el historial de git, commit 027ed86, para la versión anterior con 66 fotos libres y sus créditos). Las instrucciones son resúmenes propios, no copia..
- **Fondo del login (`FondoAcceso`):** 4 videos de **Mixkit** (licencia «Stock Video Free»: uso comercial permitido, sin atribución obligatoria; se revisó clip por clip, porque algunos son «Restricted», solo para uso personal). Van recodificados con MediaRecorder en Chrome a 960×540, ~1 Mbps y máximo 8 s (unos 0,9 MB cada uno), en `public/medios/fondo/` con portada WebP. Se reproducen en secuencia detrás del formulario, que no cambia de tamaño, con una capa oscura encima. **No van al precache:** se guardan la primera vez que se ven (`runtimeCaching` con `rangeRequests`, necesario para Safari). Sin conexión o con `prefers-reduced-motion` se muestra la portada fija. Bajo la marca, `FraseMotivadora` cambia cada 5 s.
- **Fuentes descartadas para fotos libres (no volver a intentarlas):**
  - **Gymvisual:** de pago. Sus vistas previas con sello de agua no tienen licencia, aunque sean públicas.
  - **API gratuita de ExerciseDB:** no comercial y de baja resolución.
  - **Imágenes de Google en general.**
  - Lo legal con calidad 3D es de pago: Gym Animations, MoveKit, exercisedb.io.

- **Mapa muscular (`DiagramaMusculos`, `CuerpoMusculos`):** silueta de **react-body-highlighter** (MIT), de frente y de espalda, con los principales en lima y los secundarios en lima al 45%, más los nombres debajo. `MUSCULOS` (`lib/musculos.ts`) traduce cada músculo de free-exercise-db a las zonas de la silueta. Los ejercicios propios usan los músculos típicos de su grupo (`MUSCULOS_POR_GRUPO`) y, si no tienen foto propia, la silueta reemplaza a la foto.
- **Ya no se usan** los dibujos de Everkinetic ni los diagramas de Termininja/wger (se borraron en la Etapa 1 del rediseño). Tampoco usar fotos ni renders subidos por usuarios a wger: tienen licencias dudosas.

## Íconos y PWA

- **Instalar la app (`lib/instalacion.ts`, `<HojaInstalar>`):** la meta es que nadie tenga que pedir ayuda. La hoja copia el formato de ESCENA (proyecto hermano en `~/proyectos/escena`): ícono, "Lleva ZANFIT en tu celular", pestañas iPhone/Android (parte en la del teléfono), 3 pasos numerados con íconos (iPhone: Compartir → Agregar a pantalla de inicio → Agregar, en Safari o Chrome) y "Ahora no" / "Ya la instalé". En Android con Chrome, un botón de un toque (`beforeinstallprompt`, se escucha desde `main.tsx`). Dentro de Instagram/Facebook/TikTok (`app-interna`), cómo abrirla en el navegador y "Copiar link". "Ya la instalé" (o el evento `appinstalled`) queda en `localStorage` (`zanfit:instalada`) y `ofrecerInstalar()` deja de ofrecerla. Dónde aparece: sobre el login (`<PopupInstalar>`, apenas abren el link, una vez por visita), arriba en Entrenar (`<BannerInstalar>` "Instala ZANFIT en tu celular · Cómo"), después de entrenar (`<RecordatorioInstalar>`) y en Ajustes (siempre en el teléfono si no se abrió desde el ícono). En Administración, "Compartir ZANFIT" con el link y un código QR (`qrcode`, cargado solo ahí).

- Íconos en `public/`: `icon-192.png`, `icon-512.png` (purpose `any`, "ZF" de 240 px y "ZANFIT" de 46 px), `icon-maskable-512.png` (todo más chico, dentro de la zona segura del 80%), `apple-touch-icon.png` (180) y `favicon-64.png`.
- **Cómo regenerarlos:** se renderiza un HTML con Chrome headless a 512×512 (`--window-size=512,512 --screenshot`, con la fuente desde `node_modules/@fontsource-variable/space-grotesk`) y se reduce a los otros tamaños con `sips -z`. Chrome no permite ventanas de menos de unos 500px, así que nunca se renderiza directo a 192.
- `index.html` tiene los meta de iOS (`apple-mobile-web-app-capable`, título y `status-bar-style: black-translucent`).
- Chrome no reporta errores de instalabilidad (`Page.getInstallabilityErrors`), y con el build de producción todas las rutas cargan offline.

## Despliegue

- **Cloudflare Pages (oficial, `zanfit.pages.dev`):** creado en octubre de 2026. **Ojo:** el panel de Cloudflare empuja a crear un *Worker* (queda en `zanfit.alarma-comunitaria.workers.dev`, sin `functions/` ni variables): hay que crearlo como **Page**, con el link directo `dash.cloudflare.com/?to=/:account/pages/new/provider/github`. Las variables se leen solo al publicar: después de cambiarlas hay que volver a publicar (un push basta). gratis y **permite uso comercial** (Vercel Hobby no). Se conecta al repo de GitHub y publica cada push: build `npm run build`, salida `dist`, Node 22 (`.node-version`). Sirve la app como SPA sin configuración (no hay `404.html`; **no usar** `/* /index.html 200` en `_redirects`, que en Cloudflare provoca un bucle). Cabeceras en `public/_headers` (sin caché para `sw.js`, `index.html` y el manifest; `assets/` inmutable).
- **Funciones del servidor en Cloudflare (`functions/api/*.ts`):** adaptan los manejadores de `api/` (escritos con `POST(request)` y `process.env`): `functions/api/_entorno.ts` copia `context.env` a `process.env` y **después** importa el manejador (hay módulos que leen variables al cargarse). Variables en Cloudflare → Settings → Variables and Secrets: `GEMINI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (como secretos). Probar en local con `npx wrangler pages dev dist`.
- **Vercel (`zanfit.vercel.app`, antiguo):** sigue publicando, pero `<AvisoMudanza>` (`MUDANZA_ACTIVA` en `lib/direccion.ts`) lleva solo a la dirección nueva en 4 s. Activa desde el 18-oct-2026. Si más adelante hay dominio propio, `DIRECCION` pasa a ese dominio y `zanfit.pages.dev` se suma a `DIRECCIONES_ANTIGUAS`. Las cuentas y los datos están en Supabase, así que en la nueva basta con ingresar e instalar el ícono otra vez; las fotos y videos propios hay que exportarlos/importarlos.
- **Netlify:** `netlify.toml` (lo mismo; la regla SPA está ahí).
- La PWA necesita HTTPS (todos lo dan). Con `autoUpdate`, una versión nueva se activa la próxima vez que se abre la app.
- **Capacidad del plan gratuito de Supabase (500 MB):** cada usuario ocupa ~0,2–0,4 MB al año; máximo recomendado ~800 usuarios. Administración muestra el medidor (`espacio_usado()`, `supabase/espacio.sql`); sobre el 70%, dejar de sumar usuarios hasta pasar a un plan pagado.
