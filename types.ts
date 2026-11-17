export enum PlayerId {
  Razmik = 'razmik',
  Gayane = 'gayane',
}

export enum Difficulty {
  Facil = 'Fácil',
  Medio = 'Medio',
  Dificil = 'Difícil',
}

export enum AppMode {
  Competicion = 'Competición',
  Practica = 'Práctica libre',
}

export enum GameId {
  NumerosRelampago = 'numeros_relampago',
  PasadosVelocidad = 'pasados_velocidad',
  RespondeRapido = 'responde_rapido',
  MemoriaVerbos = 'memoria_verbos',
  TraduceRapidamente = 'traduce_rapidamente',
  CorrigeError = 'corrige_error',
  SituacionesRapidas = 'situaciones_rapidas',
  CincoPreguntas30s = 'cinco_preguntas_30s',
  PalabrasEnAccion = 'palabras_en_accion',
  DesafioFinal = 'desafio_final',
}

export interface GameMeta {
  id: GameId;
  number: number;
  emoji: string;
  title: string;
  shortDesc: string;
  armenianDesc: string;
}

export interface PlayerAttempt {
  playerId: PlayerId;
  timeMs: number;
  isCorrect: boolean;
  correctCount?: number; // Used in Game 8 (0..5)
  spokenText?: string;
}

export interface RoundRecord {
  roundNumber: number;
  gameId: GameId;
  gameTitle: string;
  difficulty: Difficulty;
  razmik: PlayerAttempt;
  gayane: PlayerAttempt;
  winner: PlayerId | 'tie' | 'none';
  pointsRazmik: number;
  pointsGayane: number;
  timestamp: string;
}

export interface TaskContent {
  id: string;
  gameId: GameId;
  difficulty: Difficulty;
  instructionEs: string;
  instructionHy: string;
  // Game 1: numbers
  numbers?: number[];
  // Standard single prompt
  promptEs?: string;
  promptHy?: string;
  // Game 2: tense transformation
  baseSentence?: string;
  baseSentenceHy?: string;
  targetTense?: string;
  allTensesAnswers?: { tense: string; answer: string }[];
  // Game 4: memory verbs (shown 5s then hidden)
  memoryVerbs?: string[];
  memoryCommandEs?: string;
  memoryCommandHy?: string;
  // Game 6: time limit
  timeLimitSec?: number;
  // Game 8: 5 quick questions in 30s
  sprintQuestions?: { questionEs: string; questionHy: string; sampleAnswerEs: string }[];
  // Game 9: 5 Armenian words
  armenianWords?: { wordHy: string; answerEs: string }[];
  // Game 10: Final 5-part challenge
  finalChallengeParts?: {
    numbers: number[];
    numbersAnswers: string[];
    tenseBase: string;
    tenseBaseHy?: string;
    tenseTarget: string;
    tenseAnswer: string;
    yesterdayQuestionEs: string;
    yesterdayQuestionHy: string;
    yesterdaySampleEs: string;
    translateHy: string;
    translateEs: string;
    errorSentence: string;
    errorSentenceHy?: string;
    errorFixEs: string;
  };
  // Answer & flexible note
  answerEs: string;
  answerNoteEs?: string;
}

export interface CompetitionState {
  mode: AppMode;
  difficulty: Difficulty;
  selectedGameId: GameId | 'auto';
  pasadosFourTensesMode: boolean;
  currentRound: number; // 1..20 in Competición
  totalRounds: number; // 20
  scoreRazmik: number;
  scoreGayane: number;
  winsRazmik: number;
  winsGayane: number;
  history: RoundRecord[];
  finished: boolean;
  lastSavedAt: string | null;
}
