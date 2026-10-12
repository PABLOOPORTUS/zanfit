import type { Exercise } from '../types'

/** Catálogo de la app. Se carga al crear la base y, en la v5, se agregan a bases existentes los que falten (ver db/index.ts). */
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

  // Gimnasio: máquinas, poleas y máquina Smith
  {
    nombre: 'Press de pecho en máquina',
    grupoMuscular: 'pecho',
    equipo: 'maquina',
    instrucciones:
      'Ajusta el asiento para que los agarres queden a la altura de la mitad del pecho. Empuja hasta casi estirar los brazos sin despegar la espalda del respaldo y vuelve lento hasta sentir el estiramiento.',
  },
  {
    nombre: 'Press inclinado en máquina',
    grupoMuscular: 'pecho',
    equipo: 'maquina',
    instrucciones:
      'Con el respaldo inclinado, empuja los agarres hacia arriba y adelante desde la altura del pecho alto. Vuelve controlando el peso, sin que las placas choquen.',
  },
  {
    nombre: 'Press declinado en máquina',
    grupoMuscular: 'pecho',
    equipo: 'maquina',
    instrucciones:
      'Sentado con la espalda apoyada, empuja los agarres hacia adelante y abajo, en línea con la parte baja del pecho. Vuelve lento hasta sentir el estiramiento.',
  },
  {
    nombre: 'Aperturas en máquina',
    grupoMuscular: 'pecho',
    equipo: 'maquina',
    instrucciones:
      'Con la espalda apoyada y los codos levemente flectados, junta los brazos frente al pecho apretando los pectorales. Abre lento hasta que los codos queden a la altura de los hombros.',
  },
  {
    nombre: 'Press de banca en máquina Smith',
    grupoMuscular: 'pecho',
    equipo: 'smith',
    instrucciones:
      'Acuéstate con la barra sobre la mitad del pecho y desengánchala girando las muñecas. Baja controlado hasta rozar el pecho, empuja y, al terminar, vuelve a enganchar la barra.',
  },
  {
    nombre: 'Press inclinado en máquina Smith',
    grupoMuscular: 'pecho',
    equipo: 'smith',
    instrucciones:
      'Con el banco a 30–45° bajo la barra, bájala hasta la parte alta del pecho y empuja hasta casi estirar los brazos. Engancha la barra al terminar.',
  },
  {
    nombre: 'Aperturas en polea',
    grupoMuscular: 'pecho',
    equipo: 'polea',
    instrucciones:
      'Acostado en un banco plano entre dos poleas bajas, abre los brazos en arco con los codos levemente flectados. Júntalos sobre el pecho apretando los pectorales.',
  },
  {
    nombre: 'Aperturas inclinadas en polea',
    grupoMuscular: 'pecho',
    equipo: 'polea',
    instrucciones:
      'Igual que las aperturas en polea, pero con el banco inclinado, para trabajar más la parte alta del pecho. Baja lento hasta sentir el estiramiento.',
  },
  {
    nombre: 'Jalón con agarre supino',
    grupoMuscular: 'espalda',
    equipo: 'polea',
    instrucciones:
      'Toma la barra con las palmas hacia ti, al ancho de los hombros. Tira hacia la parte alta del pecho llevando los codos pegados al cuerpo y sube lento estirando completo.',
  },
  {
    nombre: 'Jalón con triángulo',
    grupoMuscular: 'espalda',
    equipo: 'polea',
    instrucciones:
      'Con el agarre en V (triángulo), tira hacia la parte alta del pecho inclinándote apenas hacia atrás. Junta las escápulas abajo y sube estirando los brazos.',
  },
  {
    nombre: 'Pullover en polea alta',
    grupoMuscular: 'espalda',
    equipo: 'polea',
    instrucciones:
      'De pie frente a la polea alta y con los brazos casi rectos, baja la barra en arco hasta los muslos. Sube lento hasta sentir el estiramiento de los dorsales.',
  },
  {
    nombre: 'Remo en T',
    grupoMuscular: 'espalda',
    equipo: 'maquina',
    instrucciones:
      'Con el torso inclinado y la espalda recta, tira los agarres hacia el abdomen juntando las escápulas. Baja estirando los brazos sin encorvar la espalda.',
  },
  {
    nombre: 'Hiperextensiones',
    grupoMuscular: 'espalda',
    equipo: 'peso-corporal',
    instrucciones:
      'Con la cadera apoyada en el borde del banco y los pies fijos, baja el torso con la espalda recta. Sube hasta alinear el cuerpo, sin arquear de más la zona lumbar.',
  },
  {
    nombre: 'Peso muerto en máquina Smith',
    grupoMuscular: 'espalda',
    equipo: 'smith',
    instrucciones:
      'Con la barra pegada a las piernas, baja llevando la cadera atrás y la espalda neutra. Sube empujando el suelo con las piernas hasta quedar de pie.',
  },
  {
    nombre: 'Sentadilla hack',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Con la espalda apoyada y los hombros bajo las almohadillas, quita los seguros y baja hasta que las rodillas formen unos 90°. Empuja con todo el pie sin bloquear las rodillas.',
  },
  {
    nombre: 'Sentadilla en máquina Smith',
    grupoMuscular: 'piernas',
    equipo: 'smith',
    instrucciones:
      'Con la barra sobre los trapecios y los pies un poco adelante, baja con la espalda recta hasta la paralela. Sube empujando con los talones.',
  },
  {
    nombre: 'Curl femoral sentado',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Sentado con el rodillo sobre los tobillos y los muslos fijos bajo la almohadilla, lleva los talones hacia abajo y atrás. Vuelve lento sin dejar caer el peso.',
  },
  {
    nombre: 'Curl femoral de pie',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'De pie en la máquina, con el rodillo detrás del tobillo, flecta una rodilla llevando el talón hacia el glúteo. Baja controlado y cambia de pierna.',
  },
  {
    nombre: 'Abductores en máquina',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Sentado con las almohadillas por fuera de las rodillas, abre las piernas hacia los lados. Aguanta un segundo y vuelve lento.',
  },
  {
    nombre: 'Patada de glúteo en polea',
    grupoMuscular: 'piernas',
    equipo: 'polea',
    instrucciones:
      'Con el tobillo enganchado a la polea baja y las manos apoyadas en la máquina, lleva la pierna hacia atrás con la rodilla casi recta. Aprieta el glúteo arriba y vuelve lento.',
  },
  {
    nombre: 'Pantorrillas sentado en máquina',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'Sentado con las rodillas bajo las almohadillas y la punta de los pies en la plataforma, baja los talones todo lo que puedas y sube lo más alto posible.',
  },
  {
    nombre: 'Pantorrillas en prensa',
    grupoMuscular: 'piernas',
    equipo: 'maquina',
    instrucciones:
      'En la prensa, con solo la punta de los pies en el borde de la plataforma y las piernas casi rectas, empuja con los dedos y vuelve hasta sentir el estiramiento.',
  },
  {
    nombre: 'Press de hombros en máquina',
    grupoMuscular: 'hombros',
    equipo: 'maquina',
    instrucciones:
      'Ajusta el asiento para que los agarres queden a la altura de los hombros. Empuja hacia arriba sin bloquear los codos y baja lento.',
  },
  {
    nombre: 'Elevaciones frontales en polea',
    grupoMuscular: 'hombros',
    equipo: 'polea',
    instrucciones:
      'De espaldas a la polea baja, con el agarre entre las piernas, sube el brazo recto hasta la altura de los hombros. Baja controlado.',
  },
  {
    nombre: 'Remo al mentón en polea',
    grupoMuscular: 'hombros',
    equipo: 'polea',
    instrucciones:
      'Con la barra de la polea baja, tira hacia el mentón llevando los codos hacia arriba y afuera, más altos que las manos. Baja lento.',
  },
  {
    nombre: 'Remo al mentón en máquina Smith',
    grupoMuscular: 'hombros',
    equipo: 'smith',
    instrucciones:
      'Con las manos más juntas que los hombros, sube la barra pegada al cuerpo hasta el pecho, con los codos más altos que las manos. Baja lento.',
  },
  {
    nombre: 'Pájaros en polea',
    grupoMuscular: 'hombros',
    equipo: 'polea',
    instrucciones:
      'Inclinado hacia adelante con la espalda recta, toma los cables cruzados de las poleas bajas y abre los brazos hacia los lados. Vuelve lento.',
  },
  {
    nombre: 'Encogimientos en polea',
    grupoMuscular: 'hombros',
    equipo: 'polea',
    instrucciones:
      'De pie frente a la polea baja con la barra en las manos, sube los hombros hacia las orejas sin flectar los codos. Aguanta un segundo y baja.',
  },
  {
    nombre: 'Encogimientos en máquina Smith',
    grupoMuscular: 'hombros',
    equipo: 'smith',
    instrucciones:
      'Con la barra frente a los muslos y los brazos estirados, sube los hombros hacia las orejas. Aguanta un segundo arriba y baja controlado.',
  },
  {
    nombre: 'Curl predicador en máquina',
    grupoMuscular: 'biceps',
    equipo: 'maquina',
    instrucciones:
      'Con los brazos apoyados en el atril y los codos alineados con el eje de la máquina, sube los agarres flectando los codos. Baja lento hasta casi estirar.',
  },
  {
    nombre: 'Curl martillo en polea',
    grupoMuscular: 'biceps',
    equipo: 'polea',
    instrucciones:
      'Con la cuerda en la polea baja y las palmas mirándose, sube las manos sin mover los codos. Baja lento.',
  },
  {
    nombre: 'Curl predicador en polea',
    grupoMuscular: 'biceps',
    equipo: 'polea',
    instrucciones:
      'Con el banco Scott frente a la polea baja, sube la barra sin despegar los brazos del atril. La polea mantiene la tensión abajo; baja lento.',
  },
  {
    nombre: 'Extensión de tríceps con cuerda',
    grupoMuscular: 'triceps',
    equipo: 'polea',
    instrucciones:
      'Con la cuerda en la polea alta y los codos pegados al cuerpo, empuja hacia abajo y separa las puntas de la cuerda al final. Sube hasta que los antebrazos queden paralelos al suelo.',
  },
  {
    nombre: 'Extensión de tríceps con agarre invertido',
    grupoMuscular: 'triceps',
    equipo: 'polea',
    instrucciones:
      'Toma la barra con las palmas hacia arriba y los codos pegados al cuerpo. Empuja hacia abajo hasta estirar los brazos y sube lento.',
  },
  {
    nombre: 'Extensión de tríceps a una mano en polea',
    grupoMuscular: 'triceps',
    equipo: 'polea',
    instrucciones:
      'Con un agarre simple en la polea alta, empuja hacia abajo con un brazo y el codo pegado al cuerpo. Haz todas las repeticiones y cambia de brazo.',
  },
  {
    nombre: 'Fondos en máquina',
    grupoMuscular: 'triceps',
    equipo: 'maquina',
    instrucciones:
      'Sentado con los agarres a los costados, empuja hacia abajo hasta estirar los brazos. Sube controlado hasta que los codos formen unos 90°.',
  },
  {
    nombre: 'Extensión de tríceps en máquina',
    grupoMuscular: 'triceps',
    equipo: 'maquina',
    instrucciones:
      'Con la parte de atrás de los brazos apoyada y los codos alineados con el eje, estira los brazos por completo. Vuelve lento.',
  },
  {
    nombre: 'Crunch en polea',
    grupoMuscular: 'core',
    equipo: 'polea',
    instrucciones:
      'Sentado de espaldas a la polea alta, con la cuerda junto a la cabeza, flecta el tronco llevando los codos hacia los muslos. Vuelve lento sin soltar la tensión.',
  },
]
