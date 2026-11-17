import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Square,
  Eye,
  Check,
  X,
  ArrowRight,
  Mic,
  MicOff,
  Shuffle,
  Save,
  BarChart3,
  RotateCcw,
  Download,
  Trophy,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  AppMode,
  CompetitionState,
  Difficulty,
  GameId,
  PlayerAttempt,
  PlayerId,
  RoundRecord,
  TaskContent,
} from './types';
import {
  GAMES_META,
  createTournamentGameOrder,
  generateNumberTask,
  generateTaskPairForGame,
  getGameMeta,
} from './tasksBank';
import { formatSpanishNumber } from './spanishNumbers';
import {
  clearCompetitionState,
  exportResultsAsCSV,
  exportResultsAsJSON,
  formatSecondsDiff,
  formatStopwatch,
  getInitialCompetitionState,
  loadCompetitionState,
  saveCompetitionState,
} from './storage';
import { getSpeechRecognitionConstructor, isSpeechSupported, SpeechRecognitionLike } from './speechHelper';
import ResultsModal from './ResultsModal';
import FinalScreen from './FinalScreen';

type TurnPhase = 'ready' | 'memorizing' | 'running' | 'finished' | 'evaluated';
type RoundStage = 'razmik_turn' | 'gayane_turn' | 'round_summary';

export default function App() {
  const [state, setState] = useState<CompetitionState>(() => loadCompetitionState());
  const [tournamentOrder, setTournamentOrder] = useState<GameId[]>(() => createTournamentGameOrder());

  const usedTaskIdsRef = useRef<Set<string>>(new Set());

  // Determine active game for the current round
  const activeGameId: GameId = useMemo(() => {
    if (state.selectedGameId !== 'auto') {
      return state.selectedGameId;
    }
    if (state.mode === AppMode.Practica) {
      return GAMES_META[0].id;
    }
    const idx = Math.max(0, Math.min(state.totalRounds - 1, state.currentRound - 1));
    return tournamentOrder[idx] ?? GameId.NumerosRelampago;
  }, [state.selectedGameId, state.mode, state.currentRound, state.totalRounds, tournamentOrder]);

  const activeGameMeta = useMemo(() => getGameMeta(activeGameId), [activeGameId]);

  // Task pair for current round (Razmik & Gayane get equivalent-difficulty tasks)
  const [taskPair, setTaskPair] = useState<{ razmikTask: TaskContent; gayaneTask: TaskContent }>(() =>
    generateTaskPairForGame(activeGameId, state.difficulty, usedTaskIdsRef.current, {
      pasadosFourTensesMode: state.pasadosFourTensesMode,
    })
  );

  // Round stage & active turn state
  const [roundStage, setRoundStage] = useState<RoundStage>('razmik_turn');
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('ready');

  // Independent stopwatches (in milliseconds)
  const [razmikTimeMs, setRazmikTimeMs] = useState<number>(0);
  const [gayaneTimeMs, setGayaneTimeMs] = useState<number>(0);
  const timerStartRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Memory phase countdown for Game 4 (5 seconds)
  const [memoryCountdown, setMemoryCountdown] = useState<number>(5);
  const memoryIntervalRef = useRef<number | null>(null);

  // Sprint 30s / Time-limited countdown
  const [countdownRemainingMs, setCountdownRemainingMs] = useState<number | null>(null);

  // Reveal answer & Armenian hint toggles (always collapsed on new turn)
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showArmenian, setShowArmenian] = useState<boolean>(false);

  // Evaluations stored for current round
  const [razmikAttempt, setRazmikAttempt] = useState<PlayerAttempt | null>(null);
  const [gayaneAttempt, setGayaneAttempt] = useState<PlayerAttempt | null>(null);
  const [latestRoundRecord, setLatestRoundRecord] = useState<RoundRecord | null>(null);

  // Game 8 (5 questions in 30s) per-question checklist
  const [sprintChecks, setSprintChecks] = useState<boolean[]>([false, false, false, false, false]);

  // Speech recognition state
  const speechAvailable = useMemo(() => isSpeechSupported(), []);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // UI modals & confirmations
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showGamePicker, setShowGamePicker] = useState<boolean>(false);

  const activePlayer: PlayerId = roundStage === 'gayane_turn' ? PlayerId.Gayane : PlayerId.Razmik;
  const currentTask: TaskContent =
    activePlayer === PlayerId.Razmik ? taskPair.razmikTask : taskPair.gayaneTask;

  // Stop all active timers and speech cleanly
  const stopAllTimersAndSpeech = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (memoryIntervalRef.current !== null) {
      window.clearInterval(memoryIntervalRef.current);
      memoryIntervalRef.current = null;
    }
    timerStartRef.current = null;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAllTimersAndSpeech();
    };
  }, [stopAllTimersAndSpeech]);

  // Helper to reset round UI and generate fresh tasks for a given game/difficulty
  const prepareFreshRound = useCallback(
    (
      nextGameId: GameId,
      nextDifficulty: Difficulty,
      fourTensesMode: boolean
    ) => {
      stopAllTimersAndSpeech();
      const pair = generateTaskPairForGame(nextGameId, nextDifficulty, usedTaskIdsRef.current, {
        pasadosFourTensesMode: fourTensesMode,
      });
      setTaskPair(pair);
      setRoundStage('razmik_turn');
      setTurnPhase('ready');
      setRazmikTimeMs(0);
      setGayaneTimeMs(0);
      setCountdownRemainingMs(null);
      setMemoryCountdown(5);
      setShowAnswer(false);
      setShowArmenian(false);
      setRazmikAttempt(null);
      setGayaneAttempt(null);
      setLatestRoundRecord(null);
      setSprintChecks([false, false, false, false, false]);
      setSpokenText('');
      setSpeechError(null);
    },
    [stopAllTimersAndSpeech]
  );

  // Handle finishing the stopwatch
  const handleFinishTurn = useCallback(() => {
    if (turnPhase !== 'running' && turnPhase !== 'memorizing') return;

    let finalElapsed = 0;
    if (timerStartRef.current !== null) {
      finalElapsed = Math.max(10, Math.round(performance.now() - timerStartRef.current));
    } else if (activePlayer === PlayerId.Razmik) {
      finalElapsed = razmikTimeMs;
    } else {
      finalElapsed = gayaneTimeMs;
    }

    stopAllTimersAndSpeech();

    if (activePlayer === PlayerId.Razmik) {
      setRazmikTimeMs(finalElapsed);
    } else {
      setGayaneTimeMs(finalElapsed);
    }

    setTurnPhase('finished');
  }, [turnPhase, activePlayer, razmikTimeMs, gayaneTimeMs, stopAllTimersAndSpeech]);

  // Retry current player's attempt from 00:00.00
  const handleRetryTurn = useCallback(() => {
    if (turnPhase !== 'running' && turnPhase !== 'memorizing' && turnPhase !== 'finished') return;
    stopAllTimersAndSpeech();
    if (activePlayer === PlayerId.Razmik) {
      setRazmikTimeMs(0);
    } else {
      setGayaneTimeMs(0);
    }
    setCountdownRemainingMs(null);
    setMemoryCountdown(5);
    setShowAnswer(false);
    setSprintChecks([false, false, false, false, false]);
    setSpokenText('');
    setSpeechError(null);
    setTurnPhase('ready');
  }, [turnPhase, activePlayer, stopAllTimersAndSpeech]);

  // Start stopwatch helper
  const beginRunningTimer = useCallback(
    (player: PlayerId, limitSeconds?: number) => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
      timerStartRef.current = performance.now();
      setTurnPhase('running');

      const limitMs = limitSeconds ? limitSeconds * 1000 : null;
      if (limitMs !== null) {
        setCountdownRemainingMs(limitMs);
      } else {
        setCountdownRemainingMs(null);
      }

      timerIntervalRef.current = window.setInterval(() => {
        if (timerStartRef.current === null) return;
        const elapsed = Math.round(performance.now() - timerStartRef.current);
        if (player === PlayerId.Razmik) {
          setRazmikTimeMs(elapsed);
        } else {
          setGayaneTimeMs(elapsed);
        }

        if (limitMs !== null) {
          const remaining = Math.max(0, limitMs - elapsed);
          setCountdownRemainingMs(remaining);
          if (remaining <= 0) {
            // Auto-stop at time limit for Game 8 (30s) or Game 6 (time limit)
            if (timerIntervalRef.current !== null) {
              window.clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            timerStartRef.current = null;
            if (player === PlayerId.Razmik) {
              setRazmikTimeMs(limitMs);
            } else {
              setGayaneTimeMs(limitMs);
            }
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {
                // ignore
              }
              recognitionRef.current = null;
            }
            setIsListening(false);
            setTurnPhase('finished');
          }
        }
      }, 25);
    },
    []
  );

  // Start button handler (NEVER auto-starts)
  const handleStartTurn = useCallback(() => {
    if (turnPhase !== 'ready') return;

    setShowAnswer(false);
    setSpokenText('');
    setSpeechError(null);

    if (currentTask.gameId === GameId.MemoriaVerbos) {
      // 5-second memorization phase first
      setTurnPhase('memorizing');
      setMemoryCountdown(5);
      let secsLeft = 5;
      memoryIntervalRef.current = window.setInterval(() => {
        secsLeft -= 1;
        setMemoryCountdown(secsLeft);
        if (secsLeft <= 0) {
          if (memoryIntervalRef.current !== null) {
            window.clearInterval(memoryIntervalRef.current);
            memoryIntervalRef.current = null;
          }
          beginRunningTimer(activePlayer);
        }
      }, 1000);
      return;
    }

    const limitSec =
      currentTask.gameId === GameId.CincoPreguntas30s
        ? 30
        : currentTask.gameId === GameId.CorrigeError
        ? currentTask.timeLimitSec ?? 20
        : undefined;

    beginRunningTimer(activePlayer, limitSec);
  }, [turnPhase, currentTask, activePlayer, beginRunningTimer]);

  // Skip 5-second memorization early if ready
  const handleSkipMemory = useCallback(() => {
    if (turnPhase !== 'memorizing') return;
    if (memoryIntervalRef.current !== null) {
      window.clearInterval(memoryIntervalRef.current);
      memoryIntervalRef.current = null;
    }
    setMemoryCountdown(0);
    beginRunningTimer(activePlayer);
  }, [turnPhase, activePlayer, beginRunningTimer]);

  // Toggle voice recognition (es-ES)
  const handleToggleSpeech = useCallback(() => {
    if (!speechAvailable) {
      setSpeechError('Tu navegador no admite reconocimiento de voz. Usa el cronómetro y la revisión del profesor.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    try {
      const rec = new Ctor();
      rec.lang = 'es-ES';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let combined = '';
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0].transcript + ' ';
        }
        setSpokenText(combined.trim());
      };

      rec.onerror = (ev) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setSpeechError('Permiso de micrófono denegado. Puedes seguir jugando con el cronómetro.');
        } else if (ev.error !== 'aborted') {
          setSpeechError('No se pudo captar audio con claridad. El profesor puede evaluar manualmente.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
      setSpeechError(null);
    } catch {
      setSpeechError('Micrófono no disponible en este dispositivo. Usa el cronómetro manual.');
      setIsListening(false);
    }
  }, [speechAvailable, isListening]);

  // Shuffle numbers in Game 1 before starting attempt
  const handleShuffleNumbers = useCallback(() => {
    if (turnPhase !== 'ready' || currentTask.gameId !== GameId.NumerosRelampago) return;
    const otherNumbers =
      activePlayer === PlayerId.Razmik
        ? taskPair.gayaneTask.numbers ?? []
        : taskPair.razmikTask.numbers ?? [];
    const fresh = generateNumberTask(state.difficulty, otherNumbers);
    setTaskPair((prev) =>
      activePlayer === PlayerId.Razmik
        ? { ...prev, razmikTask: fresh }
        : { ...prev, gayaneTask: fresh }
    );
  }, [turnPhase, currentTask.gameId, activePlayer, taskPair, state.difficulty]);

  // Compute round winner & save round record
  const finalizeRoundWithBothAttempts = useCallback(
    (rAttempt: PlayerAttempt, gAttempt: PlayerAttempt) => {
      let winner: PlayerId | 'tie' | 'none' = 'none';
      let pointsRazmik = 0;
      let pointsGayane = 0;

      // Special scoring for Game 8 (5 questions in 30s): compare correctCount first, then time
      if (activeGameId === GameId.CincoPreguntas30s) {
        const rCount = rAttempt.correctCount ?? (rAttempt.isCorrect ? 1 : 0);
        const gCount = gAttempt.correctCount ?? (gAttempt.isCorrect ? 1 : 0);
        if (rCount === 0 && gCount === 0) {
          winner = 'none';
        } else if (rCount > gCount) {
          winner = PlayerId.Razmik;
          pointsRazmik = 1;
        } else if (gCount > rCount) {
          winner = PlayerId.Gayane;
          pointsGayane = 1;
        } else {
          // Equal positive count: faster wins, or exact time tie
          if (rAttempt.timeMs < gAttempt.timeMs) {
            winner = PlayerId.Razmik;
            pointsRazmik = 1;
          } else if (gAttempt.timeMs < rAttempt.timeMs) {
            winner = PlayerId.Gayane;
            pointsGayane = 1;
          } else {
            winner = 'tie';
            pointsRazmik = 1;
            pointsGayane = 1;
          }
        }
      } else {
        // Standard accuracy-first + speed tiebreaker
        if (rAttempt.isCorrect && !gAttempt.isCorrect) {
          winner = PlayerId.Razmik;
          pointsRazmik = 1;
        } else if (!rAttempt.isCorrect && gAttempt.isCorrect) {
          winner = PlayerId.Gayane;
          pointsGayane = 1;
        } else if (!rAttempt.isCorrect && !gAttempt.isCorrect) {
          winner = 'none';
        } else {
          // Both correct -> faster time wins
          if (rAttempt.timeMs < gAttempt.timeMs) {
            winner = PlayerId.Razmik;
            pointsRazmik = 1;
          } else if (gAttempt.timeMs < rAttempt.timeMs) {
            winner = PlayerId.Gayane;
            pointsGayane = 1;
          } else {
            winner = 'tie';
            pointsRazmik = 1;
            pointsGayane = 1;
          }
        }
      }

      const record: RoundRecord = {
        roundNumber: state.mode === AppMode.Competicion ? state.currentRound : state.history.length + 1,
        gameId: activeGameId,
        gameTitle: activeGameMeta.title,
        difficulty: state.difficulty,
        razmik: rAttempt,
        gayane: gAttempt,
        winner,
        pointsRazmik,
        pointsGayane,
        timestamp: new Date().toISOString(),
      };

      setLatestRoundRecord(record);
      setRoundStage('round_summary');

      setState((prev) => {
        const updated: CompetitionState = {
          ...prev,
          scoreRazmik: prev.scoreRazmik + pointsRazmik,
          scoreGayane: prev.scoreGayane + pointsGayane,
          winsRazmik: prev.winsRazmik + (winner === PlayerId.Razmik ? 1 : 0),
          winsGayane: prev.winsGayane + (winner === PlayerId.Gayane ? 1 : 0),
          history: [...prev.history, record],
        };
        return saveCompetitionState(updated);
      });
    },
    [activeGameId, activeGameMeta.title, state.mode, state.currentRound, state.history.length, state.difficulty]
  );

  // Teacher evaluates the current player's finished attempt
  const handleEvaluatePlayer = useCallback(
    (isCorrect: boolean, explicitCorrectCount?: number) => {
      if (turnPhase !== 'finished') return;

      const attempt: PlayerAttempt = {
        playerId: activePlayer,
        timeMs: activePlayer === PlayerId.Razmik ? razmikTimeMs : gayaneTimeMs,
        isCorrect,
        correctCount: explicitCorrectCount,
        spokenText: spokenText || undefined,
      };

      if (activePlayer === PlayerId.Razmik) {
        setRazmikAttempt(attempt);
        setTurnPhase('evaluated');
      } else {
        setGayaneAttempt(attempt);
        setTurnPhase('evaluated');
        if (razmikAttempt) {
          finalizeRoundWithBothAttempts(razmikAttempt, attempt);
        }
      }
    },
    [
      turnPhase,
      activePlayer,
      razmikTimeMs,
      gayaneTimeMs,
      spokenText,
      razmikAttempt,
      finalizeRoundWithBothAttempts,
    ]
  );

  // Move from Razmik's evaluated turn to Gayane's turn
  const handleNextPlayer = useCallback(() => {
    if (roundStage !== 'razmik_turn' || turnPhase !== 'evaluated') return;
    stopAllTimersAndSpeech();
    setRoundStage('gayane_turn');
    setTurnPhase('ready');
    setCountdownRemainingMs(null);
    setMemoryCountdown(5);
    setShowAnswer(false);
    setShowArmenian(false);
    setSprintChecks([false, false, false, false, false]);
    setSpokenText('');
    setSpeechError(null);
  }, [roundStage, turnPhase, stopAllTimersAndSpeech]);

  // Advance to next round (only on explicit button click)
  const handleNextRound = useCallback(() => {
    if (state.mode === AppMode.Competicion && state.currentRound >= state.totalRounds) {
      setState((prev) => saveCompetitionState({ ...prev, finished: true }));
      return;
    }

    const nextRoundNum =
      state.mode === AppMode.Competicion ? state.currentRound + 1 : state.currentRound + 1;

    const nextGameId =
      state.selectedGameId !== 'auto'
        ? state.selectedGameId
        : state.mode === AppMode.Competicion
        ? tournamentOrder[Math.min(state.totalRounds - 1, nextRoundNum - 1)] ?? GameId.NumerosRelampago
        : activeGameId;

    setState((prev) =>
      saveCompetitionState({
        ...prev,
        currentRound: nextRoundNum,
      })
    );
    prepareFreshRound(nextGameId, state.difficulty, state.pasadosFourTensesMode);
  }, [
    state.mode,
    state.currentRound,
    state.totalRounds,
    state.selectedGameId,
    state.difficulty,
    state.pasadosFourTensesMode,
    tournamentOrder,
    activeGameId,
    prepareFreshRound,
  ]);

  // Switch between Competición and Práctica libre
  const handleModeChange = (newMode: AppMode) => {
    if (newMode === state.mode) return;
    const nextSelected =
      newMode === AppMode.Practica && state.selectedGameId === 'auto'
        ? GameId.NumerosRelampago
        : newMode === AppMode.Competicion
        ? 'auto'
        : state.selectedGameId;

    setState((prev) =>
      saveCompetitionState({
        ...prev,
        mode: newMode,
        selectedGameId: nextSelected,
      })
    );

    const targetGame =
      nextSelected === 'auto'
        ? tournamentOrder[Math.max(0, state.currentRound - 1)] ?? GameId.NumerosRelampago
        : nextSelected;
    prepareFreshRound(targetGame, state.difficulty, state.pasadosFourTensesMode);
  };

  // Switch difficulty
  const handleDifficultyChange = (newDiff: Difficulty) => {
    if (newDiff === state.difficulty) return;
    setState((prev) => saveCompetitionState({ ...prev, difficulty: newDiff }));
    prepareFreshRound(activeGameId, newDiff, state.pasadosFourTensesMode);
  };

  // Pick a specific game directly
  const handleSelectSpecificGame = (choice: GameId | 'auto') => {
    setShowGamePicker(false);
    setState((prev) => saveCompetitionState({ ...prev, selectedGameId: choice }));
    const targetGame =
      choice === 'auto'
        ? tournamentOrder[Math.max(0, state.currentRound - 1)] ?? GameId.NumerosRelampago
        : choice;
    prepareFreshRound(targetGame, state.difficulty, state.pasadosFourTensesMode);
  };

  // Toggle Game 2 4-tense mode
  const handleTogglePasadosMode = (fourTenses: boolean) => {
    if (fourTenses === state.pasadosFourTensesMode) return;
    setState((prev) => saveCompetitionState({ ...prev, pasadosFourTensesMode: fourTenses }));
    if (activeGameId === GameId.PasadosVelocidad) {
      prepareFreshRound(GameId.PasadosVelocidad, state.difficulty, fourTenses);
    }
  };

  // Manual save button
  const handleManualSave = () => {
    const saved = saveCompetitionState(state);
    setState(saved);
    setSaveToast('Progreso guardado en este dispositivo');
    window.setTimeout(() => setSaveToast(null), 2600);
  };

  // Full competition reset
  const handleResetCompetition = () => {
    clearCompetitionState();
    usedTaskIdsRef.current.clear();
    const freshOrder = createTournamentGameOrder();
    setTournamentOrder(freshOrder);
    const initial = getInitialCompetitionState();
    const saved = saveCompetitionState(initial);
    setState(saved);
    setConfirmReset(false);
    setShowResultsModal(false);
    setSaveToast('Todo reiniciado (ronda 1, marcadores en 0)');
    window.setTimeout(() => setSaveToast(null), 2600);
    prepareFreshRound(freshOrder[0], initial.difficulty, initial.pasadosFourTensesMode);
  };

  // If 20 rounds finished in Competición mode -> show FinalScreen
  if (state.finished) {
    return (
      <div className="min-h-screen bg-[#E5F4FF] pb-12">
        <header className="border-b border-sky-200/80 bg-white/90 backdrop-blur-xs">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              🏆 ¡Batalla de Español! — Razmik vs Gayane
            </h1>
            <button
              type="button"
              onClick={handleResetCompetition}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              Nueva batalla
            </button>
          </div>
        </header>
        <FinalScreen state={state} onPlayAgain={handleResetCompetition} />
      </div>
    );
  }

  const progressPct =
    state.mode === AppMode.Competicion
      ? Math.min(100, Math.round((state.currentRound / state.totalRounds) * 100))
      : 100;

  return (
    <div className="min-h-screen bg-[#E5F4FF] text-slate-900 pb-12">
      {/* Top Scoreboard Bar (matching requested player headers + central progress) */}
      <header className="border-b border-sky-200/90 bg-white/95 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Razmik Team Card */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#FF6B00]/25 bg-[#FF6B00]/5 px-4 py-3 lg:min-w-[270px]">
              <div>
                <p className="text-base font-extrabold text-[#FF6B00] whitespace-nowrap">
                  ⚽ Razmik — Equipo Naranja
                </p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Victorias: <span className="font-timer font-bold text-slate-800">{state.winsRazmik}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-timer text-3xl font-extrabold text-[#FF6B00] leading-none">
                  {state.scoreRazmik}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500">puntos</span>
              </div>
            </div>

            {/* Center Title & Round Progress */}
            <div className="flex-1 text-center px-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                🏆 ¡Batalla de Español! — Razmik vs Gayane
              </h1>
              <div className="mt-1.5 flex flex-col items-center">
                <p className="text-sm font-bold text-slate-700">
                  {state.mode === AppMode.Competicion
                    ? `Ronda ${state.currentRound} de ${state.totalRounds} — Progreso ${state.currentRound}/${state.totalRounds}`
                    : `Práctica libre · Ronda #${state.currentRound}`}
                </p>
                {state.mode === AppMode.Competicion && (
                  <div className="mt-2 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-sky-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#EC008C] transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Gayane Team Card */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EC008C]/25 bg-[#EC008C]/5 px-4 py-3 lg:min-w-[270px]">
              <div>
                <p className="text-base font-extrabold text-[#EC008C] whitespace-nowrap">
                  🌸 Gayane — Equipo Rosa
                </p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Victorias: <span className="font-timer font-bold text-slate-800">{state.winsGayane}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-timer text-3xl font-extrabold text-[#EC008C] leading-none">
                  {state.scoreGayane}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500">puntos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-6xl px-4 pt-6 space-y-6">
        {/* Control Strip: Mode, Difficulty, Game Selector */}
        <section
          aria-label="Configuración de la partida"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 shadow-xs border border-sky-200/70"
        >
          {/* Mode Switch: Competición vs Práctica libre */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {[AppMode.Competicion, AppMode.Practica].map((modeOption) => (
              <button
                key={modeOption}
                type="button"
                onClick={() => handleModeChange(modeOption)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap sm:text-sm ${
                  state.mode === modeOption
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {modeOption === AppMode.Competicion ? '🏆 Competición' : '🎯 Práctica libre'}
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {[Difficulty.Facil, Difficulty.Medio, Difficulty.Dificil].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyChange(diff)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap sm:text-sm ${
                  state.difficulty === diff
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Specific Game Picker Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGamePicker((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap sm:text-sm"
            >
              <span>
                {state.selectedGameId === 'auto'
                  ? `🎲 Juego automático (${activeGameMeta.emoji} ${activeGameMeta.number}/10)`
                  : `${activeGameMeta.emoji} Juego ${activeGameMeta.number}: ${activeGameMeta.title}`}
              </span>
              {showGamePicker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showGamePicker && (
              <div className="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {state.mode === AppMode.Competicion && (
                  <button
                    type="button"
                    onClick={() => handleSelectSpecificGame('auto')}
                    className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors cursor-pointer ${
                      state.selectedGameId === 'auto'
                        ? 'bg-sky-50 text-sky-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>🎲</span>
                    <span>Orden del torneo (los 10 juegos)</span>
                  </button>
                )}
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {GAMES_META.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectSpecificGame(g.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors cursor-pointer ${
                        activeGameId === g.id && state.selectedGameId !== 'auto'
                          ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{g.emoji}</span>
                      <span className="truncate">
                        {g.number}. {g.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* General Reset Button */}
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap sm:text-sm"
              title="Reiniciar puntos, rondas, cronómetros y progreso"
            >
              <RotateCcw className="h-4 w-4" />
              🔄 Reiniciar todo
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5">
              <span className="text-xs font-bold text-rose-800 whitespace-nowrap">¿Reiniciar todo?</span>
              <button
                type="button"
                onClick={handleResetCompetition}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </section>

        {/* Independent Dual Stopwatches Row */}
        <section aria-label="Cronómetros de los jugadores" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Razmik Stopwatch Card */}
          <div
            className={`rounded-3xl bg-white p-5 transition-all border-2 ${
              roundStage === 'razmik_turn'
                ? 'border-[#FF6B00] shadow-md'
                : 'border-slate-200/80 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-[#FF6B00]">⚽ Razmik</p>
                <p className="text-xs font-medium text-slate-500">
                  {roundStage === 'razmik_turn'
                    ? turnPhase === 'running'
                      ? 'Cronómetro en marcha'
                      : turnPhase === 'memorizing'
                      ? 'Memorizando...'
                      : turnPhase === 'finished'
                      ? 'Intento terminado · Esperando revisión'
                      : turnPhase === 'evaluated'
                      ? razmikAttempt?.isCorrect
                        ? 'Evaluado: ✅ Correcto'
                        : 'Evaluado: ❌ Incorrecto'
                      : 'Listo para empezar'
                    : razmikAttempt
                    ? razmikAttempt.isCorrect
                      ? 'Turno completado · ✅ Correcto'
                      : 'Turno completado · ❌ Incorrecto'
                    : 'Turno completado'}
                </p>
              </div>
              <div className="text-right">
                <div className="font-timer text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  {formatStopwatch(razmikTimeMs)}
                </div>
              </div>
            </div>
          </div>

          {/* Gayane Stopwatch Card */}
          <div
            className={`rounded-3xl bg-white p-5 transition-all border-2 ${
              roundStage === 'gayane_turn'
                ? 'border-[#EC008C] shadow-md'
                : 'border-slate-200/80 opacity-85'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-[#EC008C]">🌸 Gayane</p>
                <p className="text-xs font-medium text-slate-500">
                  {roundStage === 'gayane_turn'
                    ? turnPhase === 'running'
                      ? 'Cronómetro en marcha'
                      : turnPhase === 'memorizing'
                      ? 'Memorizando...'
                      : turnPhase === 'finished'
                      ? 'Intento terminado · Esperando revisión'
                      : turnPhase === 'evaluated'
                      ? gayaneAttempt?.isCorrect
                        ? 'Evaluado: ✅ Correcto'
                        : 'Evaluado: ❌ Incorrecto'
                      : 'Listo para empezar'
                    : roundStage === 'razmik_turn'
                    ? 'Esperando su turno (bloqueado)'
                    : gayaneAttempt
                    ? gayaneAttempt.isCorrect
                      ? 'Turno completado · ✅ Correcto'
                      : 'Turno completado · ❌ Incorrecto'
                    : 'Esperando'}
                </p>
              </div>
              <div className="text-right">
                <div className="font-timer text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  {formatStopwatch(gayaneTimeMs)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Active Stage: Either Active Player Challenge OR Round Winner Card */}
        <AnimatePresence mode="wait">
          {roundStage === 'round_summary' && latestRoundRecord ? (
            <motion.section
              key="round-summary"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="rounded-3xl bg-white p-6 shadow-sm border border-sky-200 sm:p-10 text-center"
            >
              <div className="mx-auto max-w-xl">
                <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Trophy className="h-8 w-8" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  {latestRoundRecord.winner === PlayerId.Razmik && '🏆 ¡Gana Razmik!'}
                  {latestRoundRecord.winner === PlayerId.Gayane && '🏆 ¡Gana Gayane!'}
                  {latestRoundRecord.winner === 'tie' && '🤝 ¡Empate perfecto!'}
                  {latestRoundRecord.winner === 'none' && '😅 ¡Sin puntos esta ronda!'}
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Ronda {latestRoundRecord.roundNumber} · {latestRoundRecord.gameTitle} · Nivel{' '}
                  {latestRoundRecord.difficulty}
                </p>

                {/* Comparison rows */}
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center justify-between rounded-2xl border border-[#FF6B00]/25 bg-[#FF6B00]/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-[#FF6B00]">⚽ Razmik</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {latestRoundRecord.razmik.isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                        {typeof latestRoundRecord.razmik.correctCount === 'number'
                          ? ` (${latestRoundRecord.razmik.correctCount}/5)`
                          : ''}
                      </span>
                    </div>
                    <span className="font-timer text-xl font-bold text-slate-900">
                      {formatStopwatch(latestRoundRecord.razmik.timeMs)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-[#EC008C]/25 bg-[#EC008C]/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-[#EC008C]">🌸 Gayane</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {latestRoundRecord.gayane.isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                        {typeof latestRoundRecord.gayane.correctCount === 'number'
                          ? ` (${latestRoundRecord.gayane.correctCount}/5)`
                          : ''}
                      </span>
                    </div>
                    <span className="font-timer text-xl font-bold text-slate-900">
                      {formatStopwatch(latestRoundRecord.gayane.timeMs)}
                    </span>
                  </div>
                </div>

                {/* Difference & Points Awarded */}
                <div className="mt-6 space-y-1.5">
                  {latestRoundRecord.razmik.isCorrect && latestRoundRecord.gayane.isCorrect && (
                    <p className="text-base font-semibold text-slate-700">
                      Diferencia:{' '}
                      <span className="font-timer font-bold text-slate-900">
                        {formatSecondsDiff(
                          latestRoundRecord.razmik.timeMs - latestRoundRecord.gayane.timeMs
                        )}{' '}
                        segundos
                      </span>
                    </p>
                  )}

                  {latestRoundRecord.winner === PlayerId.Razmik && (
                    <p className="text-lg font-extrabold text-[#FF6B00]">
                      +1 punto para Razmik
                    </p>
                  )}
                  {latestRoundRecord.winner === PlayerId.Gayane && (
                    <p className="text-lg font-extrabold text-[#EC008C]">
                      +1 punto para Gayane
                    </p>
                  )}
                  {latestRoundRecord.winner === 'tie' && (
                    <p className="text-lg font-extrabold text-sky-700">
                      +1 punto para Razmik y +1 punto para Gayane
                    </p>
                  )}
                  {latestRoundRecord.winner === 'none' && (
                    <p className="text-base font-bold text-slate-600">
                      Ningún jugador acertó · 0 puntos asignados
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {state.mode === AppMode.Competicion && state.currentRound >= state.totalRounds
                      ? '🏆 Ver resultados finales'
                      : 'Siguiente ronda'}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={`${roundStage}-${currentTask.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl bg-white p-6 shadow-sm border border-sky-200 sm:p-8"
            >
              {/* Game Header inside Card */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold tracking-wide text-slate-500">
                    Juego {activeGameMeta.number} de 10 · Nivel {state.difficulty}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    {activeGameMeta.emoji} {activeGameMeta.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{activeGameMeta.shortDesc}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Turn Indicator */}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm font-extrabold text-white ${
                      activePlayer === PlayerId.Razmik ? 'bg-[#FF6B00]' : 'bg-[#EC008C]'
                    }`}
                  >
                    {activePlayer === PlayerId.Razmik ? '⚽ Turno de Razmik' : '🌸 Turno de Gayane'}
                  </div>

                  {/* Armenian toggle button on every task */}
                  <button
                    type="button"
                    onClick={() => setShowArmenian((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      showArmenian
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🇦🇲 Հայերեն
                  </button>

                  {/* Ver respuesta toggle directly visible in translation and tense-transformation games */}
                  {(currentTask.gameId === GameId.PasadosVelocidad ||
                    currentTask.gameId === GameId.TraduceRapidamente ||
                    currentTask.gameId === GameId.PalabrasEnAccion) && (
                    <button
                      type="button"
                      onClick={() => setShowAnswer((v) => !v)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        showAnswer
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      👀 {showAnswer ? 'Ocultar respuesta' : 'Ver respuesta'}
                    </button>
                  )}
                </div>
              </div>

              {/* Game 2 Submode Toggle (1 tense vs 4 tenses) */}
              {currentTask.gameId === GameId.PasadosVelocidad && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-bold text-slate-600">
                    Modo de tiempos pasados:
                  </span>
                  <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePasadosMode(false)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        !state.pasadosFourTensesMode
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      1 tiempo pedido
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePasadosMode(true)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        state.pasadosFourTensesMode
                          ? 'bg-white text-[#FF6B00] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Los 4 pasados seguidos
                    </button>
                  </div>
                </div>
              )}

              {/* Countdown Bar for Time-Limited Games (Game 6 & Game 8) */}
              {countdownRemainingMs !== null && (turnPhase === 'running' || turnPhase === 'finished') && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-bold text-amber-900">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {currentTask.gameId === GameId.CincoPreguntas30s
                        ? 'Cuenta atrás (30 segundos)'
                        : 'Tiempo límite para corregir'}
                    </span>
                    <span className="font-timer text-lg">
                      {(countdownRemainingMs / 1000).toFixed(2)} s
                    </span>
                  </div>
                </div>
              )}

              {/* Armenian Translation Box (collapsed by default; opens ONLY on click) */}
              {showArmenian && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-950">
                  <p className="font-bold">🇦🇲 Հայերեն թարգմանություն:</p>
                  <p className="mt-1 leading-relaxed">{currentTask.instructionHy}</p>
                  {currentTask.baseSentenceHy && (
                    <p className="mt-1.5 font-semibold text-amber-900">{currentTask.baseSentenceHy}</p>
                  )}
                  {currentTask.promptHy && (
                    <p className="mt-1.5 font-semibold text-amber-900">{currentTask.promptHy}</p>
                  )}
                  {currentTask.gameId === GameId.MemoriaVerbos && currentTask.memoryCommandHy && (
                    <p className="mt-1.5 font-semibold text-amber-900">{currentTask.memoryCommandHy}</p>
                  )}
                </div>
              )}

              {/* Task Stage Content */}
              <div className="mt-6">
                {/* 1. GAME 1: Números relámpago */}
                {currentTask.gameId === GameId.NumerosRelampago && currentTask.numbers && (
                  <div className="text-center py-4">
                    <p className="text-base font-semibold text-slate-600 mb-5">
                      {currentTask.instructionEs}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                      {currentTask.numbers.map((num, idx) => (
                        <div
                          key={`${num}-${idx}`}
                          className="font-timer flex min-w-[115px] items-center justify-center rounded-2xl border-2 border-sky-200 bg-[#E5F4FF]/60 px-5 py-5 text-3xl font-extrabold text-slate-900 sm:text-4xl"
                        >
                          {formatSpanishNumber(num)}
                        </div>
                      ))}
                    </div>
                    {turnPhase === 'ready' && (
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={handleShuffleNumbers}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Shuffle className="h-4 w-4" />
                          Mezclar números
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. GAME 2: Pasados a toda velocidad */}
                {currentTask.gameId === GameId.PasadosVelocidad && (
                  <div className="py-4 text-center">
                    <p className="text-sm font-bold text-sky-700">{currentTask.instructionEs}</p>
                    <p className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                      {currentTask.baseSentence}
                    </p>
                    {showArmenian && currentTask.baseSentenceHy && (
                      <p className="mt-2 text-base font-bold text-amber-900">
                        🇦🇲 {currentTask.baseSentenceHy}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                      <p className="text-lg font-bold text-[#FF6B00]">
                        Transforma al: {currentTask.targetTense}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowArmenian((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        🇦🇲 {showArmenian ? 'Ocultar հայերեն' : 'Ver en armenio'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3, 5, 6, 7: Prompt-based games */}
                {(currentTask.gameId === GameId.RespondeRapido ||
                  currentTask.gameId === GameId.TraduceRapidamente ||
                  currentTask.gameId === GameId.CorrigeError ||
                  currentTask.gameId === GameId.SituacionesRapidas) && (
                  <div className="py-5 text-center">
                    <p className="text-sm font-bold text-sky-700">{currentTask.instructionEs}</p>
                    <p className="mx-auto mt-4 max-w-3xl text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">
                      {currentTask.promptEs}
                    </p>
                    {showArmenian && currentTask.promptHy && (
                      <p className="mx-auto mt-2.5 max-w-2xl text-base font-bold text-amber-900">
                        🇦🇲 {currentTask.promptHy}
                      </p>
                    )}
                    {currentTask.gameId !== GameId.TraduceRapidamente && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setShowArmenian((v) => !v)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          🇦🇲 {showArmenian ? 'Ocultar հայերեն' : 'Ver en armenio'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. GAME 4: Memoria de verbos */}
                {currentTask.gameId === GameId.MemoriaVerbos && (
                  <div className="py-4 text-center">
                    {turnPhase === 'ready' && (
                      <div className="py-4">
                        <p className="text-lg font-bold text-slate-700">
                          Pulsa <span className="text-[#FF6B00]">¡Empezar!</span> para ver los 5 verbos durante 5 segundos.
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Después desaparecerán y aparecerá el tiempo verbal pedido.
                        </p>
                      </div>
                    )}

                    {turnPhase === 'memorizing' && currentTask.memoryVerbs && (
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Memoriza estos verbos ({memoryCountdown} s)...
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                          {currentTask.memoryVerbs.map((verb) => (
                            <span
                              key={verb}
                              className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-3 text-2xl font-extrabold text-slate-900"
                            >
                              {verb}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleSkipMemory}
                          className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          ¡Ya los memoricé! Ocultar ahora
                        </button>
                      </div>
                    )}

                    {(turnPhase === 'running' || turnPhase === 'finished' || turnPhase === 'evaluated') && (
                      <div className="py-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Verbos ocultos · ¡Usa tu memoria!
                        </p>
                        <p className="mx-auto mt-3 max-w-2xl text-2xl font-extrabold text-slate-900 sm:text-3xl">
                          {currentTask.memoryCommandEs}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. GAME 8: Cinco preguntas en 30 segundos */}
                {currentTask.gameId === GameId.CincoPreguntas30s && currentTask.sprintQuestions && (
                  <div className="py-2">
                    <p className="text-center text-sm font-bold text-sky-700 mb-4">
                      {currentTask.instructionEs}
                    </p>
                    <div className="space-y-2.5">
                      {currentTask.sprintQuestions.map((q, idx) => (
                        <div
                          key={q.questionEs}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-timer mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-base font-bold text-slate-900">{q.questionEs}</p>
                              {showArmenian && (
                                <p className="text-xs text-amber-800 mt-0.5">🇦🇲 {q.questionHy}</p>
                              )}
                              {showAnswer && (turnPhase === 'finished' || turnPhase === 'evaluated') && (
                                <p className="text-xs font-medium text-emerald-700 mt-1">
                                  Ejemplo: {q.sampleAnswerEs}
                                </p>
                              )}
                            </div>
                          </div>

                          {(turnPhase === 'finished' || turnPhase === 'evaluated') && (
                            <button
                              type="button"
                              disabled={turnPhase === 'evaluated'}
                              onClick={() =>
                                setSprintChecks((prev) =>
                                  prev.map((val, i) => (i === idx ? !val : val))
                                )
                              }
                              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                                sprintChecks[idx]
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {sprintChecks[idx] ? '✅ Acertada' : 'Marcar ✅'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. GAME 9: Palabras en acción */}
                {currentTask.gameId === GameId.PalabrasEnAccion && currentTask.armenianWords && (
                  <div className="py-4 text-center">
                    <p className="text-sm font-bold text-sky-700 mb-5">
                      {currentTask.instructionEs}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {currentTask.armenianWords.map((item) => (
                        <div
                          key={item.wordHy}
                          className="rounded-2xl border-2 border-sky-200 bg-[#E5F4FF]/60 px-6 py-4 text-2xl font-extrabold text-slate-900"
                        >
                          {item.wordHy}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. GAME 10: Desafío final */}
                {currentTask.gameId === GameId.DesafioFinal && currentTask.finalChallengeParts && (
                  <div className="py-2 space-y-3">
                    <p className="text-center text-sm font-bold text-sky-700 mb-3">
                      {currentTask.instructionEs}
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-bold text-slate-500">1. Tres números (1–10.000)</p>
                        <p className="font-timer mt-1.5 text-xl font-extrabold text-slate-900">
                          {currentTask.finalChallengeParts.numbers
                            .map((n) => formatSpanishNumber(n))
                            .join(' — ')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-bold text-slate-500">
                          2. Transforma al {currentTask.finalChallengeParts.tenseTarget}
                        </p>
                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                          {currentTask.finalChallengeParts.tenseBase}
                        </p>
                        {showArmenian && currentTask.finalChallengeParts.tenseBaseHy && (
                          <p className="mt-1 text-xs font-semibold text-amber-800">
                            🇦🇲 {currentTask.finalChallengeParts.tenseBaseHy}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-bold text-slate-500">3. Responde sobre ayer</p>
                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                          {currentTask.finalChallengeParts.yesterdayQuestionEs}
                        </p>
                        {showArmenian && (
                          <p className="mt-1 text-xs font-semibold text-amber-800">
                            🇦🇲 {currentTask.finalChallengeParts.yesterdayQuestionHy}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-bold text-slate-500">4. Traduce al español</p>
                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                          {currentTask.finalChallengeParts.translateHy}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2">
                        <p className="text-xs font-bold text-slate-500">5. Corrige el error gramatical</p>
                        <p className="mt-1.5 text-lg font-bold text-slate-900">
                          {currentTask.finalChallengeParts.errorSentence}
                        </p>
                        {showArmenian && currentTask.finalChallengeParts.errorSentenceHy && (
                          <p className="mt-1 text-xs font-semibold text-amber-800">
                            🇦🇲 {currentTask.finalChallengeParts.errorSentenceHy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Speech Recognition Live Transcript (optional voice input) */}
              {(spokenText || speechError || isListening) && (
                <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span>🎤 Reconocimiento de voz (es-ES)</span>
                    {isListening && <span className="text-rose-600">Escuchando...</span>}
                  </div>
                  {spokenText && (
                    <p className="mt-1.5 text-base font-semibold text-slate-900">“{spokenText}”</p>
                  )}
                  {speechError && (
                    <p className="mt-1 text-xs font-medium text-amber-800">{speechError}</p>
                  )}
                </div>
              )}

              {/* Answer Reveal Panel */}
              {showAnswer &&
                (turnPhase === 'finished' ||
                  turnPhase === 'evaluated' ||
                  currentTask.gameId === GameId.PasadosVelocidad ||
                  currentTask.gameId === GameId.TraduceRapidamente ||
                  currentTask.gameId === GameId.PalabrasEnAccion) && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                    ✅ Respuesta correcta
                  </p>
                  {currentTask.gameId === GameId.PasadosVelocidad &&
                  state.pasadosFourTensesMode &&
                  currentTask.allTensesAnswers ? (
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {currentTask.allTensesAnswers.map((item) => (
                        <div key={item.tense} className="rounded-xl bg-white px-3.5 py-2.5 border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-700">{item.tense}</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1.5 whitespace-pre-line text-lg font-bold text-slate-900">
                      {currentTask.answerEs}
                    </p>
                  )}
                  {currentTask.answerNoteEs && (
                    <p className="mt-2 text-xs font-medium text-emerald-800">
                      Nota para el profesor: {currentTask.answerNoteEs}
                    </p>
                  )}
                </div>
              )}

              {/* Primary Action Controls */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6">
                {turnPhase === 'ready' && (
                  <button
                    type="button"
                    onClick={handleStartTurn}
                    className={`inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-lg font-extrabold text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
                      activePlayer === PlayerId.Razmik
                        ? 'bg-[#FF6B00] hover:bg-[#e55f00]'
                        : 'bg-[#EC008C] hover:bg-[#d2007d]'
                    }`}
                  >
                    <Play className="h-5 w-5 fill-current" />
                    ▶️ ¡Empezar!
                  </button>
                )}

                {(turnPhase === 'running' || turnPhase === 'memorizing') && (
                  <>
                    <button
                      type="button"
                      onClick={handleFinishTurn}
                      className="inline-flex items-center gap-2.5 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-extrabold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Square className="h-5 w-5 fill-current" />
                      ⏹️ ¡Terminé!
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-4 text-base font-bold transition-colors cursor-pointer ${
                        isListening
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      🎤 {isListening ? 'Detener voz' : 'Hablar'}
                    </button>

                    <button
                      type="button"
                      onClick={handleRetryTurn}
                      className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-base font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-5 w-5" />
                      🔄 Intentar de nuevo
                    </button>
                  </>
                )}

                {turnPhase === 'finished' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAnswer((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Eye className="h-5 w-5" />
                      👀 {showAnswer ? 'Ocultar respuesta' : 'Ver respuesta'}
                    </button>

                    <button
                      type="button"
                      onClick={handleRetryTurn}
                      className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3.5 text-base font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-5 w-5" />
                      🔄 Intentar de nuevo
                    </button>

                    {currentTask.gameId === GameId.CincoPreguntas30s ? (
                      <button
                        type="button"
                        onClick={() => {
                          const count = sprintChecks.filter(Boolean).length;
                          handleEvaluatePlayer(count > 0, count);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-extrabold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-5 w-5" />
                        Confirmar aciertos ({sprintChecks.filter(Boolean).length}/5)
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEvaluatePlayer(true)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-extrabold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Check className="h-5 w-5" />
                          ✅ Correcto
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEvaluatePlayer(false)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-base font-extrabold text-white hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <X className="h-5 w-5" />
                          ❌ Incorrecto
                        </button>
                      </>
                    )}
                  </>
                )}

                {turnPhase === 'evaluated' && roundStage === 'razmik_turn' && (
                  <button
                    type="button"
                    onClick={handleNextPlayer}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-[#EC008C] px-8 py-4 text-lg font-extrabold text-white shadow-sm hover:bg-[#d2007d] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    ➡️ Siguiente jugador (Gayane)
                  </button>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Bottom Persistence & Teacher Actions Bar */}
        <section
          aria-label="Herramientas de progreso y resultados"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs border border-sky-200/70"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer sm:text-sm"
            >
              <Save className="h-4 w-4 text-sky-600" />
              💾 Guardar progreso
            </button>

            <button
              type="button"
              onClick={() => setShowResultsModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer sm:text-sm"
            >
              <BarChart3 className="h-4 w-4 text-[#FF6B00]" />
              📊 Ver resultados ({state.history.length})
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer sm:text-sm"
              >
                <Download className="h-4 w-4 text-[#EC008C]" />
                📥 Descargar resultados
              </button>

              {showExportMenu && (
                <div className="absolute bottom-full left-0 z-30 mb-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      exportResultsAsCSV(state);
                      setShowExportMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    📄 Exportar CSV (Excel)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportResultsAsJSON(state);
                      setShowExportMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    🗂️ Exportar JSON
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {saveToast && (
              <span className="text-xs font-bold text-emerald-700">{saveToast}</span>
            )}

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer sm:text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                🔄 Reiniciar competición
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5">
                <span className="text-xs font-bold text-rose-800">¿Reiniciar todo?</span>
                <button
                  type="button"
                  onClick={handleResetCompetition}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <ResultsModal
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        state={state}
      />
    </div>
  );
}
