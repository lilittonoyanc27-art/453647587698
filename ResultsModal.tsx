import { Download, FileSpreadsheet, FileJson, X, Trophy, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { CompetitionState, PlayerId } from './types';
import { exportResultsAsCSV, exportResultsAsJSON, formatStopwatch } from './storage';

interface ResultsModalProps {
  open: boolean;
  onClose: () => void;
  state: CompetitionState;
}

export default function ResultsModal({ open, onClose, state }: ResultsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="results-modal-title" className="text-xl font-bold text-slate-900">
              📊 Tabla de resultados y progreso
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Guardado local en este dispositivo
              {state.lastSavedAt
                ? ` · Último guardado: ${new Date(state.lastSavedAt).toLocaleTimeString('es-ES')}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Cerrar resultados"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-[#FF6B00]/25 bg-white px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#FF6B00]">⚽ Razmik — Equipo Naranja</p>
              <p className="text-xs text-slate-500 mt-0.5">Victorias de ronda: {state.winsRazmik}</p>
            </div>
            <div className="text-right">
              <span className="font-timer text-3xl font-bold text-slate-900">{state.scoreRazmik}</span>
              <span className="block text-xs text-slate-500">puntos</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#EC008C]/25 bg-white px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#EC008C]">🌸 Gayane — Equipo Rosa</p>
              <p className="text-xs text-slate-500 mt-0.5">Victorias de ronda: {state.winsGayane}</p>
            </div>
            <div className="text-right">
              <span className="font-timer text-3xl font-bold text-slate-900">{state.scoreGayane}</span>
              <span className="block text-xs text-slate-500">puntos</span>
            </div>
          </div>
        </div>

        {/* Round history table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.history.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-700">Todavía no se ha completado ninguna ronda.</p>
              <p className="mt-1 text-sm">Cuando Razmik y Gayane terminen la primera ronda, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="py-2.5 pr-3">Ronda</th>
                    <th className="py-2.5 pr-3">Juego</th>
                    <th className="py-2.5 pr-3">Nivel</th>
                    <th className="py-2.5 pr-3 text-[#FF6B00]">⚽ Razmik</th>
                    <th className="py-2.5 pr-3 text-[#EC008C]">🌸 Gayane</th>
                    <th className="py-2.5 text-right">Ganador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.history.map((round) => (
                    <tr key={`${round.roundNumber}-${round.timestamp}`} className="hover:bg-slate-50/70">
                      <td className="font-timer py-3 pr-3 font-semibold text-slate-700">
                        #{round.roundNumber}
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-900">{round.gameTitle}</td>
                      <td className="py-3 pr-3 text-slate-600">{round.difficulty}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1.5 font-timer">
                          {round.razmik.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          )}
                          <span className="text-slate-900">{formatStopwatch(round.razmik.timeMs)}</span>
                          {typeof round.razmik.correctCount === 'number' && (
                            <span className="text-xs text-slate-500">({round.razmik.correctCount}/5)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1.5 font-timer">
                          {round.gayane.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          )}
                          <span className="text-slate-900">{formatStopwatch(round.gayane.timeMs)}</span>
                          {typeof round.gayane.correctCount === 'number' && (
                            <span className="text-xs text-slate-500">({round.gayane.correctCount}/5)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold whitespace-nowrap">
                        {round.winner === PlayerId.Razmik && (
                          <span className="text-[#FF6B00]">⚽ Razmik (+{round.pointsRazmik})</span>
                        )}
                        {round.winner === PlayerId.Gayane && (
                          <span className="text-[#EC008C]">🌸 Gayane (+{round.pointsGayane})</span>
                        )}
                        {round.winner === 'tie' && (
                          <span className="text-sky-700">🤝 Empate (+1 c/u)</span>
                        )}
                        {round.winner === 'none' && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Minus className="h-3.5 w-3.5" /> Sin puntos
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportResultsAsCSV(state)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4" />
              📥 Descargar CSV
            </button>
            <button
              type="button"
              onClick={() => exportResultsAsJSON(state)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileJson className="h-4 w-4" />
              📥 Descargar JSON
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="hidden" />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
