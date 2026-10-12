/**
 * Fotos reales de máquinas y ejercicios, de Wikimedia Commons y Flickr (vía Openverse), solo con licencias libres (CC0, dominio público, CC BY,
 * CC BY-SA). Las eligió una persona revisando cada candidata: la foto tiene que mostrar claramente la máquina o el
 * ejercicio. Archivos en public/medios/fotos (<archivo>.webp de 800 px y <archivo>-mini.webp de 240 px).
 * CC BY exige mostrar autor, licencia y enlace a la fuente: lo hace FotoMaquina y la pantalla Créditos.
 */
export interface FotoEjercicio {
  archivo: string
  autor: string
  licencia: string
  /** Página de la foto en su sitio de origen (fuente y licencia completa). */
  pagina: string
  /** Sitio de origen. Si falta, es Wikimedia Commons. */
  fuente?: string
  /** Aclaración cuando la foto muestra una variante del ejercicio (se muestra bajo la foto). */
  nota?: string
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
  "Fondos en paralelas": { archivo: "fondos-en-paralelas", autor: "bodycoach2", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/21569074@N00/3060550012", fuente: "Flickr", nota: "En la foto: estación de fondos y dominadas." },
  "Remo con mancuerna": { archivo: "remo-con-mancuerna", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/42257963480", fuente: "Flickr" },
  "Hip thrust": { archivo: "hip-thrust", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/43844582332", fuente: "Flickr", nota: "En la foto: variante a una pierna con pesa rusa." },
  "Elevaciones laterales": { archivo: "elevaciones-laterales", autor: "Tyler Read", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/w/index.php?curid=141589531", fuente: "Wikimedia Commons" },
  "Face pull": { archivo: "face-pull", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/42013323680", fuente: "Flickr", nota: "En la foto: con banda elástica en vez de polea." },
  "Curl martillo": { archivo: "curl-martillo", autor: "Dominic Eltjes", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/93889371@N07/20640150616", fuente: "Flickr" },
  "Curl en polea": { archivo: "curl-en-polea", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/44067037611", fuente: "Flickr" },
  "Plancha": { archivo: "plancha", autor: "nenadstojkovicart", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/202846129@N03/54579573594", fuente: "Flickr" },
  "Elevación de piernas colgado": { archivo: "elevacion-de-piernas-colgado", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/42086223280", fuente: "Flickr", nota: "En la foto: variante con rodillas flectadas, más fácil para partir." },
  "Rueda abdominal": { archivo: "rueda-abdominal", autor: "PTPioneer", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/182613284@N02/48317668827", fuente: "Flickr", nota: "En la foto: la rueda abdominal (implemento)." },
  "Aperturas inclinadas en polea": { archivo: "aperturas-inclinadas-en-polea", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/42084333650", fuente: "Flickr" },
  "Curl femoral sentado": { archivo: "curl-femoral-sentado", autor: "haswell.fitness Equipment from China", licencia: "CC BY-SA 2.0", pagina: "https://www.flickr.com/photos/127311295@N06/36703308310", fuente: "Flickr" },
  "Pantorrillas sentado en máquina": { archivo: "pantorrillas-sentado-en-maquina", autor: "Teemeah", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/w/index.php?curid=90739536", fuente: "Wikimedia Commons" },
  "Curl predicador en máquina": { archivo: "curl-predicador-en-maquina", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/w/index.php?curid=179972406", fuente: "Wikimedia Commons" },
  "Curl martillo en polea": { archivo: "curl-martillo-en-polea", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/43893700911", fuente: "Flickr" },
  "Extensión de tríceps en máquina": { archivo: "extension-de-triceps-en-maquina", autor: "Aliva Sahoo", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/w/index.php?curid=179972396", fuente: "Wikimedia Commons" },
  "Extensión de tríceps con cuerda": { archivo: "extension-de-triceps-con-cuerda", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/43893697521", fuente: "Flickr" },
  "Sentadilla búlgara": { archivo: "sentadilla-bulgara", autor: "RickyBennison", licencia: "CC BY-SA 4.0", pagina: "https://commons.wikimedia.org/wiki/File:Jumping_split_squat_with_dumbbells_1.png", nota: "En la foto: variante con el pie de atrás en el suelo (en la búlgara va sobre un banco)." },
  "Pájaros": { archivo: "pajaros", autor: "personaltrainertoronto", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/121183998@N08/43177074414", fuente: "Flickr", nota: "En la foto: el mismo movimiento con banda elástica en vez de mancuernas." },
  "Press declinado en máquina": { archivo: "press-declinado-en-maquina", autor: "Mixkit", licencia: "Mixkit Free License", pagina: "https://mixkit.co/free-stock-video/man-exercising-on-chest-press-machine-in-gym-100538/", fuente: "Mixkit", nota: "En la foto: la máquina de press de pecho; en la declinada se empuja hacia adelante y abajo." },
  "Press de banca agarre cerrado": { archivo: "press-de-banca-agarre-cerrado", autor: "Mixkit", licencia: "Mixkit Free License", pagina: "https://mixkit.co/free-stock-video/man-doing-bench-press-at-the-gym-100543/", fuente: "Mixkit", nota: "En la foto: press de banca; en este ejercicio las manos van más juntas, al ancho de los hombros." },
  "Pantorrillas en prensa": { archivo: "pantorrillas-en-prensa", autor: "Mixkit", licencia: "Mixkit Free License", pagina: "https://mixkit.co/free-stock-video/woman-using-leg-press-machine-at-the-gym-100518/", fuente: "Mixkit", nota: "En la foto: la prensa de piernas; para pantorrillas, apoya solo la punta de los pies en el borde de la plataforma." },
  "Abdominales": { archivo: "abdominales", autor: "Usuario 5132824", licencia: "Pixabay Content License", pagina: "https://pixabay.com/photos/woman-crunches-sport-training-2250970/", fuente: "Pixabay" },
  "Curl con barra": { archivo: "curl-con-barra", autor: "janeb13", licencia: "Pixabay Content License", pagina: "https://pixabay.com/photos/fitness-room-fitness-equipment-1181824/", fuente: "Pixabay" },
  "Press de banca con mancuernas": { archivo: "press-de-banca-con-mancuernas", autor: "Usuario 5132824", licencia: "Pixabay Content License", pagina: "https://pixabay.com/photos/woman-personal-trainer-fitness-2260736/", fuente: "Pixabay" },
  "Extensión de cuádriceps": { archivo: "extension-de-cuadriceps", autor: "eduardoonef", licencia: "Pixabay Content License", pagina: "https://pixabay.com/photos/woman-gym-leg-day-exercise-fitness-7200528/", fuente: "Pixabay" },
  "Remo en T": { archivo: "remo-en-t", autor: "tixonov_valentin", licencia: "Pixabay Content License", pagina: "https://pixabay.com/videos/id-30417/", fuente: "Pixabay" },
  "Fondos en máquina": { archivo: "fondos-en-maquina", autor: "tixonov_valentin", licencia: "Pixabay Content License", pagina: "https://pixabay.com/videos/id-66989/", fuente: "Pixabay" },
  "Press francés": { archivo: "press-frances", autor: "tixonov_valentin", licencia: "Pixabay Content License", pagina: "https://pixabay.com/videos/id-66998/", fuente: "Pixabay", nota: "En la foto: con mancuernas y en el suelo; en este ejercicio se hace en banca con la barra Z." },
  "Patada de glúteo en polea": { archivo: "patada-de-gluteo-en-polea", autor: "tixonov_valentin", licencia: "Pixabay Content License", pagina: "https://pixabay.com/videos/id-66370/", fuente: "Pixabay", nota: "En la foto: la patada en el suelo; en la polea, el tobillo va enganchado al cable y la rodilla casi recta." },
  "Extensión de tríceps a una mano en polea": { archivo: "extension-de-triceps-a-una-mano-en-polea", autor: "tixonov_valentin", licencia: "Pixabay Content License", pagina: "https://pixabay.com/videos/id-66995/", fuente: "Pixabay", nota: "En la foto: con la cuerda; en este ejercicio se toma un solo agarre con una mano." },
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
  "Aperturas en polea": FOTOS_BASE["Aperturas inclinadas en polea"],
}
