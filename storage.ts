import { AppMode, CompetitionState, Difficulty, PlayerId, RoundRecord } from './types';

const STORAGE_KEY = 'batalla_espanol_razmik_gayane_v1';

export function getInitialCompetitionState(): CompetitionState {
  return {
    mode: AppMode.Competicion,
    difficulty: Difficulty.Medio,
    selectedGameId: 'auto',
    pasadosFourTensesMode: false,
    currentRound: 1,
    totalRounds: 20,
    scoreRazmik: 0,
    scoreGayane: 0,
    winsRazmik: 0,
    winsGayane: 0,
    history: [],
    finished: false,
    lastSavedAt: null,
  };
}

export function loadCompetitionState(): CompetitionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialCompetitionState();
    const parsed = JSON.parse(raw) as Partial<CompetitionState>;
    return {
      ...getInitialCompetitionState(),
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return getInitialCompetitionState();
  }
}

export function saveCompetitionState(state: CompetitionState): CompetitionState {
  const stamped: CompetitionState = {
    ...state,
    lastSavedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
  } catch {
    // Ignore quota errors gracefully
  }
  return stamped;
}

export function clearCompetitionState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Formats milliseconds into MM:SS.CC (e.g. 7220 -> "00:07.22")
 */
export function formatStopwatch(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalCentis = Math.floor(safeMs / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const cc = String(centis).padStart(2, '0');
  return `${mm}:${ss}.${cc}`;
}

/**
 * Formats seconds difference cleanly (e.g. 3450ms -> "3.45 segundos")
 */
export function formatSecondsDiff(diffMs: number): string {
  return (Math.abs(diffMs) / 1000).toFixed(2);
}

function escapeCsvCell(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportResultsAsCSV(state: CompetitionState): void {
  const headers = [
    'Ronda',
    'Juego',
    'Nivel',
    'Razmik Tiempo',
    'Razmik Correcto',
    'Razmik Puntos',
    'Gayane Tiempo',
    'Gayane Correcto',
    'Gayane Puntos',
    'Ganador de Ronda',
    'Fecha',
  ];

  const rows = state.history.map((r: RoundRecord) => {
    const winnerLabel =
      r.winner === PlayerId.Razmik
        ? 'Razmik'
        : r.winner === PlayerId.Gayane
        ? 'Gayane'
        : r.winner === 'tie'
        ? 'Empate'
        : 'Sin puntos';
    return [
      r.roundNumber,
      r.gameTitle,
      r.difficulty,
      formatStopwatch(r.razmik.timeMs),
      r.razmik.isCorrect ? 'Sí' : 'No',
      r.pointsRazmik,
      formatStopwatch(r.gayane.timeMs),
      r.gayane.isCorrect ? 'Sí' : 'No',
      r.pointsGayane,
      winnerLabel,
      new Date(r.timestamp).toLocaleString('es-ES'),
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  const summaryRows = [
    '',
    'RESUMEN TOTAL',
    `Razmik — Puntos: ${state.scoreRazmik}, Victorias: ${state.winsRazmik}`,
    `Gayane — Puntos: ${state.scoreGayane}, Victorias: ${state.winsGayane}`,
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...rows, ...summaryRows].join('\n');
  triggerDownload(csvContent, 'resultados_batalla_espanol.csv', 'text/csv;charset=utf-8;');
}

export function exportResultsAsJSON(state: CompetitionState): void {
  const payload = {
    titulo: '¡Batalla de Español! — Razmik vs Gayane',
    exportadoEn: new Date().toISOString(),
    resumen: {
      razmik: { puntos: state.scoreRazmik, victorias: state.winsRazmik },
      gayane: { puntos: state.scoreGayane, victorias: state.winsGayane },
      rondasCompletadas: state.history.length,
    },
    rondas: state.history,
  };
  triggerDownload(
    JSON.stringify(payload, null, 2),
    'resultados_batalla_espanol.json',
    'application/json;charset=utf-8;'
  );
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
