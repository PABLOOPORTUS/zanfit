export type GrupoMuscular = 'pecho' | 'espalda' | 'piernas' | 'hombros' | 'biceps' | 'triceps' | 'antebrazos' | 'core'

export type Equipo =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'smith'
  | 'polea'
  | 'peso-corporal'
  | 'kettlebell'
  | 'banda'
  | 'balon-medicinal'
  | 'fitball'
  | 'rodillo'
  | 'otro'

export interface Exercise {
  id?: number
  nombre: string
  grupoMuscular: GrupoMuscular
  equipo: Equipo
  instrucciones?: string
  /** `true` si lo creó el usuario; los del catálogo inicial no se editan ni se eliminan. */
  propio: boolean
}

export interface RoutineExercise {
  exerciseId: number
  seriesObjetivo: number
  repsObjetivo: number
  descansoSeg: number
  /** Peso de partida sugerido por el plan (kg). Solo se usa si el ejercicio todavía no tiene historial. */
  pesoSugerido?: number
  /** Indicación breve del plan para este ejercicio (por ejemplo, de la IA). */
  nota?: string
}

/** Movimiento del calentamiento sugerido de una rutina del plan. */
export interface PasoCalentamiento {
  exerciseId: number
  /** Duración sugerida (los movimientos de movilidad se cuentan en segundos). */
  segundos: number
}

export interface Routine {
  id?: number
  nombre: string
  ejercicios: RoutineExercise[]
  /** Solo en las rutinas del plan: calentamiento sugerido antes del primer ejercicio. */
  calentamiento?: PasoCalentamiento[]
  /** Solo en las rutinas del plan: foco del día ("Pecho, hombros y tríceps") y una nota motivadora. */
  foco?: string
  nota?: string
}

export interface Workout {
  id?: number
  /** Vacío si es un entrenamiento libre, sin rutina. */
  routineId?: number
  /** Copia del nombre de la rutina al iniciar ("Entreno libre" si no hay rutina); sobrevive si la rutina se borra. */
  nombre: string
  fechaInicio: number
  /** Vacío mientras el entreno está en curso. */
  fechaFin?: number
  notas?: string
}

/** Una serie registrada. Se llama WorkoutSet para no chocar con el `Set` de JavaScript. */
export interface WorkoutSet {
  id?: number
  workoutId: number
  exerciseId: number
  numeroSerie: number
  reps: number
  /** En kg. */
  peso: number
  completada: boolean
}

export type Unidad = 'kg' | 'lb'

/** Una sola fila (`id: 'general'`) en la tabla `ajustes`. */
export interface Ajustes {
  id: 'general'
  /** Solo cambia cómo se muestran e ingresan los pesos: en la base siempre se guardan en kg. */
  unidad: Unidad
  /** Descanso para ejercicios que no vienen de una rutina y para los que se agregan a una rutina. */
  descansoPorDefectoSeg: number
  /** Foto de perfil: JPEG cuadrado de 256 px como data URL (~15 kB). Viaja con el resto de los datos al sincronizar. */
  fotoPerfil?: string
}

export type Sexo = 'hombre' | 'mujer'
/** `condicion` se muestra como "Salud general" (se mantiene el valor para no migrar perfiles antiguos). */
export type Objetivo = 'musculo' | 'grasa' | 'fuerza' | 'resistencia' | 'condicion'
export type Zona = 'piernas-gluteos' | 'brazos' | 'pecho' | 'espalda' | 'hombros' | 'abdomen' | 'general'
export type Experiencia = 'principiante' | 'intermedio' | 'avanzado'
export type Lugar = 'gimnasio' | 'casa' | 'aire-libre'
/** Lo que hay disponible fuera del gimnasio (el peso corporal siempre está). */
export type EquipoDisponible = 'mancuernas' | 'kettlebell' | 'banda' | 'barra' | 'barras-dominadas' | 'fitball' | 'balon-medicinal'
export type Lesion = 'rodillas' | 'espalda' | 'hombros' | 'munecas'

/** Respuestas de la evaluación inicial. Una sola fila (`id: 'general'`) en la tabla `perfil`. */
export interface Perfil {
  id: 'general'
  sexo: Sexo
  /** Se guarda el año de nacimiento (no la edad) para que la edad se mantenga al día. */
  anioNacimiento: number
  pesoKg: number
  alturaCm: number
  objetivo: Objetivo
  zonas: Zona[]
  experiencia: Experiencia
  lugar: Lugar
  /** Fuera del gimnasio: qué equipo tiene. Sin valor (perfiles antiguos de "casa"): mancuernas, banda y kettlebell. */
  equipamiento?: EquipoDisponible[]
  diasPorSemana: number
  minutosPorSesion: number
  lesiones: Lesion[]
  /** Respondió "sí" a alguna pregunta de salud: el plan parte más suave y se recomienda consultar a un médico. */
  precaucion: boolean
  /** Respuesta a cada pregunta de salud (para poder editar la evaluación sin volver a contestarlas). */
  salud?: boolean[]
  actualizadoEn: number
}

export type Division = 'completo' | 'torso-pierna' | 'ppl' | 'ppl-torso-pierna'

/** Plan generado. Una sola fila (`id: 'actual'`) en la tabla `plan`. Sus días son rutinas normales. */
export interface Plan {
  id: 'actual'
  division: Division
  /** Rutinas del plan en el orden de la semana (Día A, Día B…). */
  rutinaIds: number[]
  creadoEn: number
}

/** Foto o video que el usuario grabó para un ejercicio (por ejemplo, la máquina de su gimnasio). Vive solo en el teléfono. */
export interface MedioPropio {
  id?: number
  exerciseId: number
  tipo: 'foto' | 'video'
  /** Ya reducido por la app (foto JPEG de máx. 1280 px; video de ~540 px y máx. 15 s). */
  archivo: Blob
  /** Imagen chica (JPEG) para miniaturas y como portada del video. */
  miniatura: Blob
  creadoEn: number
}
