import type { Exercise } from '../types'

/** Catálogo con el que parte la app. Se carga al crear la base (ver db/index.ts) con `propio: false`. */
export const EJERCICIOS_BASE: Omit<Exercise, 'id' | 'propio'>[] = [
  // Pecho
  {
    nombre: 'Press de banca',
    grupoMuscular: 'pecho',
    equipo: 'barra',
    instrucciones:
      'Acuéstate con los pies firmes en el suelo y las escápulas juntas. Baja la barra controlada hasta la mitad del pecho y empuja hasta estirar los brazos sin bloquear los codos.',
  },
  {
    nombre: 'Press de banca con mancuernas',
    grupoMuscular: 'pecho',
    equipo: 'mancuernas',
    instrucciones:
      'Igual que el press de banca, pero con una mancuerna en cada mano. Baja hasta sentir un buen estiramiento en el pecho y sube controlando todo el recorrido.',
  },
  {
    nombre: 'Press inclinado con mancuernas',
    grupoMuscular: 'pecho',
    equipo: 'mancuernas',
    instrucciones:
      'Con el banco entre 30° y 45°, baja las mancuernas a los costados del pecho alto, con los codos a unos 45° del cuerpo. Empuja hacia arriba juntándolas sin chocarlas.',
  },
  {
    nombre: 'Aperturas con mancuernas',
    grupoMuscular: 'pecho',
    equipo: 'mancuernas',
    instrucciones:
      'Acostado en el banco, abre los brazos en arco con los codos levemente flectados hasta sentir el estiramiento. Vuelve a juntar las mancuernas sobre el pecho apretando los pectorales.',
  },
  {
    nombre: 'Cruce de poleas',
    grupoMuscular: 'pecho',
    equipo: 'polea',
    instrucciones:
      'De pie entre las poleas altas y con un pie adelante, junta las manos frente a la cadera describiendo un arco. Vuelve lento hasta sentir el estiramiento en el pecho.',
  },
  {
    nombre: 'Flexiones de brazos',
    grupoMuscular: 'pecho',
    equipo: 'peso-corporal',
    instrucciones:
      'Manos un poco más anchas que los hombros y cuerpo recto de cabeza a talones. Baja hasta que el pecho casi toque el suelo y empuja sin dejar caer la cadera.',
  },
  {
    nombre: 'Fondos en paralelas',
    grupoMuscular: 'pecho',
    equipo: 'peso-corporal',
    instrucciones:
      'Inclina el torso levemente hacia adelante y baja hasta que los hombros queden a la altura de los codos. Empuja hasta estirar los brazos.',
  },

  // Espalda
  {
    nombre: 'Dominadas',
    grupoMuscular: 'espalda',
    equipo: 'peso-corporal',
    instrucciones:
      'Cuélgate con las palmas hacia adelante y las manos un poco más anchas que los hombros. Sube llevando el pecho hacia la barra hasta pasar la barbilla y baja completo.',
  },
  {
    nombre: 'Jalón al pecho',
    grupoMuscular: 'espalda',
    equipo: 'polea',
    instrucciones:
      'Sentado con los muslos fijos bajo el soporte, tira la barra hacia la parte alta del pecho llevando los codos hacia abajo y atrás. Sube lento sin soltar la tensión.',
  },
  {
    nombre: 'Remo con barra',
    grupoMuscular: 'espalda',
    equipo: 'barra',
    instrucciones:
      'Con las rodillas levemente flectadas, el torso inclinado unos 45° y la espalda recta, tira la barra hacia el ombligo juntando las escápulas. Baja controlado.',
  },
  {
    nombre: 'Remo con mancuerna',
    grupoMuscular: 'espalda',
    equipo: 'mancuernas',
    instrucciones:
      'Apoya una mano y una rodilla en el banco con la espalda plana. Tira la mancuerna hacia la cadera con el codo pegado al cuerpo y baja estirando el brazo completo.',
  },
  {
    nombre: 'Remo en polea baja',
    grupoMuscular: 'espalda',
    equipo: 'polea',
    instrucciones:
      'Sentado con la espalda recta y las rodillas levemente flectadas, tira el agarre hacia el abdomen juntando las escápulas. Vuelve sin encorvar la espalda.',
  },
  {
    nombre: 'Peso muerto',
    grupoMuscular: 'espalda',
    equipo: 'barra',
    instrucciones:
      'Con la barra sobre la mitad del pie, tómala, saca pecho y empuja el suelo con las piernas manteniendo la espalda neutra. Termina de pie apretando glúteos y baja por el mismo camino.',
  },

  // Piernas
  {
    nombre: 'Sentadilla',
    grupoMuscular: 'piernas',
    equipo: 'barra',
    instrucciones:
      'Barra sobre los trapecios y pies al ancho de los hombros. Baja llevando la cadera atrás y abajo, con las rodillas en la dirección de los pies, al menos hasta la paralela, y sube empujando con todo el pie.',
  },
  {
    nombre: 'Prensa de piernas',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Pies al ancho de los hombros en la plataforma. Baja hasta que las rodillas formen unos 90° sin despegar la zona lumbar del respaldo y empuja sin bloquear las rodillas.',
  },
  {
    nombre: 'Zancadas',
    grupoMuscular: 'piernas',
    equipo: 'mancuernas',
    instrucciones:
      'Da un paso largo y baja hasta que la rodilla de atrás casi toque el suelo, con ambas rodillas cerca de 90°. Empuja con la pierna de adelante para volver.',
  },
  {
    nombre: 'Sentadilla búlgara',
    grupoMuscular: 'piernas',
    equipo: 'mancuernas',
    instrucciones:
      'Con el empeine de atrás apoyado en un banco, baja en vertical hasta que el muslo de adelante quede paralelo al suelo. Sube empujando con el talón de adelante.',
  },
  {
    nombre: 'Peso muerto rumano',
    grupoMuscular: 'piernas',
    equipo: 'barra',
    instrucciones:
      'Con las rodillas apenas flectadas, lleva la cadera hacia atrás y baja la barra pegada a las piernas hasta sentir el estiramiento atrás del muslo. Vuelve apretando glúteos.',
  },
  {
    nombre: 'Extensión de cuádriceps',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Ajusta el respaldo para que las rodillas queden alineadas con el eje de la máquina. Estira las piernas por completo, aprieta un segundo y baja lento.',
  },
  {
    nombre: 'Curl femoral',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Con el rodillo sobre los tobillos, flecta las rodillas llevando los talones hacia los glúteos. Vuelve controlando el peso, sin dejarlo caer.',
  },
  {
    nombre: 'Hip thrust',
    grupoMuscular: 'piernas',
    equipo: 'barra',
    instrucciones:
      'Con la espalda alta apoyada en un banco y la barra sobre la cadera, empuja con los talones hasta alinear rodillas, cadera y hombros. Aprieta glúteos arriba y baja controlado.',
  },
  {
    nombre: 'Elevación de pantorrillas',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Con la punta de los pies en el borde de la plataforma, baja los talones todo lo que puedas y sube lo más alto posible. Haz una pausa arriba en cada repetición.',
  },

  // Hombros
  {
    nombre: 'Press militar',
    grupoMuscular: 'hombros',
    equipo: 'barra',
    instrucciones:
      'De pie, con glúteos y abdomen apretados, empuja la barra desde la clavícula hasta arriba de la cabeza. Al final mete la cabeza bajo la barra y baja controlado.',
  },
  {
    nombre: 'Press de hombros con mancuernas',
    grupoMuscular: 'hombros',
    equipo: 'mancuernas',
    instrucciones:
      'Sentado con la espalda apoyada, empuja las mancuernas desde la altura de las orejas hasta casi juntarlas arriba. Baja lento hasta la posición inicial.',
  },
  {
    nombre: 'Elevaciones laterales',
    grupoMuscular: 'hombros',
    equipo: 'mancuernas',
    instrucciones:
      'Con los codos levemente flectados, sube las mancuernas hacia los lados hasta la altura de los hombros. Baja lento y sin balancear el cuerpo.',
  },
  {
    nombre: 'Pájaros',
    grupoMuscular: 'hombros',
    equipo: 'mancuernas',
    instrucciones:
      'Inclinado hacia adelante con la espalda recta, abre los brazos hacia los lados apretando la parte de atrás del hombro. Baja controlado.',
  },
  {
    nombre: 'Face pull',
    grupoMuscular: 'hombros',
    equipo: 'polea',
    instrucciones:
      'Con la polea a la altura de la cara y una cuerda, tira hacia la frente separando las manos y con los codos altos. Aprieta atrás un segundo y vuelve.',
  },

  // Bíceps
  {
    nombre: 'Curl con barra',
    grupoMuscular: 'biceps',
    equipo: 'barra',
    instrucciones:
      'De pie y con los codos pegados al cuerpo, sube la barra flectando los codos sin balancear el torso. Baja lento hasta estirar los brazos.',
  },
  {
    nombre: 'Curl con mancuernas',
    grupoMuscular: 'biceps',
    equipo: 'mancuernas',
    instrucciones:
      'Sube las mancuernas girando las palmas hacia arriba durante el recorrido. Mantén los codos quietos a los costados y baja controlado.',
  },
  {
    nombre: 'Curl martillo',
    grupoMuscular: 'biceps',
    equipo: 'mancuernas',
    instrucciones:
      'Con las palmas mirándose entre sí, sube las mancuernas sin mover los codos. Baja lento. También trabaja el antebrazo.',
  },
  {
    nombre: 'Curl predicador',
    grupoMuscular: 'biceps',
    equipo: 'barra',
    instrucciones:
      'Con la parte de atrás de los brazos apoyada en el atril, sube la barra Z sin despegar los codos. Baja hasta casi estirar los brazos.',
  },
  {
    nombre: 'Curl en polea',
    grupoMuscular: 'biceps',
    equipo: 'polea',
    instrucciones:
      'Frente a la polea baja y con los codos pegados al cuerpo, sube la barra hasta el pecho. La polea mantiene la tensión en todo el recorrido; baja lento.',
  },

  // Tríceps
  {
    nombre: 'Extensión de tríceps en polea',
    grupoMuscular: 'triceps',
    equipo: 'polea',
    instrucciones:
      'Con los codos pegados al cuerpo, empuja la barra o la cuerda hacia abajo hasta estirar los brazos. Sube solo hasta que los antebrazos queden paralelos al suelo.',
  },
  {
    nombre: 'Press francés',
    grupoMuscular: 'triceps',
    equipo: 'barra',
    instrucciones:
      'Acostado con la barra Z y los brazos verticales, flecta solo los codos y baja la barra hacia la frente. Estira los brazos sin abrir los codos.',
  },
  {
    nombre: 'Extensión de tríceps sobre la cabeza',
    grupoMuscular: 'triceps',
    equipo: 'mancuernas',
    instrucciones:
      'Sentado o de pie, sostén una mancuerna con ambas manos detrás de la cabeza. Estira los brazos hacia arriba con los codos apuntando al frente.',
  },
  {
    nombre: 'Fondos en banco',
    grupoMuscular: 'triceps',
    equipo: 'peso-corporal',
    instrucciones:
      'Con las manos en el borde de un banco y las piernas estiradas, baja flectando los codos hasta unos 90°. Empuja hasta estirar los brazos.',
  },
  {
    nombre: 'Press de banca agarre cerrado',
    grupoMuscular: 'triceps',
    equipo: 'barra',
    instrucciones:
      'Toma la barra con las manos al ancho de los hombros y baja con los codos pegados al cuerpo hasta la parte baja del pecho. Empuja con los tríceps.',
  },

  // Core
  {
    nombre: 'Plancha',
    grupoMuscular: 'core',
    equipo: 'peso-corporal',
    instrucciones:
      'Apoya antebrazos y puntas de los pies, con el cuerpo recto de cabeza a talones. Aprieta abdomen y glúteos y mantén la posición sin dejar caer la cadera.',
  },
  {
    nombre: 'Abdominales',
    grupoMuscular: 'core',
    equipo: 'peso-corporal',
    instrucciones:
      'Acostado con las rodillas flectadas, despega los hombros del suelo contrayendo el abdomen, sin tirar del cuello. Baja lento.',
  },
  {
    nombre: 'Elevación de piernas colgado',
    grupoMuscular: 'core',
    equipo: 'peso-corporal',
    instrucciones:
      'Colgado de una barra, sube las piernas hasta la altura de la cadera o más, sin balancearte. Baja controlado.',
  },
  {
    nombre: 'Rueda abdominal',
    grupoMuscular: 'core',
    equipo: 'otro',
    instrucciones:
      'De rodillas, rueda hacia adelante estirando el cuerpo tanto como puedas sin arquear la zona lumbar. Vuelve tirando con el abdomen.',
  },
  {
    nombre: 'Pallof press',
    grupoMuscular: 'core',
    equipo: 'polea',
    instrucciones:
      'De lado a la polea y con el agarre en el pecho, estira los brazos hacia adelante sin dejar que el cable te gire. Aguanta un segundo y vuelve.',
  },
]
