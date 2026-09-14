import React from 'react';
import { RiskClassification } from '../types';
import { getRiskLevelInfo } from '../utils/scoreCalculator';

interface RiskBadgeProps {
  level: RiskClassification;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md',
}) => {
  const info = getRiskLevelInfo(level);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      id={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide ${info.badgeClass} ${sizeClasses}`}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: info.hexColor }}
      />
      <span>{info.label.split(' ')[1] || level}</span>
      {showScore && score !== undefined && (
        <span className="font-mono font-bold ml-1 opacity-90">({score}/100)</span>
      )}
    </span>
  );
};
