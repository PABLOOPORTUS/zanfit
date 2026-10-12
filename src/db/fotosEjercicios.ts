/**
 * Fotos reales de máquinas y ejercicios, de Wikimedia Commons, solo con licencias libres (CC0, dominio público, CC BY,
 * CC BY-SA). Las eligió una persona revisando cada candidata: la foto tiene que mostrar claramente la máquina o el
 * ejercicio. Archivos en public/medios/fotos (<archivo>.webp de 800 px y <archivo>-mini.webp de 240 px).
 * CC BY exige mostrar autor, licencia y enlace a la fuente: lo hace FotoMaquina y la pantalla Créditos.
 */
export interface FotoEjercicio {
  archivo: string
  autor: string
  licencia: string
  /** Página del archivo en Wikimedia Commons (fuente y licencia completa). */
  pagina: string
}

const FOTOS_BASE: Record<string, FotoEjercicio> = {
  "Press de banca": { archivo: "press-de-banca", autor: "SAgbley", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Weight_Bench_set.jpg" },
  "Press inclinado con mancuernas": { archivo: "press-inclinado-con-mancuernas", autor: "U.S. Air Force photo by Airman 1st Class Paden Henry", licencia: "Public domain", pagina: "https://commons.wikimedia.org/wiki/File:Two_Miles_Ahead_of_the_Curve-_86_MXO_Airman_embraces_new_fitness_standards_(9782536).jpg" },
  "Cruce de poleas": { archivo: "cruce-de-poleas", autor: "Nenad Stojkovic", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg" },
  "Flexiones de brazos": { archivo: "flexiones-de-brazos", autor: "PTPioneer", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Personal_training_push-ups_preparation.jpg" },
  "Press de pecho en máquina": { archivo: "press-de-pecho-en-maquina", autor: "Tyler  Read", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Girl_doing_chest_press_machine_exercise.jpg" },
  "Press inclinado en máquina": { archivo: "press-inclinado-en-maquina", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Chest_Incline.jpg" },
  "Aperturas en máquina": { archivo: "aperturas-en-maquina", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Pec_deck_Fly.jpg" },
  "Press de banca en máquina Smith": { archivo: "press-de-banca-en-maquina-smith", autor: "Wikideas1", licencia: "CC0", pagina: "https://commons.wikimedia.org/wiki/File:Smith_machine.webp" },
  "Dominadas": { archivo: "dominadas", autor: "PTPioneer", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Girl_doing_pull-ups_-_48441668177.jpg" },
  "Jalón al pecho": { archivo: "jalon-al-pecho", autor: "Tyler  Read", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Girl_doing_lat_pulldown_exercise.jpg" },
  "Remo con barra": { archivo: "remo-con-barra", autor: "embhoo", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Barbell_row.jpg" },
  "Remo en polea baja": { archivo: "remo-en-polea-baja", autor: "Miguel Angel Omaña Rojas", licencia: "CC0", pagina: "https://commons.wikimedia.org/wiki/File:Woman_using_a_seated_cable_row_machine_at_the_gym.jpg" },
  "Peso muerto": { archivo: "peso-muerto", autor: "stu_spivack", licencia: "CC BY-SA 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Deadlift_Barbell.JPG" },
  "Hiperextensiones": { archivo: "hiperextensiones", autor: "Wikideas1", licencia: "CC0", pagina: "https://commons.wikimedia.org/wiki/File:Back_extension_bench.webp" },
  "Sentadilla": { archivo: "sentadilla", autor: "Nenad Stojkovic", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Woman_doing_squat_workout_in_gym_with_barbell,_back_view.jpg" },
  "Prensa de piernas": { archivo: "prensa-de-piernas", autor: "Nenad Stojkovic", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Young_man_using_a_leg_press_machine_at_the_gym.jpg" },
  "Zancadas": { archivo: "zancadas", autor: "Tyler  Read", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Dumbbell_lunges.jpg" },
  "Sentadilla hack": { archivo: "sentadilla-hack", autor: "brett jordan", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:David_Jobson_%26_Ziggy_Chima;_machine_hack_squat.jpg" },
  "Abductores en máquina": { archivo: "abductores-en-maquina", autor: "Teemeah", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Hip_abductor_machine.jpg" },
  "Press militar": { archivo: "press-militar", autor: "Richardkiwi", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Military_press_ez-bar_25022008.jpg" },
  "Press de hombros con mancuernas": { archivo: "press-de-hombros-con-mancuernas", autor: "Tyler  Read", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Girl_doing_dumbbell_shoulder_press_02.jpg" },
  "Press de hombros en máquina": { archivo: "press-de-hombros-en-maquina", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Shoulder_Press.jpg" },
  "Curl con mancuernas": { archivo: "curl-con-mancuernas", autor: "PTPioneer", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Dumbbell_bicep_curls.jpg" },
  "Extensión de tríceps en polea": { archivo: "extension-de-triceps-en-polea", autor: "", licencia: "CC BY-SA 3.0", pagina: "https://commons.wikimedia.org/wiki/File:CableMachinePushdown.JPG" },
  "Extensión de tríceps sobre la cabeza": { archivo: "extension-de-triceps-sobre-la-cabeza", autor: "U.S. Army photo by Sgt. Deziree Keay", licencia: "Public domain", pagina: "https://commons.wikimedia.org/wiki/File:Resistance_training_develops_functional_strength_(9834695).jpg" },
  "Fondos en banco": { archivo: "fondos-en-banco", autor: "U.S. Navy photo by Mass Communication Specialist 3rd Class Kenneth Abbate", licencia: "Public domain", pagina: "https://commons.wikimedia.org/wiki/File:US_Navy_090212-N-2475A-005_Machinist%27s_Mate_2nd_Class_John_Brechwald,_from_San_Jose,_Calif.,_performs_bench_dips_with_two_45_lb_weights.jpg" },
  "Curl predicador": { archivo: "curl-predicador", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Bicep_curl_machine.jpg" },
}

/** Por nombre del catálogo. Algunas fotos de máquina se reutilizan en sus variantes (el dibujo muestra el agarre o la posición). */
export const FOTOS: Record<string, FotoEjercicio> = {
  ...FOTOS_BASE,
  "Press inclinado en máquina Smith": FOTOS_BASE["Press de banca en máquina Smith"],
  "Peso muerto en máquina Smith": FOTOS_BASE["Press de banca en máquina Smith"],
  "Sentadilla en máquina Smith": FOTOS_BASE["Press de banca en máquina Smith"],
  "Remo al mentón en máquina Smith": FOTOS_BASE["Press de banca en máquina Smith"],
  "Encogimientos en máquina Smith": FOTOS_BASE["Press de banca en máquina Smith"],
  "Jalón con agarre supino": FOTOS_BASE["Jalón al pecho"],
  "Jalón con triángulo": FOTOS_BASE["Jalón al pecho"],
}
