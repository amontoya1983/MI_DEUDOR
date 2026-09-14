import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Building2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Eye,
  Calendar,
  Users,
  Layers,
} from 'lucide-react';
import { Debtor, RiskClassification } from '../types';
import { RiskBadge } from './RiskBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PublicSearchProps {
  debtors: Debtor[];
  totalPublished: number;
  totalDebtAmount: number;
  availableCities: string[];
  onSelectDebtor: (debtor: Debtor) => void;
  onOpenReportModal: () => void;
}

export const PublicSearch: React.FC<PublicSearchProps> = ({
  debtors,
  totalPublished,
  totalDebtAmount,
  availableCities,
  onSelectDebtor,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedRisk, setSelectedRisk] = useState<string>('TODOS');
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter debtors in real time
  const filteredDebtors = useMemo(() => {
    return debtors.filter((d) => {
      // Must be PUBLISHED for public view
      if (d.status !== 'PUBLISHED') return false;

      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesName = d.fullName.toLowerCase().includes(q);
        const matchesDoc = d.documentNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesDoc) return false;
      }

      if (selectedCity !== 'todas' && d.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      if (selectedRisk !== 'TODOS' && d.riskLevel !== selectedRisk) {
        return false;
      }

      return true;
    });
  }, [debtors, searchTerm, selectedCity, selectedRisk]);

  const totalPages = Math.ceil(filteredDebtors.length / itemsPerPage) || 1;
  const paginatedDebtors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDebtors.slice(start, start + itemsPerPage);
  }, [filteredDebtors, currentPage, itemsPerPage]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 border border-slate-700/70 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portal de Verificación y Consulta Pública
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Consulta de Deudores <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Auditados y Verificados
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Consulte en tiempo real los registros de personas naturales con obligaciones en mora certificadas por acreedores y revisadas de forma independiente por Oficiales de Cumplimiento.
          </p>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-slate-800 mt-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 text-xs block">Deudores Publicados</span>
            <span className="text-2xl font-black text-white font-mono">{totalPublished}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">✓ 100% Auditados</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 text-xs block">Monto Total Reportado</span>
            <span className="text-2xl font-black text-blue-400 font-mono">
              {formatCurrency(totalDebtAmount)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">En mora certificada</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 text-xs block">Acreedores Respaldados</span>
            <span className="text-2xl font-black text-white font-mono">
              {debtors.reduce((sum, d) => sum + d.creditorCount, 0)}
            </span>
            <span className="text-[11px] text-blue-400 block mt-0.5">Entidades e independientes</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 text-xs block">Control Legal</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">Manual</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Cero publicación auto.</span>
          </div>
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-input-debtor"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre completo o documento de identidad..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* City Filter */}
          <div className="md:col-span-3">
            <select
              id="city-filter-select"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="todas">Todas las ciudades</option>
              {availableCities.map((city) => (
                <option key={city} value={city.toLowerCase()}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="md:col-span-3">
            <select
              id="risk-filter-select"
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="TODOS">Todos los niveles de riesgo</option>
              <option value="BAJO">Riesgo Bajo (1 - 25)</option>
              <option value="MEDIO">Riesgo Medio (26 - 50)</option>
              <option value="ALTO">Riesgo Alto (51 - 75)</option>
              <option value="CRITICO">Riesgo Crítico (76 - 100)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Buttons & Algorithm Explanation Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Filtro Rápido:</span>
            {(['TODOS', 'CRITICO', 'ALTO', 'MEDIO', 'BAJO'] as const).map((lvl) => (
              <button
                key={lvl}
                id={`filter-pill-${lvl.toLowerCase()}`}
                onClick={() => {
                  setSelectedRisk(lvl);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  selectedRisk === lvl
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {lvl === 'TODOS' ? 'Todos' : lvl}
              </button>
            ))}
          </div>

          <button
            id="toggle-formula-card-btn"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition font-medium"
          >
            <Calculator className="w-3.5 h-3.5" />
            {showFormulaDetails ? 'Ocultar Metodología de Scoring' : '¿Cómo se calcula el puntaje (1-100)?'}
          </button>
        </div>

        {/* Algorithm Explanation Card */}
        {showFormulaDetails && (
          <div className="mt-3 p-4 bg-slate-950 border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-400" />
                Algoritmo Matemático de Calificación de Riesgo
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Ponderación: 70% Monto | 30% Acreedores
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              El índice de riesgo normalizado entre 1 y 100 refleja tanto la gravedad patrimonial del monto impago como la reiteración de impagos ante múltiples acreedores:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-blue-300 overflow-x-auto">
              score = ((montoTotal / montoMaximoReferencia) * 70) + ((cantidadAcreedores / acreedoresMaximosReferencia) * 30)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="font-bold block">1 - 25: Riesgo Bajo</span>
                Menor volumen de mora y 1 acreedor.
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <span className="font-bold block">26 - 50: Riesgo Medio</span>
                Mora persistente o varios créditos.
              </div>
              <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <span className="font-bold block">51 - 75: Riesgo Alto</span>
                Elevado saldo y múltiples acreedores.
              </div>
              <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                <span className="font-bold block">76 - 100: Riesgo Crítico</span>
                Alerta de insolvencia severa.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-white">{filteredDebtors.length}</strong> deudores verificados
          {searchTerm && ` para "${searchTerm}"`}
        </span>
        <span>
          Página <strong className="text-white">{currentPage}</strong> de {totalPages}
        </span>
      </div>

      {/* Debtors Grid */}
      {paginatedDebtors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDebtors.map((debtor) => (
            <div
              key={debtor.id}
              id={`debtor-card-${debtor.id}`}
              className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Photo, Name, Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={
                        debtor.photoUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={debtor.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow" title="Auditado y verificado">
                      ✓
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition">
                        {debtor.fullName}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>Doc:</span>
                      <span className="text-slate-300 font-semibold">{debtor.documentNumber}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>{debtor.city}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Score Pill & Bar */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Índice de Riesgo</span>
                    <RiskBadge level={debtor.riskLevel} score={debtor.riskScore} size="sm" />
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(Math.max(debtor.riskScore, 5), 100)}%`,
                        backgroundColor:
                          debtor.riskLevel === 'CRITICO'
                            ? '#DC2626'
                            : debtor.riskLevel === 'ALTO'
                            ? '#EA580C'
                            : debtor.riskLevel === 'MEDIO'
                            ? '#D97706'
                            : '#16A34A',
                      }}
                    />
                  </div>
                </div>

                {/* Key Financial Data */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Deuda Total</span>
                    <span className="text-sm font-bold text-red-400 font-mono">
                      {formatCurrency(debtor.totalDebt)}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Acreedores</span>
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {debtor.creditorCount} {debtor.creditorCount === 1 ? 'entidad' : 'entidades'}
                    </span>
                  </div>
                </div>

                {/* Observations quote */}
                {debtor.observations && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/30 p-2 rounded-lg border border-slate-800/40">
                    "{debtor.observations}"
                  </p>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Publicado: {formatDate(debtor.publishedAt)}
                </span>
                <button
                  id={`view-debtor-btn-${debtor.id}`}
                  onClick={() => onSelectDebtor(debtor)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold border border-blue-500/40 hover:border-blue-600 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Expediente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white">No se encontraron deudores registrados</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No existen deudores publicados con los criterios de búsqueda o ciudad especificada. Recuerde que únicamente se muestran expedientes formalmente aprobados por la mesa de cumplimiento.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('todas');
                setSelectedRisk('TODOS');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Restablecer Filtros
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
            >
              Reportar Deudor
            </button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            id="prev-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            id="next-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
