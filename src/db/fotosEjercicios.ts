// GENERADO por un script (ver CLAUDE.md, "Recursos gráficos"). No editar a mano.

/**
 * Fotos de cada ejercicio, de free-exercise-db (github.com/yuhonas/free-exercise-db). Cada una tiene dos cuadros: inicio
 * (<archivo>.webp) y final (<archivo>-final.webp), de 800 px, más una miniatura 4:3 del final (<archivo>-mini.webp).
 * El repositorio las publica como dominio público (Unlicense), pero su origen no está verificado: ver CLAUDE.md.
 */
export interface FotoEjercicio {
  archivo: string
  /** Carpeta del ejercicio en free-exercise-db. */
  id: string
  /** Aclaración cuando la foto muestra una variante (otro implemento o posición). */
  nota?: string
}

export const REPOSITORIO_FOTOS = 'https://github.com/yuhonas/free-exercise-db'
export const paginaFoto = (foto: FotoEjercicio) => `${REPOSITORIO_FOTOS}/tree/main/exercises/${foto.id}`

/** Por nombre del catálogo. */
export const FOTOS: Record<string, FotoEjercicio> = {
  "Press de banca": { archivo: "press-de-banca", id: "Barbell_Bench_Press_-_Medium_Grip" },
  "Press de banca con mancuernas": { archivo: "press-de-banca-con-mancuernas", id: "Dumbbell_Bench_Press" },
  "Press inclinado con mancuernas": { archivo: "press-inclinado-con-mancuernas", id: "Incline_Dumbbell_Press" },
  "Aperturas con mancuernas": { archivo: "aperturas-con-mancuernas", id: "Dumbbell_Flyes" },
  "Cruce de poleas": { archivo: "cruce-de-poleas", id: "Cable_Crossover" },
  "Flexiones de brazos": { archivo: "flexiones-de-brazos", id: "Pushups" },
  "Fondos en paralelas": { archivo: "fondos-en-paralelas", id: "Dips_-_Chest_Version" },
  "Dominadas": { archivo: "dominadas", id: "Pullups" },
  "Jalón al pecho": { archivo: "jalon-al-pecho", id: "Wide-Grip_Lat_Pulldown" },
  "Remo con barra": { archivo: "remo-con-barra", id: "Bent_Over_Barbell_Row" },
  "Remo con mancuerna": { archivo: "remo-con-mancuerna", id: "One-Arm_Dumbbell_Row" },
  "Remo en polea baja": { archivo: "remo-en-polea-baja", id: "Seated_Cable_Rows" },
  "Peso muerto": { archivo: "peso-muerto", id: "Barbell_Deadlift" },
  "Sentadilla": { archivo: "sentadilla", id: "Barbell_Full_Squat" },
  "Prensa de piernas": { archivo: "prensa-de-piernas", id: "Leg_Press" },
  "Zancadas": { archivo: "zancadas", id: "Dumbbell_Lunges" },
  "Sentadilla búlgara": { archivo: "sentadilla-bulgara", id: "Split_Squat_with_Dumbbells" },
  "Peso muerto rumano": { archivo: "peso-muerto-rumano", id: "Romanian_Deadlift" },
  "Extensión de cuádriceps": { archivo: "extension-de-cuadriceps", id: "Leg_Extensions" },
  "Curl femoral": { archivo: "curl-femoral", id: "Lying_Leg_Curls" },
  "Hip thrust": { archivo: "hip-thrust", id: "Barbell_Hip_Thrust" },
  "Elevación de pantorrillas": { archivo: "elevacion-de-pantorrillas", id: "Standing_Calf_Raises" },
  "Press militar": { archivo: "press-militar", id: "Standing_Military_Press" },
  "Press de hombros con mancuernas": { archivo: "press-de-hombros-con-mancuernas", id: "Dumbbell_Shoulder_Press" },
  "Elevaciones laterales": { archivo: "elevaciones-laterales", id: "Side_Lateral_Raise" },
  "Pájaros": { archivo: "pajaros", id: "Seated_Bent-Over_Rear_Delt_Raise" },
  "Face pull": { archivo: "face-pull", id: "Face_Pull" },
  "Curl con barra": { archivo: "curl-con-barra", id: "Barbell_Curl" },
  "Curl con mancuernas": { archivo: "curl-con-mancuernas", id: "Dumbbell_Bicep_Curl" },
  "Curl martillo": { archivo: "curl-martillo", id: "Hammer_Curls" },
  "Curl predicador": { archivo: "curl-predicador", id: "Preacher_Curl" },
  "Curl en polea": { archivo: "curl-en-polea", id: "Standing_Biceps_Cable_Curl" },
  "Extensión de tríceps en polea": { archivo: "extension-de-triceps-en-polea", id: "Triceps_Pushdown" },
  "Press francés": { archivo: "press-frances", id: "EZ-Bar_Skullcrusher" },
  "Extensión de tríceps sobre la cabeza": { archivo: "extension-de-triceps-sobre-la-cabeza", id: "Seated_Triceps_Press" },
  "Fondos en banco": { archivo: "fondos-en-banco", id: "Bench_Dips" },
  "Press de banca agarre cerrado": { archivo: "press-de-banca-agarre-cerrado", id: "Close-Grip_Barbell_Bench_Press" },
  "Plancha": { archivo: "plancha", id: "Plank" },
  "Abdominales": { archivo: "abdominales", id: "Crunches" },
  "Elevación de piernas colgado": { archivo: "elevacion-de-piernas-colgado", id: "Hanging_Leg_Raise" },
  "Rueda abdominal": { archivo: "rueda-abdominal", id: "Ab_Roller" },
  "Press de pecho en máquina": { archivo: "press-de-pecho-en-maquina", id: "Machine_Bench_Press" },
  "Press inclinado en máquina": { archivo: "press-inclinado-en-maquina", id: "Leverage_Incline_Chest_Press" },
  "Press declinado en máquina": { archivo: "press-declinado-en-maquina", id: "Leverage_Decline_Chest_Press" },
  "Aperturas en máquina": { archivo: "aperturas-en-maquina", id: "Butterfly" },
  "Press de banca en máquina Smith": { archivo: "press-de-banca-en-maquina-smith", id: "Smith_Machine_Bench_Press" },
  "Press inclinado en máquina Smith": { archivo: "press-inclinado-en-maquina-smith", id: "Smith_Machine_Incline_Bench_Press" },
  "Aperturas en polea": { archivo: "aperturas-en-polea", id: "Flat_Bench_Cable_Flyes" },
  "Aperturas inclinadas en polea": { archivo: "aperturas-inclinadas-en-polea", id: "Incline_Cable_Flye" },
  "Jalón con agarre supino": { archivo: "jalon-con-agarre-supino", id: "Underhand_Cable_Pulldowns" },
  "Jalón con triángulo": { archivo: "jalon-con-triangulo", id: "V-Bar_Pulldown" },
  "Pullover en polea alta": { archivo: "pullover-en-polea-alta", id: "Straight-Arm_Pulldown" },
  "Remo en T": { archivo: "remo-en-t", id: "T-Bar_Row_with_Handle" },
  "Hiperextensiones": { archivo: "hiperextensiones", id: "Hyperextensions_Back_Extensions" },
  "Peso muerto en máquina Smith": { archivo: "peso-muerto-en-maquina-smith", id: "Smith_Machine_Stiff-Legged_Deadlift" },
  "Sentadilla hack": { archivo: "sentadilla-hack", id: "Hack_Squat" },
  "Sentadilla en máquina Smith": { archivo: "sentadilla-en-maquina-smith", id: "Smith_Machine_Squat" },
  "Curl femoral sentado": { archivo: "curl-femoral-sentado", id: "Seated_Leg_Curl" },
  "Curl femoral de pie": { archivo: "curl-femoral-de-pie", id: "Standing_Leg_Curl" },
  "Abductores en máquina": { archivo: "abductores-en-maquina", id: "Thigh_Abductor" },
  "Patada de glúteo en polea": { archivo: "patada-de-gluteo-en-polea", id: "Glute_Kickback", nota: "En la foto: la patada en el suelo; en la polea, el tobillo va enganchado al cable y la rodilla casi recta." },
  "Pantorrillas sentado en máquina": { archivo: "pantorrillas-sentado-en-maquina", id: "Seated_Calf_Raise" },
  "Pantorrillas en prensa": { archivo: "pantorrillas-en-prensa", id: "Calf_Press_On_The_Leg_Press_Machine" },
  "Press de hombros en máquina": { archivo: "press-de-hombros-en-maquina", id: "Machine_Shoulder_Military_Press" },
  "Elevaciones frontales en polea": { archivo: "elevaciones-frontales-en-polea", id: "Front_Cable_Raise" },
  "Remo al mentón en polea": { archivo: "remo-al-menton-en-polea", id: "Upright_Cable_Row" },
  "Remo al mentón en máquina Smith": { archivo: "remo-al-menton-en-maquina-smith", id: "Smith_Machine_Upright_Row" },
  "Pájaros en polea": { archivo: "pajaros-en-polea", id: "Cable_Rear_Delt_Fly" },
  "Encogimientos en polea": { archivo: "encogimientos-en-polea", id: "Cable_Shrugs" },
  "Encogimientos en máquina Smith": { archivo: "encogimientos-en-maquina-smith", id: "Smith_Machine_Behind_the_Back_Shrug", nota: "En la foto: con la barra por detrás; también se puede hacer con la barra frente a los muslos." },
  "Curl predicador en máquina": { archivo: "curl-predicador-en-maquina", id: "Machine_Preacher_Curls" },
  "Curl martillo en polea": { archivo: "curl-martillo-en-polea", id: "Cable_Hammer_Curls_-_Rope_Attachment" },
  "Curl predicador en polea": { archivo: "curl-predicador-en-polea", id: "Cable_Preacher_Curl" },
  "Extensión de tríceps con cuerda": { archivo: "extension-de-triceps-con-cuerda", id: "Triceps_Pushdown_-_Rope_Attachment" },
  "Extensión de tríceps con agarre invertido": { archivo: "extension-de-triceps-con-agarre-invertido", id: "Reverse_Grip_Triceps_Pushdown" },
  "Extensión de tríceps a una mano en polea": { archivo: "extension-de-triceps-a-una-mano-en-polea", id: "Cable_One_Arm_Tricep_Extension" },
  "Fondos en máquina": { archivo: "fondos-en-maquina", id: "Dip_Machine" },
  "Extensión de tríceps en máquina": { archivo: "extension-de-triceps-en-maquina", id: "Machine_Triceps_Extension" },
  "Crunch en polea": { archivo: "crunch-en-polea", id: "Cable_Crunch" },
}
