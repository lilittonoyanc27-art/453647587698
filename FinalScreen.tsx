import { motion } from 'motion/react';
import { Trophy, RotateCcw, FileSpreadsheet, FileJson, CheckCircle2, XCircle } from 'lucide-react';
import ConfettiCanvas from './ConfettiCanvas';
import { CompetitionState, PlayerId } from './types';
import { exportResultsAsCSV, exportResultsAsJSON, formatStopwatch } from './storage';

interface FinalScreenProps {
  state: CompetitionState;
  onPlayAgain: () => void;
}

export default function FinalScreen({ state, onPlayAgain }: FinalScreenProps) {
  const isTie = state.scoreRazmik === state.scoreGayane;
  const winnerName = state.scoreRazmik > state.scoreGayane ? 'Razmik' : 'Gayane';
  const winnerIsRazmik = state.scoreRazmik > state.scoreGayane;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <ConfettiCanvas active />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-white p-6 shadow-sm border border-sky-200/80 sm:p-10"
      >
        {/* Trophy Hero */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl ${
              isTie
                ? 'bg-sky-100 text-sky-600'
                : winnerIsRazmik
                ? 'bg-[#FF6B00]/15 text-[#FF6B00]'
                : 'bg-[#EC008C]/15 text-[#EC008C]'
            }`}
          >
            <Trophy className="h-12 w-12" />
          </motion.div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            🏆 ¡RESULTADOS FINALES!
          </h2>

          {isTie ? (
            <p className="mt-3 text-xl font-bold text-sky-700 sm:text-2xl">
              ¡Empate! ¡Los dos sois campeones!
            </p>
          ) : (
            <p
              className={`mt-3 text-xl font-bold sm:text-2xl ${
                winnerIsRazmik ? 'text-[#FF6B00]' : 'text-[#EC008C]'
              }`}
            >
              {winnerIsRazmik ? '⚽' : '🌸'} ¡Enhorabuena, {winnerName}! ¡Eres el campeón de la batalla!
            </p>
          )}
        </div>

        {/* Summary Table */}
        <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Jugador</th>
                <th className="px-5 py-3.5 text-right">Puntos</th>
                <th className="px-5 py-3.5 text-right">Victorias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-base">
              <tr className="bg-white">
                <td className="px-5 py-4 font-bold text-[#FF6B00]">⚽ Razmik</td>
                <td className="font-timer px-5 py-4 text-right text-xl font-bold text-slate-900">
                  {state.scoreRazmik}
                </td>
                <td className="font-timer px-5 py-4 text-right text-lg font-semibold text-slate-700">
                  {state.winsRazmik}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-5 py-4 font-bold text-[#EC008C]">🌸 Gayane</td>
                <td className="font-timer px-5 py-4 text-right text-xl font-bold text-slate-900">
                  {state.scoreGayane}
                </td>
                <td className="font-timer px-5 py-4 text-right text-lg font-semibold text-slate-700">
                  {state.winsGayane}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#FF6B00] px-7 py-4 text-base font-bold text-white shadow-sm hover:bg-[#e55f00] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
            ¡Jugar otra vez!
          </button>

          <button
            type="button"
            onClick={() => exportResultsAsCSV(state)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            📥 Descargar CSV
          </button>

          <button
            type="button"
            onClick={() => exportResultsAsJSON(state)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileJson className="h-4 w-4" />
            📥 Descargar JSON
          </button>
        </div>

        {/* Detailed Round-by-Round Table */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Detalle completo de las {state.history.length} rondas
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Ronda</th>
                  <th className="px-4 py-3">Juego</th>
                  <th className="px-4 py-3 text-[#FF6B00]">⚽ Razmik</th>
                  <th className="px-4 py-3 text-[#EC008C]">🌸 Gayane</th>
                  <th className="px-4 py-3 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.history.map((r) => (
                  <tr key={`${r.roundNumber}-${r.timestamp}`} className="bg-white">
                    <td className="font-timer px-4 py-3 font-semibold text-slate-700">
                      #{r.roundNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.gameTitle}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-timer">
                        {r.razmik.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        )}
                        {formatStopwatch(r.razmik.timeMs)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-timer">
                        {r.gayane.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        )}
                        {formatStopwatch(r.gayane.timeMs)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      {r.winner === PlayerId.Razmik && (
                        <span className="text-[#FF6B00]">⚽ Razmik</span>
                      )}
                      {r.winner === PlayerId.Gayane && (
                        <span className="text-[#EC008C]">🌸 Gayane</span>
                      )}
                      {r.winner === 'tie' && <span className="text-sky-700">🤝 Empate</span>}
                      {r.winner === 'none' && <span className="text-slate-400">Sin puntos</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
