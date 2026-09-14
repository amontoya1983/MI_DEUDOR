import React from 'react';
import { RiskClassification } from '../types';
import { getRiskLevelInfo } from '../utils/scoreCalculator';

interface ScoreGaugeProps {
  score: number;
  level: RiskClassification;
  debtWeight?: number;
  creditorWeight?: number;
  showBreakdown?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  level,
  debtWeight,
  creditorWeight,
  showBreakdown = true,
}) => {
  const info = getRiskLevelInfo(level);

  return (
    <div id="score-gauge-container" className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Índice de Riesgo Crediticio
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ color: info.hexColor, backgroundColor: `${info.hexColor}20` }}
          >
            {level}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black font-mono tracking-tight" style={{ color: info.hexColor }}>
            {score}
          </span>
          <span className="text-xs font-mono text-slate-400">/100</span>
        </div>
      </div>

      {/* Progress Bar with Color Zones */}
      <div className="relative w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(Math.max(score, 2), 100)}%`,
            backgroundColor: info.hexColor,
            boxShadow: `0 0 12px ${info.hexColor}60`,
          }}
        />
      </div>

      {/* Threshold Indicators */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
        <span>0 (Bajo)</span>
        <span className="text-emerald-500/80">25</span>
        <span className="text-amber-500/80">50</span>
        <span className="text-orange-500/80">75</span>
        <span className="text-red-500/80">100 (Crítico)</span>
      </div>

      {showBreakdown && debtWeight !== undefined && creditorWeight !== undefined && (
        <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/50 rounded-lg p-2">
            <span className="text-slate-400 block text-[11px]">Ponderación Deuda (70%)</span>
            <span className="font-mono font-bold text-slate-200">{debtWeight.toFixed(1)} pts</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2">
            <span className="text-slate-400 block text-[11px]">Ponderación Acreedores (30%)</span>
            <span className="font-mono font-bold text-slate-200">{creditorWeight.toFixed(1)} pts</span>
          </div>
        </div>
      )}
    </div>
  );
};
