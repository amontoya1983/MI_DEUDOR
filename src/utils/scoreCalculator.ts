import { RiskClassification, ScoreConfig } from '../types';

export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  maxDebtReference: 50000000, // 50 millones COP / equivalente
  maxCreditorsReference: 10,  // 10 acreedores
};

/**
 * Calculates the Risk Score (1-100) based on configurable reference variables
 * Formula:
 * score = ((montoTotal / montoMaximoReferencia) * 70) + ((cantidadAcreedores / acreedoresMaximosReferencia) * 30)
 * Result is clamped between 1 and 100.
 */
export function calculateRiskScore(
  totalDebt: number,
  creditorCount: number,
  config: ScoreConfig = DEFAULT_SCORE_CONFIG
): { score: number; level: RiskClassification; debtWeight: number; creditorWeight: number } {
  const safeDebtRef = config.maxDebtReference > 0 ? config.maxDebtReference : 50000000;
  const safeCreditorRef = config.maxCreditorsReference > 0 ? config.maxCreditorsReference : 10;

  const debtRatio = Math.min(Math.max(totalDebt, 0) / safeDebtRef, 1);
  const creditorRatio = Math.min(Math.max(creditorCount, 0) / safeCreditorRef, 1);

  const debtWeight = debtRatio * 70;
  const creditorWeight = creditorRatio * 30;

  const rawScore = Math.round(debtWeight + creditorWeight);
  // Ensure normalized between 1 and 100 (never 0, always at least 1)
  const score = Math.min(Math.max(rawScore, 1), 100);

  let level: RiskClassification = 'BAJO';
  if (score >= 76) {
    level = 'CRITICO';
  } else if (score >= 51) {
    level = 'ALTO';
  } else if (score >= 26) {
    level = 'MEDIO';
  } else {
    level = 'BAJO';
  }

  return { score, level, debtWeight, creditorWeight };
}

export function getRiskLevelInfo(level: RiskClassification): {
  label: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textColor: string;
  hexColor: string;
  description: string;
} {
  switch (level) {
    case 'BAJO':
      return {
        label: 'Riesgo Bajo (1-25)',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        borderClass: 'border-emerald-500',
        bgClass: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        hexColor: '#16A34A',
        description: 'Obligaciones reducidas con un número mínimo de acreedores registrados.',
      };
    case 'MEDIO':
      return {
        label: 'Riesgo Medio (26-50)',
        badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        borderClass: 'border-amber-500',
        bgClass: 'bg-amber-500',
        textColor: 'text-amber-400',
        hexColor: '#D97706',
        description: 'Exposición moderada con varios acreedores o mora prolongada.',
      };
    case 'ALTO':
      return {
        label: 'Riesgo Alto (51-75)',
        badgeClass: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
        borderClass: 'border-orange-500',
        bgClass: 'bg-orange-500',
        textColor: 'text-orange-400',
        hexColor: '#EA580C',
        description: 'Alto volumen de deuda y múltiples acreedores en mora judicial o extrajudicial.',
      };
    case 'CRITICO':
      return {
        label: 'Riesgo Crítico (76-100)',
        badgeClass: 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold',
        borderClass: 'border-red-600',
        bgClass: 'bg-red-600',
        textColor: 'text-red-400',
        hexColor: '#DC2626',
        description: 'Alerta máxima. Multitud de acreedores y endeudamiento severo reportado.',
      };
  }
}
