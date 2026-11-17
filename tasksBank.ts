import { Difficulty, GameId, GameMeta, TaskContent } from './types';
import {
  formatSpanishNumber,
  generateUniqueNumbers,
  numberToSpanish,
} from './spanishNumbers';

export const GAMES_META: GameMeta[] = [
  {
    id: GameId.NumerosRelampago,
    number: 1,
    emoji: '🔢',
    title: '¡Números relámpago!',
    shortDesc: 'Di cinco números en español del 1 al 10.000 lo más rápido posible.',
    armenianDesc: 'Արագ ասա հինգ թիվ իսպաներենով՝ 1-ից 10.000 սահմաններում։',
  },
  {
    id: GameId.PasadosVelocidad,
    number: 2,
    emoji: '⏳',
    title: '¡Pasados a toda velocidad!',
    shortDesc: 'Transforma la frase al tiempo pasado pedido (o a los 4 pasados).',
    armenianDesc: 'Արագ փոխակերպիր նախադասությունը պահանջված անցյալ ժամանակով (կամ բոլոր 4 անցյալներով)։',
  },
  {
    id: GameId.RespondeRapido,
    number: 3,
    emoji: '⚡',
    title: '¡Responde rápido!',
    shortDesc: 'Responde a la pregunta con una frase completa y lógica.',
    armenianDesc: 'Պատասխանիր հարցին ամբողջական և տրամաբանական նախադասությամբ։',
  },
  {
    id: GameId.MemoriaVerbos,
    number: 4,
    emoji: '🧠',
    title: '¡Memoria de verbos!',
    shortDesc: 'Memoriza 5 verbos en 5 segundos y conjúgalos cuando desaparezcan.',
    armenianDesc: 'Հիշիր 5 բայերը 5 վայրկյանում և խոնարհիր դրանք, երբ անհետանան։',
  },
  {
    id: GameId.TraduceRapidamente,
    number: 5,
    emoji: '🗣️',
    title: '¡Traduce rápidamente!',
    shortDesc: 'Traduce oralmente la frase del armenio al español.',
    armenianDesc: 'Բանավոր թարգմանիր հայերեն նախադասությունը իսպաներեն։',
  },
  {
    id: GameId.CorrigeError,
    number: 6,
    emoji: '🎯',
    title: '¡Corrige el error!',
    shortDesc: 'Encuentra y corrige el error gramatical antes de que acabe el tiempo.',
    armenianDesc: 'Գտիր և ուղղիր քերականական սխալը մինչև ժամանակի ավարտը։',
  },
  {
    id: GameId.SituacionesRapidas,
    number: 7,
    emoji: '⚽',
    title: '¡Situaciones rápidas!',
    shortDesc: 'Responde de forma natural en una situación cotidiana real.',
    armenianDesc: 'Բնական կերպով պատասխանիր իրական առօրյա իրավիճակում։',
  },
  {
    id: GameId.CincoPreguntas30s,
    number: 8,
    emoji: '🔥',
    title: '¡Cinco preguntas en 30 segundos!',
    shortDesc: 'Contesta hasta 5 preguntas rápidas antes de que pasen 30 segundos.',
    armenianDesc: 'Պատասխանիր 5 կարճ հարցի 30 վայրկյանի ընթացքում։',
  },
  {
    id: GameId.PalabrasEnAccion,
    number: 9,
    emoji: '🎲',
    title: '¡Palabras en acción!',
    shortDesc: 'Di en español las cinco palabras que aparecen en armenio.',
    armenianDesc: 'Ասա իսպաներենով էկրանին հայտնվող հինգ հայերեն բառերը։',
  },
  {
    id: GameId.DesafioFinal,
    number: 10,
    emoji: '🏆',
    title: '¡Desafío final!',
    shortDesc: 'Supera 5 pruebas combinadas: números, pasado, respuesta, traducción y error.',
    armenianDesc: 'Հաղթահարիր 5 համակցված առաջադրանք՝ թվեր, անցյալ ժամանակ, հարց, թարգմանություն և սխալի ուղղում։',
  },
];

// ==========================================
// GAME 2: Pasados a toda velocidad (18 items, each supports 1-tense and 4-tense mode)
// ==========================================
interface PasadoRaw {
  id: string;
  difficulty: Difficulty;
  base: string;
  baseHy: string;
  defaultTarget: 'Pretérito Perfecto' | 'Pretérito Indefinido' | 'Pretérito Imperfecto' | 'Pretérito Pluscuamperfecto';
  perfecto: string;
  indefinido: string;
  imperfecto: string;
  pluscuamperfecto: string;
}

const PASADOS_RAW: PasadoRaw[] = [
  {
    id: 'p1',
    difficulty: Difficulty.Facil,
    base: 'Yo juego al fútbol.',
    baseHy: 'Ես ֆուտբոլ եմ խաղում։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Yo he jugado al fútbol.',
    indefinido: 'Yo jugué al fútbol.',
    imperfecto: 'Yo jugaba al fútbol.',
    pluscuamperfecto: 'Yo había jugado al fútbol.',
  },
  {
    id: 'p2',
    difficulty: Difficulty.Facil,
    base: 'Ella come una manzana.',
    baseHy: 'Նա խնձոր է ուտում։',
    defaultTarget: 'Pretérito Perfecto',
    perfecto: 'Ella ha comido una manzana.',
    indefinido: 'Ella comió una manzana.',
    imperfecto: 'Ella comía una manzana.',
    pluscuamperfecto: 'Ella había comido una manzana.',
  },
  {
    id: 'p3',
    difficulty: Difficulty.Facil,
    base: 'Nosotros vivimos en Madrid.',
    baseHy: 'Մենք ապրում ենք Մադրիդում։',
    defaultTarget: 'Pretérito Imperfecto',
    perfecto: 'Nosotros hemos vivido en Madrid.',
    indefinido: 'Nosotros vivimos en Madrid.',
    imperfecto: 'Nosotros vivíamos en Madrid.',
    pluscuamperfecto: 'Nosotros habíamos vivido en Madrid.',
  },
  {
    id: 'p4',
    difficulty: Difficulty.Facil,
    base: 'Carlos termina sus deberes.',
    baseHy: 'Կառլոսը ավարտում է իր տնայինները։',
    defaultTarget: 'Pretérito Pluscuamperfecto',
    perfecto: 'Carlos ha terminado sus deberes.',
    indefinido: 'Carlos terminó sus deberes.',
    imperfecto: 'Carlos terminaba sus deberes.',
    pluscuamperfecto: 'Carlos había terminado sus deberes.',
  },
  {
    id: 'p5',
    difficulty: Difficulty.Facil,
    base: 'Tú estudias español en casa.',
    baseHy: 'Դու տանը իսպաներեն ես սովորում։',
    defaultTarget: 'Pretérito Perfecto',
    perfecto: 'Tú has estudiado español en casa.',
    indefinido: 'Tú estudiaste español en casa.',
    imperfecto: 'Tú estudiabas español en casa.',
    pluscuamperfecto: 'Tú habías estudiado español en casa.',
  },
  {
    id: 'p6',
    difficulty: Difficulty.Facil,
    base: 'Ellos hablan con la profesora.',
    baseHy: 'Նրանք խոսում են ուսուցչուհու հետ։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Ellos han hablado con la profesora.',
    indefinido: 'Ellos hablaron con la profesora.',
    imperfecto: 'Ellos hablaban con la profesora.',
    pluscuamperfecto: 'Ellos habían hablado con la profesora.',
  },
  {
    id: 'p7',
    difficulty: Difficulty.Medio,
    base: 'Yo voy al cine con mi hermano.',
    baseHy: 'Ես եղբորս հետ կինոթատրոն եմ գնում։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Yo he ido al cine con mi hermano.',
    indefinido: 'Yo fui al cine con mi hermano.',
    imperfecto: 'Yo iba al cine con mi hermano.',
    pluscuamperfecto: 'Yo había ido al cine con mi hermano.',
  },
  {
    id: 'p8',
    difficulty: Difficulty.Medio,
    base: 'Marta hace un pastel delicioso.',
    baseHy: 'Մարտան համեղ տորթ է պատրաստում։',
    defaultTarget: 'Pretérito Perfecto',
    perfecto: 'Marta ha hecho un pastel delicioso.',
    indefinido: 'Marta hizo un pastel delicioso.',
    imperfecto: 'Marta hacía un pastel delicioso.',
    pluscuamperfecto: 'Marta había hecho un pastel delicioso.',
  },
  {
    id: 'p9',
    difficulty: Difficulty.Medio,
    base: 'Nosotros tenemos mucha suerte.',
    baseHy: 'Մենք շատ բախտավոր ենք։',
    defaultTarget: 'Pretérito Imperfecto',
    perfecto: 'Nosotros hemos tenido mucha suerte.',
    indefinido: 'Nosotros tuvimos mucha suerte.',
    imperfecto: 'Nosotros teníamos mucha suerte.',
    pluscuamperfecto: 'Nosotros habíamos tenido mucha suerte.',
  },
  {
    id: 'p10',
    difficulty: Difficulty.Medio,
    base: 'Tú escribes una carta larga.',
    baseHy: 'Դու երկար նամակ ես գրում։',
    defaultTarget: 'Pretérito Pluscuamperfecto',
    perfecto: 'Tú has escrito una carta larga.',
    indefinido: 'Tú escribiste una carta larga.',
    imperfecto: 'Tú escribías una carta larga.',
    pluscuamperfecto: 'Tú habías escrito una carta larga.',
  },
  {
    id: 'p11',
    difficulty: Difficulty.Medio,
    base: 'Ellos ven una película divertida.',
    baseHy: 'Նրանք զվարճալի ֆիլմ են դիտում։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Ellos han visto una película divertida.',
    indefinido: 'Ellos vieron una película divertida.',
    imperfecto: 'Ellos veían una película divertida.',
    pluscuamperfecto: 'Ellos habían visto una película divertida.',
  },
  {
    id: 'p12',
    difficulty: Difficulty.Medio,
    base: 'Él dice siempre la verdad.',
    baseHy: 'Նա միշտ ճշմարտությունն է ասում։',
    defaultTarget: 'Pretérito Perfecto',
    perfecto: 'Él ha dicho siempre la verdad.',
    indefinido: 'Él dijo siempre la verdad.',
    imperfecto: 'Él decía siempre la verdad.',
    pluscuamperfecto: 'Él había dicho siempre la verdad.',
  },
  {
    id: 'p13',
    difficulty: Difficulty.Dificil,
    base: 'Yo pongo los libros encima de la mesa.',
    baseHy: 'Ես գրքերը դնում եմ սեղանի վրա։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Yo he puesto los libros encima de la mesa.',
    indefinido: 'Yo puse los libros encima de la mesa.',
    imperfecto: 'Yo ponía los libros encima de la mesa.',
    pluscuamperfecto: 'Yo había puesto los libros encima de la mesa.',
  },
  {
    id: 'p14',
    difficulty: Difficulty.Dificil,
    base: 'Vosotros sabéis la respuesta correcta.',
    baseHy: 'Դուք գիտեք ճիշտ պատասխանը։',
    defaultTarget: 'Pretérito Imperfecto',
    perfecto: 'Vosotros habéis sabido la respuesta correcta.',
    indefinido: 'Vosotros supisteis la respuesta correcta.',
    imperfecto: 'Vosotros sabíais la respuesta correcta.',
    pluscuamperfecto: 'Vosotros habíais sabido la respuesta correcta.',
  },
  {
    id: 'p15',
    difficulty: Difficulty.Dificil,
    base: 'Ellos vienen temprano al entrenamiento.',
    baseHy: 'Նրանք շուտ են գալիս մարզմանը։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Ellos han venido temprano al entrenamiento.',
    indefinido: 'Ellos vinieron temprano al entrenamiento.',
    imperfecto: 'Ellos venían temprano al entrenamiento.',
    pluscuamperfecto: 'Ellos habían venido temprano al entrenamiento.',
  },
  {
    id: 'p16',
    difficulty: Difficulty.Dificil,
    base: 'Nosotros podemos resolver el problema.',
    baseHy: 'Մենք կարողանում ենք լուծել խնդիրը։',
    defaultTarget: 'Pretérito Pluscuamperfecto',
    perfecto: 'Nosotros hemos podido resolver el problema.',
    indefinido: 'Nosotros pudimos resolver el problema.',
    imperfecto: 'Nosotros podíamos resolver el problema.',
    pluscuamperfecto: 'Nosotros habíamos podido resolver el problema.',
  },
  {
    id: 'p17',
    difficulty: Difficulty.Dificil,
    base: 'Laura abre la ventana antes de dormir.',
    baseHy: 'Լաուրան քնելուց առաջ բացում է պատուհանը։',
    defaultTarget: 'Pretérito Perfecto',
    perfecto: 'Laura ha abierto la ventana antes de dormir.',
    indefinido: 'Laura abrió la ventana antes de dormir.',
    imperfecto: 'Laura abría la ventana antes de dormir.',
    pluscuamperfecto: 'Laura había abierto la ventana antes de dormir.',
  },
  {
    id: 'p18',
    difficulty: Difficulty.Dificil,
    base: 'Tú traes las entradas para el partido.',
    baseHy: 'Դու բերում ես խաղի տոմսերը։',
    defaultTarget: 'Pretérito Indefinido',
    perfecto: 'Tú has traído las entradas para el partido.',
    indefinido: 'Tú trajiste las entradas para el partido.',
    imperfecto: 'Tú traías las entradas para el partido.',
    pluscuamperfecto: 'Tú habías traído las entradas para el partido.',
  },
];

// ==========================================
// GAME 3: ¡Responde rápido! (18 items)
// ==========================================
const RESPONDE_BANK: TaskContent[] = [
  {
    id: 'r1',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué hiciste ayer?',
    promptHy: 'Երեկ ի՞նչ արեցիր։',
    answerEs: 'Ejemplo: Ayer fui al parque con mis amigos.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r2',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué desayunaste esta mañana?',
    promptHy: 'Այսօր առավոտյան ի՞նչ նախաճաշեցիր։',
    answerEs: 'Ejemplo: Esta mañana desayuné pan con queso y té.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r3',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Dónde estuviste el domingo pasado?',
    promptHy: 'Անցյալ կիրակի որտե՞ղ էիր։',
    answerEs: 'Ejemplo: Estuve en casa de mis abuelos.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r4',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿A qué hora te levantaste hoy?',
    promptHy: 'Այսօր ժամը քանիսի՞ն արթնացար։',
    answerEs: 'Ejemplo: Hoy me levanté a las ocho de la mañana.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r5',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué deporte practicaste la semana pasada?',
    promptHy: 'Անցյալ շաբաթ ի՞նչ սպորտով զբաղվեցիր։',
    answerEs: 'Ejemplo: La semana pasada jugué al fútbol con mi equipo.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r6',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Cuál es tu comida favorita y por qué?',
    promptHy: 'Ո՞րն է քո սիրելի ուտելիքը և ինչո՞ւ։',
    answerEs: 'Ejemplo: Mi comida favorita es la pizza porque está muy rica.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r7',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué estabas haciendo ayer a las ocho de la tarde?',
    promptHy: 'Երեկ երեկոյան ժամը ութին ի՞նչ էիր անում։',
    answerEs: 'Ejemplo: Estaba viendo una película con mi familia.',
    answerNoteEs: 'Usa el Pretérito Imperfecto o estar + gerundio en imperfecto.',
  },
  {
    id: 'r8',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Has viajado alguna vez a España o a otro país?',
    promptHy: 'Երբևէ ճանապարհորդե՞լ ես Իսպանիա կամ այլ երկիր։',
    answerEs: 'Ejemplo: Sí, he viajado a España el verano pasado / Todavía no he viajado, pero me gustaría.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica en Pretérito Perfecto.',
  },
  {
    id: 'r9',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué música escuchabas cuando eras más pequeño?',
    promptHy: 'Ի՞նչ երաժշտություն էիր լսում, երբ ավելի փոքր էիր։',
    answerEs: 'Ejemplo: Cuando era más pequeño, escuchaba canciones infantiles.',
    answerNoteEs: 'Se espera uso del Pretérito Imperfecto.',
  },
  {
    id: 'r10',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Has terminado ya todos tus deberes esta semana?',
    promptHy: 'Այս շաբաթ արդեն ավարտե՞լ ես քո բոլոր տնային աշխատանքները։',
    answerEs: 'Ejemplo: Sí, ya he terminado todos mis deberes.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica en Pretérito Perfecto.',
  },
  {
    id: 'r11',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿A quién viste por última vez antes de venir a clase?',
    promptHy: 'Ո՞ւմ տեսար վերջին անգամ դասի գալուց առաջ։',
    answerEs: 'Ejemplo: Antes de venir a clase vi a mi madre.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica y gramaticalmente correcta.',
  },
  {
    id: 'r12',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde rápido con una frase completa.',
    instructionHy: 'Արագ պատասխանիր ամբողջական նախադասությամբ։',
    promptEs: '¿Qué película o libro te gustó más este año?',
    promptHy: 'Այս տարի ո՞ր ֆիլմը կամ գիրքը քեզ ամենաշատը դուր եկավ։',
    answerEs: 'Ejemplo: Este año me gustó mucho una película de aventuras.',
    answerNoteEs: 'Se acepta cualquier respuesta lógica.',
  },
  {
    id: 'r13',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: '¿Qué habías hecho antes de salir de casa esta mañana?',
    promptHy: 'Ի՞նչ էիր արել այսօր առավոտյան տնից դուրս գալուց առաջ։',
    answerEs: 'Ejemplo: Antes de salir de casa, había desayunado y había preparado mi mochila.',
    answerNoteEs: 'Se recomienda usar el Pretérito Pluscuamperfecto.',
  },
  {
    id: 'r14',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: 'Cuando llegaste ayer a casa, ¿qué habían preparado para cenar?',
    promptHy: 'Երբ երեկ տուն հասար, ի՞նչ էին պատրաստել ընթրիքի համար։',
    answerEs: 'Ejemplo: Cuando llegué a casa, mis padres habían preparado sopa y ensalada.',
    answerNoteEs: 'Combina Indefinido + Pluscuamperfecto.',
  },
  {
    id: 'r15',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: '¿Qué hacías normalmente los veranos cuando tenías seis años?',
    promptHy: 'Սովորաբար ի՞նչ էիր անում ամռանը, երբ վեց տարեկան էիր։',
    answerEs: 'Ejemplo: Cuando tenía seis años, iba al pueblo y jugaba en el jardín todos los días.',
    answerNoteEs: 'Uso natural del Pretérito Imperfecto.',
  },
  {
    id: 'r16',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: '¿Alguna vez olvidaste algo importante en el colegio? ¿Qué pasó después?',
    promptHy: 'Երբևէ դպրոցում կարևոր բան մոռացե՞լ ես։ Հետո ի՞նչ եղավ։',
    answerEs: 'Ejemplo: Una vez olvidé mi cuaderno en clase, pero al día siguiente lo encontré.',
    answerNoteEs: 'Respuesta libre coherente en pasado.',
  },
  {
    id: 'r17',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: 'Si pudieras viajar mañana a cualquier ciudad del mundo, ¿adónde irías y qué harías?',
    promptHy: 'Եթե վաղը կարողանայիր մեկնել աշխարհի ցանկացած քաղաք, ու՞ր կգնայիր և ի՞նչ կանեիր։',
    answerEs: 'Ejemplo: Iría a Barcelona y visitaría el estadio y la playa.',
    answerNoteEs: 'Se acepta condicional o futuro cercano.',
  },
  {
    id: 'r18',
    gameId: GameId.RespondeRapido,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde rápido con una frase completa y detallada.',
    instructionHy: 'Արագ պատասխանիր ամբողջական և մանրամասն նախադասությամբ։',
    promptEs: '¿Qué estabas haciendo cuando empezó la última tormenta o lluvia fuerte?',
    promptHy: 'Ի՞նչ էիր անում, երբ սկսվեց վերջին ուժեղ անձրևը կամ փոթորիկը։',
    answerEs: 'Ejemplo: Estaba estudiando en mi habitación cuando empezó a llover fuerte.',
    answerNoteEs: 'Imperfecto continuo + Indefinido.',
  },
];

// ==========================================
// GAME 4: ¡Memoria de verbos! (12 sets)
// ==========================================
const MEMORIA_BANK: TaskContent[] = [
  {
    id: 'm1',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Facil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Ir', 'Tener', 'Hacer', 'Decir', 'Venir'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 1ª persona del singular (yo)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ առաջին դեմքով (yo)։',
    answerEs: 'Fui — Tuve — Hice — Dije — Vine',
  },
  {
    id: 'm2',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Facil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Ser', 'Estar', 'Poder', 'Poner', 'Querer'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 1ª persona del singular (yo)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ առաջին դեմքով (yo)։',
    answerEs: 'Fui — Estuve — Pude — Puse — Quise',
  },
  {
    id: 'm3',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Facil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Comer', 'Beber', 'Vivir', 'Hablar', 'Jugar'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Perfecto, en 1ª persona del singular (yo)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Perfecto ժամանակով՝ առաջին դեմքով (yo)։',
    answerEs: 'He comido — He bebido — He vivido — He hablado — He jugado',
  },
  {
    id: 'm4',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Facil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Ir', 'Ser', 'Ver', 'Tener', 'Hacer'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Imperfecto, en 1ª persona del singular (yo)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Imperfecto ժամանակով՝ առաջին դեմքով (yo)։',
    answerEs: 'Iba — Era — Veía — Tenía — Hacía',
  },
  {
    id: 'm5',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Medio,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Saber', 'Traer', 'Dar', 'Ver', 'Salir'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 3ª persona del singular (él/ella)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ երրորդ դեմքով (él/ella)։',
    answerEs: 'Supo — Trajo — Dio — Vio — Salió',
  },
  {
    id: 'm6',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Medio,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Hacer', 'Decir', 'Escribir', 'Abrir', 'Romper'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Perfecto, en 1ª persona del plural (nosotros)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Perfecto ժամանակով՝ հոգնակի առաջին դեմքով (nosotros)։',
    answerEs: 'Hemos hecho — Hemos dicho — Hemos escrito — Hemos abierto — Hemos roto',
  },
  {
    id: 'm7',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Medio,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Ir', 'Tener', 'Estar', 'Venir', 'Poder'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 1ª persona del plural (nosotros)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ հոգնակի առաջին դեմքով (nosotros)։',
    answerEs: 'Fuimos — Tuvimos — Estuvimos — Vinimos — Pudimos',
  },
  {
    id: 'm8',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Medio,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Jugar', 'Leer', 'Dormir', 'Caminar', 'Ir'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Imperfecto, en 3ª persona del plural (ellos)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Imperfecto ժամանակով՝ հոգնակի երրորդ դեմքով (ellos)։',
    answerEs: 'Jugaban — Leían — Dormían — Caminaban — Iban',
  },
  {
    id: 'm9',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Conducir', 'Traer', 'Decir', 'Querer', 'Poner'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 3ª persona del plural (ellos)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ հոգնակի երրորդ դեմքով (ellos)։',
    answerEs: 'Condujeron — Trajeron — Dijeron — Quisieron — Pusieron',
  },
  {
    id: 'm10',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Volver', 'Ver', 'Poner', 'Hacer', 'Decir'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Pluscuamperfecto, en 2ª persona del singular (tú)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Pluscuamperfecto ժամանակով՝ երկրորդ դեմքով (tú)։',
    answerEs: 'Habías vuelto — Habías visto — Habías puesto — Habías hecho — Habías dicho',
  },
  {
    id: 'm11',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Caber', 'Andar', 'Saber', 'Venir', 'Tener'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 1ª persona del singular (yo)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ առաջին դեմքով (yo)։',
    answerEs: 'Cupe — Anduve — Supe — Vine — Tuve',
  },
  {
    id: 'm12',
    gameId: GameId.MemoriaVerbos,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Memoriza los 5 verbos durante 5 segundos.',
    instructionHy: 'Հիշիր 5 բայերը 5 վայրկյանում։',
    memoryVerbs: ['Dormir', 'Pedir', 'Sentir', 'Leer', 'Construir'],
    memoryCommandEs: '¡Di los cinco verbos en Pretérito Indefinido, en 3ª persona del singular (él/ella)!',
    memoryCommandHy: 'Ասա հինգ բայերը Pretérito Indefinido ժամանակով՝ երրորդ դեմքով (él/ella)։',
    answerEs: 'Durmió — Pidió — Sintió — Leyó — Construyó',
  },
];

// ==========================================
// GAME 5: ¡Traduce rápidamente! (18 items)
// ==========================================
const TRADUCE_BANK: TaskContent[] = [
  {
    id: 't1',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Ուշադրություն դարձրու անցյալ կատարյալ ժամանակին (Pretérito Indefinido)։',
    promptEs: 'Երեկ ես գնացի դպրոց։',
    answerEs: 'Ayer fui al colegio.',
  },
  {
    id: 't2',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Indefinido (անցյալ շաբաթ)։',
    promptEs: 'Անցյալ շաբաթ ես ֆուտբոլ խաղացի։',
    answerEs: 'La semana pasada jugué al fútbol.',
  },
  {
    id: 't3',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր ներկա ժամանակ (Presente)։',
    promptEs: 'Ամեն օր ես սովորում եմ իսպաներեն։',
    answerEs: 'Todos los días estudio español.',
  },
  {
    id: 't4',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Perfecto (այսօր առավոտյան)։',
    promptEs: 'Այսօր առավոտյան ես կերա մեկ խնձոր։',
    answerEs: 'Esta mañana he comido una manzana.',
  },
  {
    id: 't5',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր ապառնի ժամանակ (ir a + infinitivo կամ Futuro)։',
    promptEs: 'Վաղը մենք գնալու ենք այգի։',
    answerEs: 'Mañana vamos a ir al parque. / Mañana iremos al parque.',
  },
  {
    id: 't6',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Facil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Indefinido (երեկ երեկոյան)։',
    promptEs: 'Երեկ երեկոյան մենք դիտեցինք մի լավ ֆիլմ։',
    answerEs: 'Anoche vimos una buena película.',
  },
  {
    id: 't7',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Ուշադրություն դարձրու Pretérito Imperfecto ժամանակին (սովորություն անցյալում)։',
    promptEs: 'Երբ փոքր էի, ամեն օր զբոսնում էի։',
    answerEs: 'Cuando era pequeño, paseaba todos los días.',
  },
  {
    id: 't8',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Ուշադրություն դարձրու Pretérito Pluscuamperfecto ժամանակին (արդեն ավարտել էի)։',
    promptEs: 'Ես արդեն ավարտել էի տնային աշխատանքս։',
    answerEs: 'Ya había terminado mis deberes.',
  },
  {
    id: 't9',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Perfecto (այս շաբաթ)։',
    promptEs: 'Այս շաբաթ մենք շատ նոր բառեր ենք սովորել։',
    answerEs: 'Esta semana hemos aprendido muchas palabras nuevas.',
  },
  {
    id: 't10',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Imperfecto (ներկայացնել անցյալ իրավիճակ)։',
    promptEs: 'Իմ պապիկը ապրում էր մի գեղեցիկ գյուղում։',
    answerEs: 'Mi abuelo vivía en un pueblo bonito.',
  },
  {
    id: 't11',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Indefinido (հյուրեր գալ)։',
    promptEs: 'Անցյալ ամիս իմ ընկերները եկան իմ տուն։',
    answerEs: 'El mes pasado mis amigos vinieron a mi casa.',
  },
  {
    id: 't12',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Medio,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Futuro (հաջորդ ամառ)։',
    promptEs: 'Հաջորդ ամառ մենք կճանապարհորդենք Մադրիդ։',
    answerEs: 'El próximo verano viajaremos a Madrid.',
  },
  {
    id: 't13',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Համադրիր Indefinido և Pluscuamperfecto։',
    promptEs: 'Երբ ես հասա կայարան, գնացքը արդեն մեկնել էր։',
    answerEs: 'Cuando llegué a la estación, el tren ya había salido.',
  },
  {
    id: 't14',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Համադրիր Imperfecto և Indefinido։',
    promptEs: 'Երբ ես գիրք էի կարդում, հեռախոսը հնչեց։',
    answerEs: 'Mientras leía un libro, sonó el teléfono.',
  },
  {
    id: 't15',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Perfecto ժխտական ձևով։',
    promptEs: 'Ես դեռ չեմ տեսել իմ իսպաներենի ուսուցչին այսօր։',
    answerEs: 'Todavía no he visto a mi profesor de español hoy.',
  },
  {
    id: 't16',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pluscuamperfecto։',
    promptEs: 'Մինչ այդ օրը նա երբեք չէր խաղացել թենիս։',
    answerEs: 'Hasta aquel día, él nunca había jugado al tenis.',
  },
  {
    id: 't17',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Օգտագործիր Pretérito Indefinido (հարցական)։',
    promptEs: 'Ինչո՞ւ դու չեկար երեկ մարզմանը։',
    answerEs: '¿Por qué no viniste ayer al entrenamiento?',
  },
  {
    id: 't18',
    gameId: GameId.TraduceRapidamente,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Traduce esta frase del armenio al español.',
    instructionHy: 'Համադրիր Futuro և Presente։',
    promptEs: 'Հաջորդ տարի ես կսովորեմ խոսել իսպաներեն շատ արագ։',
    answerEs: 'El año que viene aprenderé a hablar español muy rápido.',
  },
];

// ==========================================
// GAME 6: ¡Corrige el error! (18 items)
// ==========================================
const CORRIGE_BANK: TaskContent[] = [
  {
    id: 'c1',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ayer yo he fui al cine.',
    promptHy: 'Երեկ ես գնացի կինոթատրոն։ (Ստուգիր «ayer»-ի հետ անցյալ ժամանակը։)',
    answerEs: 'Ayer fui al cine.',
  },
  {
    id: 'c2',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Nosotros ha terminado los deberes.',
    promptHy: 'Մենք ավարտել ենք տնային աշխատանքները։ (Ստուգիր «nosotros»-ի ձևը։)',
    answerEs: 'Nosotros hemos terminado los deberes.',
  },
  {
    id: 'c3',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Yo teno un perro muy grande.',
    promptHy: 'Ես շատ մեծ շուն ունեմ։ (Ստուգիր «tener» բայի խոնարհումը։)',
    answerEs: 'Yo tengo un perro muy grande.',
  },
  {
    id: 'c4',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ella fue a la escuela todos los días cuando era niña.',
    promptHy: 'Երբ նա փոքր աղջիկ էր, ամեն օր գնում էր դպրոց։ (Կրկնվող գործողությունը պահանջում է Imperfecto։)',
    answerEs: 'Ella iba a la escuela todos los días cuando era niña.',
  },
  {
    id: 'c5',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'El libro son muy interesante.',
    promptHy: 'Գիրքը շատ հետաքրքիր է։ (Ստուգիր ենթակայի և բայի թիվը։)',
    answerEs: 'El libro es muy interesante.',
  },
  {
    id: 'c6',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Facil,
    timeLimitSec: 25,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ayer mi hermano comió una pizza y bebó agua.',
    promptHy: 'Երեկ եղբայրս պիցցա կերավ և ջուր խմեց։ (Ստուգիր «beber» բայի անցյալ ձևը։)',
    answerEs: 'Ayer mi hermano comió una pizza y bebió agua.',
  },
  {
    id: 'c7',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Cuando era pequeño, jugué al fútbol todos los días.',
    promptHy: 'Երբ փոքր էի, ամեն օր ֆուտբոլ էի խաղում։ (Սովորությունը պահանջում է Imperfecto։)',
    answerEs: 'Cuando era pequeño, jugaba al fútbol todos los días.',
  },
  {
    id: 'c8',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ella tenía comido antes de salir.',
    promptHy: 'Նա դուրս գալուց առաջ կերել էր։ (Pluscuamperfecto-ն կազմվում է «había»-ով։)',
    answerEs: 'Ella había comido antes de salir.',
  },
  {
    id: 'c9',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Hoy he escribido una carta a mi abuela.',
    promptHy: 'Այսօր նամակ եմ գրել տատիկիս։ (Ստուգիր «escribir» բայի անկանոն դերբայը։)',
    answerEs: 'Hoy he escrito una carta a mi abuela.',
  },
  {
    id: 'c10',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'El año pasado nosotros fuemos de vacaciones a Valencia.',
    promptHy: 'Անցյալ տարի մենք արձակուրդ գնացինք Վալենսիա։ (Ստուգիր «ir» բայի ձևը nosotros-ի համար։)',
    answerEs: 'El año pasado nosotros fuimos de vacaciones a Valencia.',
  },
  {
    id: 'c11',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: '¿Tú hiciste los deberes hoy por la mañana ya?',
    promptHy: 'Այսօր առավոտյան արդեն արե՞լ ես տնայիններդ։ («hoy»-ի հետ օգտագործիր Pretérito Perfecto։)',
    answerEs: '¿Has hecho los deberes hoy por la mañana ya? (o: ¿Ya has hecho los deberes hoy?)',
  },
  {
    id: 'c12',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Medio,
    timeLimitSec: 20,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Yo no sabí la respuesta del examen.',
    promptHy: 'Ես չգիտեի քննության պատասխանը։ (Ստուգիր «saber» բայի անցյալ ձևը։)',
    answerEs: 'Yo no sabía la respuesta del examen. / Yo no supe la respuesta del examen.',
  },
  {
    id: 'c13',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Cuando llegué al estadio, el partido ya empezó antes.',
    promptHy: 'Երբ ես հասա մարզադաշտ, խաղն արդեն սկսվել էր։ (Ավելի վաղ գործողությունը պահանջում է Pluscuamperfecto։)',
    answerEs: 'Cuando llegué al estadio, el partido ya había empezado.',
  },
  {
    id: 'c14',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Mis amigos dijeron que han estado en casa ayer.',
    promptHy: 'Իմ ընկերներն ասացին, որ երեկ տանն են եղել։ («ayer»-ի հետ օգտագործիր Indefinido կամ Pluscuamperfecto։)',
    answerEs: 'Mis amigos dijeron que estuvieron (o habían estado) en casa ayer.',
  },
  {
    id: 'c15',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ellos ponieron las mochilas debajo de la silla.',
    promptHy: 'Նրանք պայուսակները դրեցին աթոռի տակ։ (Ստուգիր «poner» բայի անկանոն անցյալ ձևը։)',
    answerEs: 'Ellos pusieron las mochilas debajo de la silla.',
  },
  {
    id: 'c16',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: '¿Has rompido el vaso de cristal sin querer?',
    promptHy: 'Անզգուշությամբ կոտրե՞լ ես ապակե բաժակը։ (Ստուգիր «romper» բայի անկանոն դերբայը։)',
    answerEs: '¿Has roto el vaso de cristal sin querer?',
  },
  {
    id: 'c17',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Mientras yo estudié en mi cuarto, mi hermana tocaba el piano.',
    promptHy: 'Մինչ ես սենյակումս սովորում էի, քույրս դաշնամուր էր նվագում։ («Mientras»-ի հետ պահանջվում է Imperfecto։)',
    answerEs: 'Mientras yo estudiaba en mi cuarto, mi hermana tocaba el piano.',
  },
  {
    id: 'c18',
    gameId: GameId.CorrigeError,
    difficulty: Difficulty.Dificil,
    timeLimitSec: 15,
    instructionEs: 'Encuentra el error en la frase y dila correctamente.',
    instructionHy: 'Գտիր սխալը նախադասության մեջ և ասա ճիշտ տարբերակը։',
    promptEs: 'Ayer Marta me dició que vendrá mañana.',
    promptHy: 'Երեկ Մարտան ինձ ասաց, որ վաղը կգա։ (Ստուգիր «decir» բայի անկանոն անցյալ ձևը։)',
    answerEs: 'Ayer Marta me dijo que vendrá mañana.',
  },
];

// ==========================================
// GAME 7: ¡Situaciones rápidas! (16 items covering all 10 locations)
// ==========================================
const SITUACIONES_BANK: TaskContent[] = [
  {
    id: 's1',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en un restaurante y quieres pedir agua. ¿Qué dices?',
    promptHy: 'Դու ռեստորանում ես և ուզում ես ջուր պատվիրել։ Ի՞նչ կասես։',
    answerEs: 'Ejemplo: Quiero una botella de agua, por favor. / ¿Me puede traer agua, por favor?',
    answerNoteEs: 'Respuesta natural y educada.',
  },
  {
    id: 's2',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en un hotel y no encuentras tu habitación. ¿Qué preguntas?',
    promptHy: 'Դու հյուրանոցում ես և չես գտնում քո սենյակը։ Ի՞նչ կհարցնես։',
    answerEs: 'Ejemplo: Perdona, ¿dónde está mi habitación?',
    answerNoteEs: 'Se acepta cualquier pregunta natural y cortés.',
  },
  {
    id: 's3',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el estadio y tu entrenador te pregunta qué hiciste ayer. ¿Qué respondes?',
    promptHy: 'Դու մարզադաշտում ես, և մարզիչդ հարցնում է, թե երեկ ինչ արեցիր։ Ի՞նչ կպատասխանես։',
    answerEs: 'Ejemplo: Ayer entrené con mi equipo y corrí mucho.',
    answerNoteEs: 'Se acepta cualquier respuesta natural en pasado.',
  },
  {
    id: 's4',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el supermercado y quieres saber cuánto cuesta el pan. ¿Qué dices?',
    promptHy: 'Դու սուպերմարկետում ես և ուզում ես իմանալ՝ որքան արժե հացը։ Ի՞նչ կասես։',
    answerEs: 'Ejemplo: Disculpe, ¿cuánto cuesta el pan?',
    answerNoteEs: 'Se acepta cualquier pregunta natural sobre el precio.',
  },
  {
    id: 's5',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el colegio y no entiendes un ejercicio. ¿Qué le dices al profesor?',
    promptHy: 'Դու դպրոցում ես և չես հասկանում վարժությունը։ Ի՞նչ կասես ուսուցչին։',
    answerEs: 'Ejemplo: Profe, no entiendo este ejercicio. ¿Me lo puede explicar otra vez?',
    answerNoteEs: 'Se acepta cualquier petición educada.',
  },
  {
    id: 's6',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Facil,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en casa y tienes mucha hambre. ¿Qué le preguntas a tu madre?',
    promptHy: 'Դու տանն ես և շատ սոված ես։ Ի՞նչ կհարցնես մայրիկիդ։',
    answerEs: 'Ejemplo: Mamá, tengo mucha hambre, ¿qué vamos a cenar hoy?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's7',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el autobús y no sabes cuál es la parada para ir al centro. ¿Qué preguntas?',
    promptHy: 'Դու ավտոբուսում ես և չգիտես՝ որ կանգառում պետք է իջնես կենտրոն գնալու համար։ Ի՞նչ կհարցնես։',
    answerEs: 'Ejemplo: Perdona, ¿me puedes decir en qué parada tengo que bajar para ir al centro?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's8',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el aeropuerto y no encuentras la puerta de embarque de tu vuelo. ¿Qué preguntas?',
    promptHy: 'Դու օդանավակայանում ես և չես գտնում քո թռիչքի նստեցման դարպասը։ Ի՞նչ կհարցնես։',
    answerEs: 'Ejemplo: Disculpe, ¿dónde está la puerta de embarque para el vuelo a Madrid?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's9',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás de vacaciones en la playa y un amigo te pregunta qué has hecho hoy. ¿Qué respondes?',
    promptHy: 'Դու արձակուրդում ես ծովափին, և ընկերդ հարցնում է, թե այսօր ինչ ես արել։ Ի՞նչ կպատասխանես։',
    answerEs: 'Ejemplo: Hoy he nadado en el mar y he jugado al voleibol en la playa.',
    answerNoteEs: 'Uso natural del Pretérito Perfecto.',
  },
  {
    id: 's10',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás con amigos y queréis decidir qué hacer el sábado por la tarde. ¿Qué propones?',
    promptHy: 'Դու ընկերներիդ հետ ես և ուզում եք որոշել, թե ինչ անեք շաբաթ երեկոյան։ Ի՞նչ կառաջարկես։',
    answerEs: 'Ejemplo: ¿Y si vamos al cine o jugamos un partido de fútbol en el parque?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's11',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el restaurante, ya terminaste de comer y quieres pagar. ¿Qué dices al camarero?',
    promptHy: 'Դու ռեստորանում ես, արդեն ավարտել ես ուտելը և ուզում ես վճարել։ Ի՞նչ կասես մատուցողին։',
    answerEs: 'Ejemplo: Perdona, ¿nos trae la cuenta, por favor?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's12',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Medio,
    instructionEs: 'Imagina la situación y responde con naturalidad.',
    instructionHy: 'Պատկերացրու իրավիճակը և բնական պատասխան տուր։',
    promptEs: 'Estás en el supermercado y necesitas encontrar fruta fresca. ¿Qué preguntas?',
    promptHy: 'Դու սուպերմարկետում ես և փնտրում ես թարմ մրգեր։ Ի՞նչ կհարցնես։',
    answerEs: 'Ejemplo: Perdona, ¿en qué pasillo está la fruta?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's13',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Imagina la situación y responde con una explicación completa.',
    instructionHy: 'Պատկերացրու իրավիճակը և տուր ամբողջական բացատրություն։',
    promptEs: 'Llegaste tarde al colegio porque perdiste el autobús. Explícaselo a tu profesora.',
    promptHy: 'Դու ուշացել ես դպրոցից, որովհետև բաց ես թողել ավտոբուսը։ Բացատրիր ուսուցչուհուն։',
    answerEs: 'Ejemplo: Lo siento mucho, profesora. Salí de casa tarde y cuando llegué a la parada, el autobús ya había pasado.',
    answerNoteEs: 'Combina pasado y disculpa natural.',
  },
  {
    id: 's14',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Imagina la situación y responde con una explicación completa.',
    instructionHy: 'Պատկերացրու իրավիճակը և տուր ամբողջական բացատրություն։',
    promptEs: 'En el aeropuerto tu maleta no ha llegado todavía. Habla con el empleado de la aerolínea.',
    promptHy: 'Օդանավակայանում քո ճամպրուկը դեռ չի ժամանել։ Խոսիր ավիաընկերության աշխատակցի հետ։',
    answerEs: 'Ejemplo: Disculpe, he buscado mi maleta pero no ha salido. ¿Puede ayudarme a encontrarla?',
    answerNoteEs: 'Uso natural de tiempos y cortesía.',
  },
  {
    id: 's15',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Imagina la situación y responde con una explicación completa.',
    instructionHy: 'Պատկերացրու իրավիճակը և տուր ամբողջական բացատրություն։',
    promptEs: 'En el hotel hace frío en la habitación y la ventana no cierra bien. Pide ayuda en recepción.',
    promptHy: 'Հյուրանոցի սենյակում ցուրտ է, և պատուհանը լավ չի փակվում։ Օգնություն խնդրիր ընդունարանում։',
    answerEs: 'Ejemplo: Buenas tardes, en nuestra habitación hace frío porque la ventana no cierra bien. ¿Nos pueden cambiar de habitación o arreglarla?',
    answerNoteEs: 'Respuesta natural.',
  },
  {
    id: 's16',
    gameId: GameId.SituacionesRapidas,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Imagina la situación y responde con una explicación completa.',
    instructionHy: 'Պատկերացրու իրավիճակը և տուր ամբողջական բացատրություն։',
    promptEs: 'Un amigo estuvo enfermo ayer y te pregunta qué pasó en el entrenamiento del estadio.',
    promptHy: 'Ընկերդ երեկ հիվանդ էր և հարցնում է, թե ինչ տեղի ունեցավ մարզադաշտի մարզման ժամանակ։',
    answerEs: 'Ejemplo: Ayer practicamos tiros a puerta y jugamos un partido de entrenamiento muy divertido.',
    answerNoteEs: 'Narración natural en pasado.',
  },
];

// ==========================================
// GAME 8: ¡Cinco preguntas en 30 segundos! (9 sets of 5 questions = 45 questions)
// ==========================================
const SPRINT_BANK: TaskContent[] = [
  {
    id: 'sp1',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Cuántos años tienes?', questionHy: 'Քանի՞ տարեկան ես։', sampleAnswerEs: 'Tengo ... años.' },
      { questionEs: '¿Dónde vives?', questionHy: 'Որտե՞ղ ես ապրում։', sampleAnswerEs: 'Vivo en ...' },
      { questionEs: '¿Qué hiciste ayer?', questionHy: 'Երեկ ի՞նչ արեցիր։', sampleAnswerEs: 'Ayer fui al colegio / jugué...' },
      { questionEs: '¿Qué vas a hacer mañana?', questionHy: 'Վաղը ի՞նչ ես անելու։', sampleAnswerEs: 'Mañana voy a estudiar...' },
      { questionEs: '¿Qué estabas haciendo a las ocho?', questionHy: 'Ժամը ութին ի՞նչ էիր անում։', sampleAnswerEs: 'Estaba cenando / viendo la tele.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp2',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Cómo se llama tu mejor amigo o amiga?', questionHy: 'Ի՞նչ է քո լավագույն ընկերոջ անունը։', sampleAnswerEs: 'Se llama ...' },
      { questionEs: '¿Qué día es hoy?', questionHy: 'Այսօր ի՞նչ օր է։', sampleAnswerEs: 'Hoy es ...' },
      { questionEs: '¿Qué desayunaste hoy?', questionHy: 'Այսօր ի՞նչ նախաճաշեցիր։', sampleAnswerEs: 'Hoy desayuné ...' },
      { questionEs: '¿Cuál es tu color favorito?', questionHy: 'Ո՞րն է քո սիրելի գույնը։', sampleAnswerEs: 'Mi color favorito es ...' },
      { questionEs: '¿Dónde estuviste ayer por la tarde?', questionHy: 'Երեկ կեսօրից հետո որտե՞ղ էիր։', sampleAnswerEs: 'Estuve en casa / en el parque.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp3',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Facil,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Tienes hermanos o hermanas?', questionHy: 'Ունե՞ս եղբայր կամ քույր։', sampleAnswerEs: 'Sí, tengo... / No, soy hijo único.' },
      { questionEs: '¿A qué hora vas al colegio?', questionHy: 'Ժամը քանիսի՞ն ես գնում դպրոց։', sampleAnswerEs: 'Voy a las ...' },
      { questionEs: '¿Qué deporte te gusta más?', questionHy: 'Ո՞ր սպորտն ես ամենաշատը սիրում։', sampleAnswerEs: 'Me gusta el fútbol / la natación.' },
      { questionEs: '¿Qué comiste ayer?', questionHy: 'Երեկ ի՞նչ կերար։', sampleAnswerEs: 'Ayer comí ...' },
      { questionEs: '¿Qué tiempo hace hoy?', questionHy: 'Այսօր ի՞նչ եղանակ է։', sampleAnswerEs: 'Hoy hace sol / frío.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp4',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Qué has hecho hoy antes de la clase?', questionHy: 'Այսօր դասից առաջ ի՞նչ ես արել։', sampleAnswerEs: 'He estudiado y he comido.' },
      { questionEs: '¿Con quién hablaste ayer por la tarde?', questionHy: 'Երեկ երեկոյան ու՞մ հետ խոսեցիր։', sampleAnswerEs: 'Hablé con mis amigos.' },
      { questionEs: '¿Qué hacías cuando eras más pequeño?', questionHy: 'Ի՞նչ էիր անում, երբ փոքր էիր։', sampleAnswerEs: 'Jugaba en el jardín.' },
      { questionEs: '¿Has visto una película esta semana?', questionHy: 'Այս շաբաթ ֆիլմ դիտե՞լ ես։', sampleAnswerEs: 'Sí, he visto una película.' },
      { questionEs: '¿Qué harás este fin de semana?', questionHy: 'Այս հանգստյան օրերին ի՞նչ ես անելու։', sampleAnswerEs: 'Iré al parque / visitaré a mi familia.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp5',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Dónde pasaste tus últimas vacaciones?', questionHy: 'Որտե՞ղ անցկացրիր վերջին արձակուրդդ։', sampleAnswerEs: 'Las pasé en ...' },
      { questionEs: '¿Qué libro estás leyendo ahora?', questionHy: 'Հիմա ի՞նչ գիրք ես կարդում։', sampleAnswerEs: 'Estoy leyendo ...' },
      { questionEs: '¿A qué hora te dormiste anoche?', questionHy: 'Երեկ գիշեր ժամը քանիսի՞ն քնեցիր։', sampleAnswerEs: 'Me dormí a las diez.' },
      { questionEs: '¿Qué música escuchabas hace dos años?', questionHy: 'Երկու տարի առաջ ի՞նչ երաժշտություն էիր լսում։', sampleAnswerEs: 'Escuchaba pop / música clásica.' },
      { questionEs: '¿Has terminado tus tareas de español?', questionHy: 'Ավարտե՞լ ես իսպաներենի տնայիններդ։', sampleAnswerEs: 'Sí, ya las he terminado.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp6',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Medio,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Qué compraste la última vez que fuiste de compras?', questionHy: 'Ի՞նչ գնեցիր վերջին անգամ խանութ գնալիս։', sampleAnswerEs: 'Compré una camiseta / fruta.' },
      { questionEs: '¿Qué mascota te gustaría tener?', questionHy: 'Ի՞նչ ընտանի կենդանի կուզենայիր ունենալ։', sampleAnswerEs: 'Me gustaría tener un perro.' },
      { questionEs: '¿Cuántos días tiene el mes de febrero?', questionHy: 'Քանի՞ օր ունի փետրվար ամիսը։', sampleAnswerEs: 'Tiene veintiocho o veintinueve días.' },
      { questionEs: '¿Qué hiciste el domingo pasado?', questionHy: 'Անցյալ կիրակի ի՞նչ արեցիր։', sampleAnswerEs: 'Descansé y salí a pasear.' },
      { questionEs: '¿Qué estabas haciendo hace una hora?', questionHy: 'Մեկ ժամ առաջ ի՞նչ էիր անում։', sampleAnswerEs: 'Estaba preparando mis cosas.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp7',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Qué habías hecho antes de desayunar hoy?', questionHy: 'Այսօր նախաճաշելուց առաջ ի՞նչ էիր արել։', sampleAnswerEs: 'Me había lavado la cara y vestido.' },
      { questionEs: '¿Por qué es importante aprender idiomas?', questionHy: 'Ինչո՞ւ է կարևոր լեզուներ սովորելը։', sampleAnswerEs: 'Para viajar y hablar con más personas.' },
      { questionEs: '¿Qué pasó la última vez que llegaste tarde?', questionHy: 'Ի՞նչ եղավ վերջին անգամ, երբ ուշացար։', sampleAnswerEs: 'Pedí perdón y entré rápido.' },
      { questionEs: '¿Cuál ha sido el mejor viaje de tu vida?', questionHy: 'Ո՞րն է եղել քո կյանքի լավագույն ճանապարհորդությունը։', sampleAnswerEs: 'Ha sido mi viaje a ...' },
      { questionEs: '¿Qué harías si ganaras un premio hoy?', questionHy: 'Ի՞նչ կանեիր, եթե այսօր մրցանակ շահեիր։', sampleAnswerEs: 'Celebraría con mi familia.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
  {
    id: 'sp8',
    gameId: GameId.CincoPreguntas30s,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Responde a las 5 preguntas en menos de 30 segundos.',
    instructionHy: 'Պատասխանիր 5 հարցերին 30 վայրկյանում։',
    sprintQuestions: [
      { questionEs: '¿Qué habías estudiado antes de empezar español?', questionHy: 'Իսպաներեն սկսելուց առաջ ի՞նչ էիր սովորել։', sampleAnswerEs: 'Había estudiado inglés.' },
      { questionEs: '¿Qué soñabas hacer cuando eras pequeño?', questionHy: 'Ի՞նչ էիր երազում անել, երբ փոքր էիր։', sampleAnswerEs: 'Soñaba con ser futbolista / piloto.' },
      { questionEs: '¿Qué comida no has probado nunca todavía?', questionHy: 'Ո՞ր ուտելիքը դեռ երբեք չես փորձել։', sampleAnswerEs: 'No he probado nunca el sushi.' },
      { questionEs: '¿Adónde viajaste el verano pasado?', questionHy: 'Ու՞ր մեկնեցիր անցյալ ամառ։', sampleAnswerEs: 'Viajé a ...' },
      { questionEs: '¿Cómo celebrarás tu próximo cumpleaños?', questionHy: 'Ինչպե՞ս ես նշելու քո հաջորդ ծննդյան օրը։', sampleAnswerEs: 'Haré una fiesta con mis amigos.' },
    ],
    answerEs: 'Respuestas abiertas válidas: 1 punto por cada respuesta rápida y correcta.',
  },
];

// ==========================================
// GAME 9: ¡Palabras en acción! (12 sets x 5 words = 60 words)
// ==========================================
const PALABRAS_BANK: TaskContent[] = [
  {
    id: 'pa1',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Facil,
    instructionEs: 'Di en español estas cinco palabras de la vida diaria.',
    instructionHy: 'Ասա իսպաներենով առօրյա կյանքի այս հինգ բառերը։',
    armenianWords: [
      { wordHy: 'տուն', answerEs: 'Casa' },
      { wordHy: 'դպրոց', answerEs: 'Colegio / Escuela' },
      { wordHy: 'ֆուտբոլ', answerEs: 'Fútbol' },
      { wordHy: 'ընկեր', answerEs: 'Amigo' },
      { wordHy: 'ճանապարհորդություն', answerEs: 'Viaje' },
    ],
    answerEs: 'Casa — Colegio — Fútbol — Amigo — Viaje',
  },
  {
    id: 'pa2',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Facil,
    instructionEs: 'Di en español estos cinco animales.',
    instructionHy: 'Ասա իսպաներենով այս հինգ կենդանիների անունները։',
    armenianWords: [
      { wordHy: 'շուն', answerEs: 'Perro' },
      { wordHy: 'կատու', answerEs: 'Gato' },
      { wordHy: 'ձի', answerEs: 'Caballo' },
      { wordHy: 'թռչուն', answerEs: 'Pájaro' },
      { wordHy: 'ձուկ', answerEs: 'Pez' },
    ],
    answerEs: 'Perro — Gato — Caballo — Pájaro — Pez',
  },
  {
    id: 'pa3',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Facil,
    instructionEs: 'Di en español estos cinco objetos escolares.',
    instructionHy: 'Ասա իսպաներենով դպրոցական այս հինգ առարկաները։',
    armenianWords: [
      { wordHy: 'գիրք', answerEs: 'Libro' },
      { wordHy: 'տետր', answerEs: 'Cuaderno' },
      { wordHy: 'գրիչ', answerEs: 'Bolígrafo' },
      { wordHy: 'սեղան', answerEs: 'Mesa' },
      { wordHy: 'պայուսակ', answerEs: 'Mochila' },
    ],
    answerEs: 'Libro — Cuaderno — Bolígrafo — Mesa — Mochila',
  },
  {
    id: 'pa4',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Facil,
    instructionEs: 'Di en español estas cinco comidas y bebidas.',
    instructionHy: 'Ասա իսպաներենով այս հինգ ուտելիքներն ու ըմպելիքները։',
    armenianWords: [
      { wordHy: 'հաց', answerEs: 'Pan' },
      { wordHy: 'ջուր', answerEs: 'Agua' },
      { wordHy: 'խնձոր', answerEs: 'Manzana' },
      { wordHy: 'պանիր', answerEs: 'Queso' },
      { wordHy: 'կաթ', answerEs: 'Leche' },
    ],
    answerEs: 'Pan — Agua — Manzana — Queso — Leche',
  },
  {
    id: 'pa5',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Medio,
    instructionEs: 'Di en español estos cinco verbos en infinitivo.',
    instructionHy: 'Ասա իսպաներենով այս հինգ բայերը անորոշ ձևով։',
    armenianWords: [
      { wordHy: 'վազել', answerEs: 'Correr' },
      { wordHy: 'գրել', answerEs: 'Escribir' },
      { wordHy: 'կարդալ', answerEs: 'Leer' },
      { wordHy: 'խոսել', answerEs: 'Hablar' },
      { wordHy: 'հասկանալ', answerEs: 'Entender / Comprender' },
    ],
    answerEs: 'Correr — Escribir — Leer — Hablar — Entender',
  },
  {
    id: 'pa6',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Medio,
    instructionEs: 'Di en español estos cinco adjetivos.',
    instructionHy: 'Ասա իսպաներենով այս հինգ ածականները։',
    armenianWords: [
      { wordHy: 'արագ', answerEs: 'Rápido' },
      { wordHy: 'ուժեղ', answerEs: 'Fuerte' },
      { wordHy: 'հեշտ', answerEs: 'Fácil' },
      { wordHy: 'դժվար', answerEs: 'Difícil' },
      { wordHy: 'գեղեցիկ', answerEs: 'Bonito / Hermoso' },
    ],
    answerEs: 'Rápido — Fuerte — Fácil — Difícil — Bonito',
  },
  {
    id: 'pa7',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Medio,
    instructionEs: 'Di en español estas cinco emociones.',
    instructionHy: 'Ասա իսպաներենով այս հինգ զգացմունքները։',
    armenianWords: [
      { wordHy: 'ուրախ', answerEs: 'Alegre / Feliz / Contento' },
      { wordHy: 'տխուր', answerEs: 'Triste' },
      { wordHy: 'զարմացած', answerEs: 'Sorprendido' },
      { wordHy: 'հոգնած', answerEs: 'Cansado' },
      { wordHy: 'հպարտ', answerEs: 'Orgulloso' },
    ],
    answerEs: 'Feliz — Triste — Sorprendido — Cansado — Orgulloso',
  },
  {
    id: 'pa8',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Medio,
    instructionEs: 'Di en español estas cinco palabras sobre viajes.',
    instructionHy: 'Ասա իսպաներենով ճանապարհորդության այս հինգ բառերը։',
    armenianWords: [
      { wordHy: 'օդանավակայան', answerEs: 'Aeropuerto' },
      { wordHy: 'ճամպրուկ', answerEs: 'Maleta' },
      { wordHy: 'տոմս', answerEs: 'Billete / Entrada' },
      { wordHy: 'հյուրանոց', answerEs: 'Hotel' },
      { wordHy: 'քարտեզ', answerEs: 'Mapa' },
    ],
    answerEs: 'Aeropuerto — Maleta — Billete — Hotel — Mapa',
  },
  {
    id: 'pa9',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Di en español estos cinco verbos de acción.',
    instructionHy: 'Ասա իսպաներենով գործողության այս հինգ բայերը։',
    armenianWords: [
      { wordHy: 'հաղթել', answerEs: 'Ganar' },
      { wordHy: 'հիշել', answerEs: 'Recordar' },
      { wordHy: 'մոռանալ', answerEs: 'Olvidar' },
      { wordHy: 'բացատրել', answerEs: 'Explicar' },
      { wordHy: 'պատրաստել', answerEs: 'Preparar' },
    ],
    answerEs: 'Ganar — Recordar — Olvidar — Explicar — Preparar',
  },
  {
    id: 'pa10',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Di en español estas cinco palabras de tiempo y naturaleza.',
    instructionHy: 'Ասա իսպաներենով ժամանակի և բնության այս հինգ բառերը։',
    armenianWords: [
      { wordHy: 'փոթորիկ', answerEs: 'Tormenta' },
      { wordHy: 'շաբաթավերջ', answerEs: 'Fin de semana' },
      { wordHy: 'անցյալ', answerEs: 'Pasado' },
      { wordHy: 'ապագա', answerEs: 'Futuro' },
      { wordHy: 'հաջողություն', answerEs: 'Éxito / Suerte' },
    ],
    answerEs: 'Tormenta — Fin de semana — Pasado — Futuro — Éxito',
  },
  {
    id: 'pa11',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Di en español estos cinco animales salvajes.',
    instructionHy: 'Ասա իսպաներենով այս հինգ վայրի կենդանիները։',
    armenianWords: [
      { wordHy: 'առյուծ', answerEs: 'León' },
      { wordHy: 'փիղ', answerEs: 'Elefante' },
      { wordHy: 'արջ', answerEs: 'Oso' },
      { wordHy: 'արծիվ', answerEs: 'Águila' },
      { wordHy: 'դելֆին', answerEs: 'Delfín' },
    ],
    answerEs: 'León — Elefante — Oso — Águila — Delfín',
  },
  {
    id: 'pa12',
    gameId: GameId.PalabrasEnAccion,
    difficulty: Difficulty.Dificil,
    instructionEs: 'Di en español estas cinco emociones y cualidades.',
    instructionHy: 'Ասա իսպաներենով այս հինգ զգացմունքներն ու հատկանիշները։',
    armenianWords: [
      { wordHy: 'խիզախ', answerEs: 'Valiente' },
      { wordHy: 'համբերատար', answerEs: 'Paciente' },
      { wordHy: 'անհանգիստ', answerEs: 'Nervioso / Preocupado' },
      { wordHy: 'ոգևորված', answerEs: 'Emocionado / Entusiasmado' },
      { wordHy: 'խելացի', answerEs: 'Inteligente' },
    ],
    answerEs: 'Valiente — Paciente — Nervioso — Emocionado — Inteligente',
  },
];

// Helper to shuffle array cleanly
export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPasadoTask(
  raw: PasadoRaw,
  fourTensesMode: boolean,
  forcedTense?: PasadoRaw['defaultTarget']
): TaskContent {
  const target = forcedTense ?? raw.defaultTarget;
  const mapAnswer: Record<PasadoRaw['defaultTarget'], string> = {
    'Pretérito Perfecto': raw.perfecto,
    'Pretérito Indefinido': raw.indefinido,
    'Pretérito Imperfecto': raw.imperfecto,
    'Pretérito Pluscuamperfecto': raw.pluscuamperfecto,
  };

  const allTensesAnswers = [
    { tense: 'Pretérito Perfecto', answer: raw.perfecto },
    { tense: 'Pretérito Indefinido', answer: raw.indefinido },
    { tense: 'Pretérito Imperfecto', answer: raw.imperfecto },
    { tense: 'Pretérito Pluscuamperfecto', answer: raw.pluscuamperfecto },
  ];

  if (fourTensesMode) {
    return {
      id: `${raw.id}_4t`,
      gameId: GameId.PasadosVelocidad,
      difficulty: raw.difficulty,
      instructionEs: 'Transforma esta frase a los CUATRO tiempos pasados.',
      instructionHy: `Փոխակերպիր այս նախադասությունը բոլոր ՉՈՐՍ անցյալ ժամանակներով։`,
      baseSentence: raw.base,
      baseSentenceHy: raw.baseHy,
      targetTense: 'Los 4 tiempos pasados',
      allTensesAnswers,
      answerEs: allTensesAnswers.map((a) => `${a.tense}: ${a.answer}`).join('\n'),
    };
  }

  return {
    id: raw.id,
    gameId: GameId.PasadosVelocidad,
    difficulty: raw.difficulty,
    instructionEs: `Transforma al ${target}.`,
    instructionHy: `Փոխակերպիր ${target} ժամանակով։`,
    baseSentence: raw.base,
    baseSentenceHy: raw.baseHy,
    targetTense: target,
    allTensesAnswers,
    answerEs: mapAnswer[target],
  };
}

function pickFromBank<T extends { id: string; difficulty: Difficulty }>(
  bank: T[],
  difficulty: Difficulty,
  usedIds: Set<string>
): T {
  const byDiff = bank.filter((item) => item.difficulty === difficulty && !usedIds.has(item.id));
  if (byDiff.length > 0) {
    const chosen = shuffleArray(byDiff)[0];
    usedIds.add(chosen.id);
    return chosen;
  }
  // Fallback if all items in that difficulty were used in a long session
  const anyDiffUnused = bank.filter((item) => !usedIds.has(item.id));
  if (anyDiffUnused.length > 0) {
    const chosen = shuffleArray(anyDiffUnused)[0];
    usedIds.add(chosen.id);
    return chosen;
  }
  // Clear and pick fresh in requested difficulty
  const pool = bank.filter((item) => item.difficulty === difficulty);
  const chosen = shuffleArray(pool.length > 0 ? pool : bank)[0];
  usedIds.add(chosen.id);
  return chosen;
}

export function generateNumberTask(
  difficulty: Difficulty,
  excludeNumbers: number[] = []
): TaskContent {
  const numbers = generateUniqueNumbers(difficulty, 5, excludeNumbers);
  const answers = numbers.map((n) => `${formatSpanishNumber(n)} → ${numberToSpanish(n)}`);
  return {
    id: `num_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    gameId: GameId.NumerosRelampago,
    difficulty,
    instructionEs: 'Di en voz alta los cinco números en español lo más rápido posible.',
    instructionHy: 'Բարձրաձայն և արագ ասա այս հինգ թվերը իսպաներենով։',
    numbers,
    answerEs: answers.join('\n'),
  };
}

/**
 * Generates an equivalent pair of tasks (one for Razmik, one for Gayane) for any of the 10 games.
 */
export function generateTaskPairForGame(
  gameId: GameId,
  difficulty: Difficulty,
  usedIds: Set<string>,
  options: { pasadosFourTensesMode: boolean }
): { razmikTask: TaskContent; gayaneTask: TaskContent } {
  switch (gameId) {
    case GameId.NumerosRelampago: {
      const razmikTask = generateNumberTask(difficulty);
      const gayaneTask = generateNumberTask(difficulty, razmikTask.numbers ?? []);
      return { razmikTask, gayaneTask };
    }

    case GameId.PasadosVelocidad: {
      const p1 = pickFromBank(PASADOS_RAW, difficulty, usedIds);
      const p2 = pickFromBank(PASADOS_RAW, difficulty, usedIds);
      return {
        razmikTask: buildPasadoTask(p1, options.pasadosFourTensesMode),
        gayaneTask: buildPasadoTask(p2, options.pasadosFourTensesMode),
      };
    }

    case GameId.RespondeRapido: {
      return {
        razmikTask: pickFromBank(RESPONDE_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(RESPONDE_BANK, difficulty, usedIds),
      };
    }

    case GameId.MemoriaVerbos: {
      return {
        razmikTask: pickFromBank(MEMORIA_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(MEMORIA_BANK, difficulty, usedIds),
      };
    }

    case GameId.TraduceRapidamente: {
      return {
        razmikTask: pickFromBank(TRADUCE_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(TRADUCE_BANK, difficulty, usedIds),
      };
    }

    case GameId.CorrigeError: {
      return {
        razmikTask: pickFromBank(CORRIGE_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(CORRIGE_BANK, difficulty, usedIds),
      };
    }

    case GameId.SituacionesRapidas: {
      return {
        razmikTask: pickFromBank(SITUACIONES_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(SITUACIONES_BANK, difficulty, usedIds),
      };
    }

    case GameId.CincoPreguntas30s: {
      return {
        razmikTask: pickFromBank(SPRINT_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(SPRINT_BANK, difficulty, usedIds),
      };
    }

    case GameId.PalabrasEnAccion: {
      return {
        razmikTask: pickFromBank(PALABRAS_BANK, difficulty, usedIds),
        gayaneTask: pickFromBank(PALABRAS_BANK, difficulty, usedIds),
      };
    }

    case GameId.DesafioFinal: {
      const buildFinal = (excludeNums: number[]): TaskContent => {
        const nums = generateUniqueNumbers(difficulty, 3, excludeNums);
        const numsAnswers = nums.map((n) => `${formatSpanishNumber(n)} → ${numberToSpanish(n)}`);
        const pasado = pickFromBank(PASADOS_RAW, difficulty, usedIds);
        const responde = pickFromBank(RESPONDE_BANK, difficulty, usedIds);
        const traduce = pickFromBank(TRADUCE_BANK, difficulty, usedIds);
        const corrige = pickFromBank(CORRIGE_BANK, difficulty, usedIds);

        return {
          id: `final_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          gameId: GameId.DesafioFinal,
          difficulty,
          instructionEs: 'Completa las 5 pruebas del Desafío Final en orden.',
          instructionHy: 'Հաջորդաբար կատարիր Եզրափակիչ փորձության 5 առաջադրանքները։',
          finalChallengeParts: {
            numbers: nums,
            numbersAnswers: numsAnswers,
            tenseBase: pasado.base,
            tenseBaseHy: pasado.baseHy,
            tenseTarget: 'Pretérito Indefinido',
            tenseAnswer: pasado.indefinido,
            yesterdayQuestionEs: responde.promptEs || '¿Qué hiciste ayer?',
            yesterdayQuestionHy: responde.promptHy || 'Երեկ ի՞նչ արեցիր։',
            yesterdaySampleEs: responde.answerEs,
            translateHy: traduce.promptEs || 'Երեկ ես գնացի դպրոց։',
            translateEs: traduce.answerEs,
            errorSentence: corrige.promptEs || 'Ayer yo he fui al cine.',
            errorSentenceHy: corrige.promptHy,
            errorFixEs: corrige.answerEs,
          },
          answerEs: [
            `1. Números: ${nums.map((n) => numberToSpanish(n)).join(' — ')}`,
            `2. Pasado: ${pasado.indefinido}`,
            `3. Pregunta: ${responde.answerEs}`,
            `4. Traducción: ${traduce.answerEs}`,
            `5. Corrección: ${corrige.answerEs}`,
          ].join('\n'),
        };
      };

      const razmikTask = buildFinal([]);
      const gayaneTask = buildFinal(razmikTask.finalChallengeParts?.numbers ?? []);
      return { razmikTask, gayaneTask };
    }
  }
}

/**
 * Builds the 20-round tournament schedule: 2 rounds of each of the 10 games,
 * keeping rounds 1-18 nicely shuffled across Games 1-9 and ending with
 * Game 10 (¡Desafío final!) in rounds 19-20!
 */
export function createTournamentGameOrder(): GameId[] {
  const firstNine: GameId[] = [
    GameId.NumerosRelampago,
    GameId.PasadosVelocidad,
    GameId.RespondeRapido,
    GameId.MemoriaVerbos,
    GameId.TraduceRapidamente,
    GameId.CorrigeError,
    GameId.SituacionesRapidas,
    GameId.CincoPreguntas30s,
    GameId.PalabrasEnAccion,
  ];
  const round1to9 = shuffleArray(firstNine);
  const round10to18 = shuffleArray(firstNine);
  return [...round1to9, ...round10to18, GameId.DesafioFinal, GameId.DesafioFinal];
}

export function getGameMeta(gameId: GameId): GameMeta {
  return GAMES_META.find((g) => g.id === gameId) ?? GAMES_META[0];
}
