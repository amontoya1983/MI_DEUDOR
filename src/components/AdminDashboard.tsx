import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Layers,
  Search,
  Eye,
  Check,
  X,
  RefreshCw,
  Edit3,
  Sliders,
  FileCheck2,
  Activity,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Complaint,
  Debtor,
  AuditLog,
  User,
  DashboardMetrics,
  ScoreConfig,
} from '../types';
import { RiskBadge } from './RiskBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface AdminDashboardProps {
  currentUser: User;
  metrics: DashboardMetrics | null;
  complaints: Complaint[];
  debtors: Debtor[];
  auditLogs: AuditLog[];
  usersList: User[];
  scoreConfig: ScoreConfig;
  onApproveComplaint: (id: string, adminNotes: string) => Promise<boolean>;
  onRejectComplaint: (id: string, reason: string) => Promise<boolean>;
  onRequestCorrection: (id: string, notes: string) => Promise<boolean>;
  onDeactivateDebtor: (id: string) => Promise<boolean>;
  onReactivateDebtor: (id: string) => Promise<boolean>;
  onUpdateScoreConfig: (newConfig: ScoreConfig) => Promise<boolean>;
  onToggleUserStatus: (userId: string) => Promise<boolean>;
  onSelectDebtorDetail: (debtor: Debtor) => void;
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  metrics,
  complaints,
  debtors,
  auditLogs,
  usersList,
  scoreConfig,
  onApproveComplaint,
  onRejectComplaint,
  onRequestCorrection,
  onDeactivateDebtor,
  onReactivateDebtor,
  onUpdateScoreConfig,
  onToggleUserStatus,
  onSelectDebtorDetail,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'debtors' | 'algorithm' | 'audit' | 'users'>('complaints');
  const [statusFilter, setStatusFilter] = useState<string>('UNDER_REVIEW');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; fileType?: string } | null>(null);

  // Approval/Rejection Modals state
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalModalId, setApprovalModalId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [correctionModalId, setCorrectionModalId] = useState<string | null>(null);
  const [correctionNotes, setCorrectionNotes] = useState('');

  // Algorithm configuration state
  const [maxDebt, setMaxDebt] = useState<number>(scoreConfig.maxDebtReference);
  const [maxCreditors, setMaxCreditors] = useState<number>(scoreConfig.maxCreditorsReference);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<string | null>(null);

  // Audit search filter
  const [auditSearch, setAuditSearch] = useState('');

  // Debtors search filter
  const [debtorSearch, setDebtorSearch] = useState('');

  // Filter complaints based on status
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleApproveSubmit = async () => {
    if (!approvalModalId) return;
    const ok = await onApproveComplaint(approvalModalId, approvalNotes);
    if (ok) {
      setApprovalModalId(null);
      setApprovalNotes('');
      if (selectedComplaint?.id === approvalModalId) {
        setSelectedComplaint(null);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModalId || !rejectionReason.trim()) return;
    const ok = await onRejectComplaint(rejectModalId, rejectionReason);
    if (ok) {
      setRejectModalId(null);
      setRejectionReason('');
      if (selectedComplaint?.id === rejectModalId) {
        setSelectedComplaint(null);
      }
    }
  };

  const handleCorrectionSubmit = async () => {
    if (!correctionModalId || !correctionNotes.trim()) return;
    const ok = await onRequestCorrection(correctionModalId, correctionNotes);
    if (ok) {
      setCorrectionModalId(null);
      setCorrectionNotes('');
      if (selectedComplaint?.id === correctionModalId) {
        setSelectedComplaint(null);
      }
    }
  };

  const handleSaveAlgorithm = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      const ok = await onUpdateScoreConfig({
        maxDebtReference: Number(maxDebt),
        maxCreditorsReference: Number(maxCreditors),
      });
      if (ok) {
        setConfigMsg('Parámetros actualizados y recalificados en todos los registros.');
      }
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Módulo de Administración y Cumplimiento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Panel de Control Oficial
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Oficial: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={onRefreshAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>Sincronizar Datos</span>
        </button>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Denuncias Pendientes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 block mt-2">
            {metrics?.pendingComplaints ?? 0}
          </span>
          <span className="text-[11px] text-amber-400/80 mt-1 block">Requieren revisión manual</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Deudores Publicados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 block mt-2">
            {metrics?.publishedDebtors ?? 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Visibles en consulta pública</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Denuncias Rechazadas</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-red-400 block mt-2">
            {metrics?.rejectedComplaints ?? 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Sin mérito probatorio</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cartera Total Auditada</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-blue-400 block mt-2">
            {formatCurrency(metrics?.totalDebtReported ?? 0)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Total obligaciones en mora</span>
        </div>
      </div>

      {/* Top Ranking of Highest Risk Debtors */}
      {metrics?.topDebtorsRanking && metrics.topDebtorsRanking.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Ranking de Deudores con Mayor Puntuación de Riesgo (Top 5)
            </h2>
            <span className="text-xs text-slate-400">Mayor riesgo de insolvencia sistémica</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {metrics.topDebtorsRanking.map((debtor, index) => (
              <div
                key={debtor.id}
                onClick={() => onSelectDebtorDetail(debtor)}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                    #{index + 1}
                  </span>
                  <RiskBadge level={debtor.riskLevel} score={debtor.riskScore} size="sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{debtor.fullName}</h4>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {debtor.documentNumber}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-900 flex justify-between text-[11px]">
                  <span className="text-slate-400">Deuda:</span>
                  <span className="font-mono font-bold text-red-400">
                    {formatCurrency(debtor.totalDebt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-850 text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Bandeja de Denuncias ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'debtors'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-850 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Gestión de Registros ({debtors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('algorithm')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'algorithm'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-850 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configuración del Algoritmo</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-850 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Registro de Auditoría ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-850 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuarios Denunciantes ({usersList.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPLAINTS MODERATION TRAY */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filter Sub-Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Estado:</span>
              {(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT', 'ALL'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'UNDER_REVIEW'
                    ? 'En Revisión'
                    : st === 'APPROVED'
                    ? 'Aprobadas'
                    : st === 'REJECTED'
                    ? 'Rechazadas'
                    : st === 'DRAFT'
                    ? 'Borradores / Corrección'
                    : 'Todas'}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints Table/Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {filteredComplaints.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {filteredComplaints.map((c) => {
                  const totalAmt = c.debts.reduce((sum, d) => sum + d.amount, 0);

                  return (
                    <div
                      key={c.id}
                      className="p-5 sm:p-6 hover:bg-slate-850/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs text-blue-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {c.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              c.status === 'UNDER_REVIEW'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : c.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : c.status === 'REJECTED'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {c.status === 'UNDER_REVIEW'
                              ? '⏳ Pendiente de Auditoría'
                              : c.status === 'APPROVED'
                              ? '✓ Aprobada y Publicada'
                              : c.status === 'REJECTED'
                              ? '✕ Rechazada'
                              : 'Borrador / Corrección'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {formatDateTime(c.createdAt)}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white">
                            Deudor: {c.debtorData.fullName}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono">
                            Doc: {c.debtorData.documentNumber} • Ciudad: {c.debtorData.city}
                          </p>
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                          <span>
                            Denunciante: <strong className="text-white">{c.reporterName}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Monto Total:{' '}
                            <strong className="text-red-400 font-mono">
                              {formatCurrency(totalAmt)}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>{c.debts.length} obligación(es)</span>
                        </div>

                        {c.rejectionReason && (
                          <p className="text-xs text-red-300 bg-red-950/30 p-2 rounded border border-red-900/50">
                            <strong>Motivo de rechazo:</strong> {c.rejectionReason}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Auditar Expediente</span>
                        </button>

                        {c.status === 'UNDER_REVIEW' && (
                          <>
                            <button
                              id={`approve-btn-${c.id}`}
                              onClick={() => {
                                setApprovalModalId(c.id);
                                setApprovalNotes('Aprobado conforme a cotejo documental.');
                              }}
                              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar y Publicar</span>
                            </button>

                            <button
                              id={`reject-btn-${c.id}`}
                              onClick={() => {
                                setRejectModalId(c.id);
                                setRejectionReason('');
                              }}
                              className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>

                            <button
                              onClick={() => {
                                setCorrectionModalId(c.id);
                                setCorrectionNotes('');
                              }}
                              className="px-3 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-semibold"
                            >
                              Solicitar Corrección
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400">
                No hay denuncias en la bandeja con el filtro seleccionado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEBTORS MANAGEMENT (DAR DE BAJA / REACTIVAR) */}
      {activeTab === 'debtors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={debtorSearch}
                onChange={(e) => setDebtorSearch(e.target.value)}
                placeholder="Filtrar por nombre o documento..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <span className="text-xs text-slate-400">
              Total: <strong className="text-white">{debtors.length}</strong> deudores registrados
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Deudor</th>
                  <th className="p-3.5 font-bold">Documento</th>
                  <th className="p-3.5 font-bold">Ciudad</th>
                  <th className="p-3.5 font-bold">Monto Total</th>
                  <th className="p-3.5 font-bold">Score Riesgo</th>
                  <th className="p-3.5 font-bold">Estado Legal</th>
                  <th className="p-3.5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {debtors
                  .filter((d) => {
                    if (!debtorSearch.trim()) return true;
                    const q = debtorSearch.toLowerCase();
                    return d.fullName.toLowerCase().includes(q) || d.documentNumber.toLowerCase().includes(q);
                  })
                  .map((d) => (
                    <tr key={d.id} className="hover:bg-slate-850/40">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{d.fullName}</div>
                        <span className="text-[10px] text-slate-400">{d.id}</span>
                      </td>
                      <td className="p-3.5 font-mono">{d.documentNumber}</td>
                      <td className="p-3.5">{d.city}</td>
                      <td className="p-3.5 font-mono font-bold text-red-400">
                        {formatCurrency(d.totalDebt)}
                      </td>
                      <td className="p-3.5">
                        <RiskBadge level={d.riskLevel} score={d.riskScore} size="sm" />
                      </td>
                      <td className="p-3.5">
                        {d.status === 'PUBLISHED' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                            Publicado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-bold border border-slate-600">
                            Dado de baja / Inactivo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => onSelectDebtorDetail(d)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-blue-400 hover:text-white"
                        >
                          Ver
                        </button>
                        {d.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => onDeactivateDebtor(d.id)}
                            className="px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40"
                            title="Ocultar de la lista pública"
                          >
                            Dar de Baja
                          </button>
                        ) : (
                          <button
                            onClick={() => onReactivateDebtor(d.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40"
                            title="Restablecer visibilidad en consulta pública"
                          >
                            Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURABLE RISK SCORE ALGORITHM */}
      {activeTab === 'algorithm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              Parámetros del Algoritmo de Riesgo (1 al 100)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ajuste las variables maestras de normalización. Al modificar estos valores, el sistema recalcula en tiempo real el índice de riesgo de todos los deudores en la base de datos.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-blue-300 font-mono">
            score = ((montoTotal / {maxDebt.toLocaleString()} COP) * 70) + ((cantidadAcreedores / {maxCreditors}) * 30)
          </div>

          <form onSubmit={handleSaveAlgorithm} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Monto Máximo de Referencia (Base 70%):
              </label>
              <input
                type="number"
                min="1000000"
                step="1000000"
                value={maxDebt}
                onChange={(e) => setMaxDebt(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Valor representativo de insolvencia patrimonial máxima (ej. $50,000,000 COP).
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Cantidad Máxima de Acreedores de Referencia (Base 30%):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxCreditors}
                onChange={(e) => setMaxCreditors(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Número de acreedores distintos para alcanzar la saturación máxima de reincidencia (ej. 10).
              </span>
            </div>

            {configMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs">
                {configMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={configSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition"
            >
              {configSaving ? 'Recalculando Base de Datos...' : 'Actualizar Parámetros y Recalcular'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filtrar por acción, usuario o detalles..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <span className="text-xs text-slate-400">
              Registros inmutables: <strong className="text-white">{auditLogs.length}</strong>
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Fecha / Hora</th>
                  <th className="p-3.5 font-bold">Acción</th>
                  <th className="p-3.5 font-bold">Usuario</th>
                  <th className="p-3.5 font-bold">Entidad</th>
                  <th className="p-3.5 font-bold">Detalle del Evento</th>
                  <th className="p-3.5 font-bold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {auditLogs
                  .filter((log) => {
                    if (!auditSearch.trim()) return true;
                    const q = auditSearch.toLowerCase();
                    return (
                      log.action.toLowerCase().includes(q) ||
                      log.userName?.toLowerCase().includes(q) ||
                      log.details.toLowerCase().includes(q)
                    );
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/40">
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-white">{log.userName || 'Sistema'}</td>
                      <td className="p-3.5 font-mono text-slate-400">{log.entity}</td>
                      <td className="p-3.5 text-slate-300 max-w-md">{log.details}</td>
                      <td className="p-3.5 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Directorio de Usuarios de la Plataforma</h3>
            <p className="text-xs text-slate-400">
              Controle la activación o suspensión de cuentas de denunciantes y administradores.
            </p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Nombre / Razón Social</th>
                <th className="p-3.5 font-bold">Correo</th>
                <th className="p-3.5 font-bold">Rol</th>
                <th className="p-3.5 font-bold">Documento / NIT</th>
                <th className="p-3.5 font-bold">Estado</th>
                <th className="p-3.5 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/40">
                  <td className="p-3.5 font-bold text-white">{u.name}</td>
                  <td className="p-3.5 font-mono">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{u.documentNumber || 'N/A'}</td>
                  <td className="p-3.5">
                    {u.isActive ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Deshabilitado
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          u.isActive
                            ? 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30'
                            : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30'
                        }`}
                      >
                        {u.isActive ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPROVAL MODAL */}
      {approvalModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Aprobar y Publicar Denuncia
            </h3>
            <p className="text-xs text-slate-300">
              Al confirmar, el deudor quedará <strong>visible públicamente</strong> de inmediato y su puntaje de riesgo será calculado y publicado.
            </p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notas de Auditoría Oficial:</label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-white"
                placeholder="Indique los soportes verificados (pagarés, facturas, etc.)..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovalModalId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleApproveSubmit}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Confirmar Aprobación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Rechazar Denuncia
            </h3>
            <p className="text-xs text-slate-300">
              Es obligatorio especificar el motivo normativo o probatorio por el cual no procede la publicación.
            </p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Motivo Formal de Rechazo *</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-white"
                placeholder="Ej. Título sin mérito ejecutivo, firma no cotejable, prescripción evidente..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={handleRejectSubmit}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-md"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTION REQUEST MODAL */}
      {correctionModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Solicitar Correcciones al Denunciante
            </h3>
            <p className="text-xs text-slate-300">
              El reporte pasará a estado Borrador y el denunciante recibirá estas observaciones para subsanar.
            </p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Observaciones para el Denunciante *</label>
              <textarea
                rows={3}
                required
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-white"
                placeholder="Indique qué documentos debe adjuntar con mayor resolución o firmas..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCorrectionModalId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
              <button
                disabled={!correctionNotes.trim()}
                onClick={handleCorrectionSubmit}
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-md"
              >
                Remitir Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL COMPLAINT AUDIT MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Auditoría Integral de Denuncia: {selectedComplaint.id}
                </h3>
                <span className="text-xs text-slate-400">
                  Radicado por: {selectedComplaint.reporterName} ({selectedComplaint.reporterEmail})
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Datos del Deudor Reportado:</span>
                <div>Nombre: <strong className="text-slate-200">{selectedComplaint.debtorData.fullName}</strong></div>
                <div>Documento: <strong className="font-mono text-slate-200">{selectedComplaint.debtorData.documentNumber}</strong></div>
                <div>Ciudad: <strong className="text-slate-200">{selectedComplaint.debtorData.city}</strong></div>
                <div>Teléfono: <span className="text-slate-400">{selectedComplaint.debtorData.phone || 'N/A'}</span></div>
                <div>Correo: <span className="text-slate-400">{selectedComplaint.debtorData.email || 'N/A'}</span></div>
                <div>Dirección: <span className="text-slate-400">{selectedComplaint.debtorData.address || 'N/A'}</span></div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Validez Jurídica:</span>
                <div>Aceptó Términos: <strong className="text-emerald-400 font-semibold">SÍ (Declaración jurada)</strong></div>
                <div>Fecha Radicación: <span className="font-mono text-slate-300">{formatDateTime(selectedComplaint.createdAt)}</span></div>
                <div>Estado Actual: <strong className="text-amber-400">{selectedComplaint.status}</strong></div>
                {selectedComplaint.debtorData.observations && (
                  <p className="text-slate-400 italic mt-2">"{selectedComplaint.debtorData.observations}"</p>
                )}
              </div>
            </div>

            {/* Obligations List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white block">
                Obligaciones y Soportes Adjuntos ({selectedComplaint.debts.length}):
              </span>
              {selectedComplaint.debts.map((d, idx) => {
                const isPdf = d.documentFileType?.includes('pdf') || d.documentTitle?.toLowerCase().endsWith('.pdf');
                return (
                  <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white">Acreedor: {d.creditorName} ({d.creditorDocument || 'Sin NIT'})</span>
                      <span className="text-red-400 font-mono text-sm">{formatCurrency(d.amount, d.currency)}</span>
                    </div>
                    <p className="text-slate-300">{d.description}</p>
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-slate-400 font-mono">
                      <span>Vencimiento: {formatDate(d.dueDate)}</span>
                      {d.documentUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              title: d.documentTitle || 'Evidencia Documental Adjunta',
                              url: d.documentUrl || '',
                              fileType: d.documentFileType,
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-sans font-semibold bg-slate-900 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-750 transition"
                        >
                          {isPdf ? (
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{d.documentTitle || 'Auditar Evidencia'}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            ({isPdf ? 'PDF' : 'IMAGEN'})
                          </span>
                        </button>
                      ) : (
                        <span>{d.documentTitle || 'Sin archivo adjunto'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions for Pending Complaints inside modal */}
            {selectedComplaint.status === 'UNDER_REVIEW' && (
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setCorrectionModalId(selectedComplaint.id);
                    setCorrectionNotes('');
                  }}
                  className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Solicitar Corrección
                </button>
                <button
                  onClick={() => {
                    setRejectModalId(selectedComplaint.id);
                    setRejectionReason('');
                  }}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                >
                  Rechazar Denuncia
                </button>
                <button
                  onClick={() => {
                    setApprovalModalId(selectedComplaint.id);
                    setApprovalNotes('Aprobado tras cotejo de evidencia y validez de títulos.');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Aprobar y Publicar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for Evidence Document/Image Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2 min-w-0">
                {previewDoc.fileType?.includes('pdf') || previewDoc.title.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="w-5 h-5 text-red-400 shrink-0" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
                )}
                <span className="text-sm font-bold text-white truncate">{previewDoc.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-950/60">
              {previewDoc.fileType?.includes('pdf') || previewDoc.title.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-[65vh] flex flex-col">
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.title}
                    className="w-full h-full rounded-lg border border-slate-800 bg-white"
                  />
                  <div className="mt-2 text-center text-xs text-slate-400">
                    ¿No visualiza el PDF?{' '}
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      Abrir en pestaña nueva
                    </a>
                  </div>
                </div>
              ) : (
                <div className="max-h-[70vh] flex items-center justify-center">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.title}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
