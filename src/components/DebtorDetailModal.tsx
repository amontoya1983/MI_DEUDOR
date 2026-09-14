import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  Scale,
  ExternalLink,
  CheckCircle2,
  Lock,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { Debtor } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { RiskBadge } from './RiskBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateRiskScore } from '../utils/scoreCalculator';

interface DebtorDetailModalProps {
  debtor: Debtor | null;
  onClose: () => void;
  onRequestCorrection?: (debtor: Debtor) => void;
}

export const DebtorDetailModal: React.FC<DebtorDetailModalProps> = ({
  debtor,
  onClose,
  onRequestCorrection,
}) => {
  const [showRectificationSent, setShowRectificationSent] = useState(false);
  const [rectificationReason, setRectificationReason] = useState('');
  const [rectificationEmail, setRectificationEmail] = useState('');
  const [showRectificationForm, setShowRectificationForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; fileType?: string } | null>(null);

  if (!debtor) return null;

  const scoreDetails = calculateRiskScore(debtor.totalDebt, debtor.creditorCount);

  const handleSendRectification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rectificationReason.trim()) return;
    setShowRectificationSent(true);
    setTimeout(() => {
      setShowRectificationSent(false);
      setShowRectificationForm(false);
      setRectificationReason('');
      setRectificationEmail('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        id="debtor-detail-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Expediente Público Certificado • ID: {debtor.id}
            </span>
          </div>
          <button
            id="close-debtor-detail-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Identity & Score Hero Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Debtor Photo and Identity */}
            <div className="md:col-span-7 flex flex-col sm:flex-row items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={
                    debtor.photoUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={debtor.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow" title="Auditado">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {debtor.fullName}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700 font-semibold text-slate-200">
                    Doc: {debtor.documentNumber}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {debtor.city}
                  </span>
                </div>

                {debtor.address && (
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500">Dirección registrada:</span> {debtor.address}
                  </p>
                )}

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Estado de Publicación:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Publicado y Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Score Gauge Widget */}
            <div className="md:col-span-5">
              <ScoreGauge
                score={debtor.riskScore}
                level={debtor.riskLevel}
                debtWeight={scoreDetails.debtWeight}
                creditorWeight={scoreDetails.creditorWeight}
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-xs block">Monto Total Adeudado</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-red-400">
                {formatCurrency(debtor.totalDebt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Número de Acreedores</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                {debtor.creditorCount}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Fecha de Publicación</span>
              <span className="text-sm sm:text-base font-medium font-mono text-slate-300 flex items-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(debtor.publishedAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Clasificación de Riesgo</span>
              <div className="mt-1">
                <RiskBadge level={debtor.riskLevel} score={debtor.riskScore} size="sm" />
              </div>
            </div>
          </div>

          {/* Observations Box */}
          {debtor.observations && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Observaciones del Expediente
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {debtor.observations}
              </p>
            </div>
          )}

          {/* Detailed Obligations & Debts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Detalle de Obligaciones Reportadas ({debtor.debts.length})
              </h3>
              <span className="text-xs text-slate-400">
                Documentos revisados y cotejados por el Oficial de Cumplimiento
              </span>
            </div>

            <div className="space-y-3">
              {debtor.debts.map((debt, idx) => (
                <div
                  key={debt.id || idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          Acreedor: {debt.creditorName}
                        </h4>
                      </div>
                      {debt.creditorDocument && (
                        <span className="text-xs text-slate-400 font-mono ml-8 block">
                          Identificación Acreedor: {debt.creditorDocument}
                        </span>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-mono font-black text-red-400">
                        {formatCurrency(debt.amount, debt.currency)}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">
                        Vencimiento: {formatDate(debt.dueDate)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Descripción: </strong>
                    {debt.description}
                  </p>

                  {/* Documents Attached */}
                  {debt.documents && debt.documents.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Soporte probatorio auditado:</span>
                      {debt.documents.map((doc) => {
                        const isPdf = doc.fileType?.includes('pdf') || doc.title.toLowerCase().endsWith('.pdf');
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                title: doc.title,
                                url: doc.fileUrl,
                                fileType: doc.fileType,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition group"
                          >
                            {isPdf ? (
                              <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[180px]">{doc.title}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white">
                              {isPdf ? 'PDF' : 'IMG'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legal Notice & Habeas Data Disclaimer */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Scale className="w-4 h-4 text-blue-400" />
              Aviso Legal de Responsabilidad y Debido Proceso
            </div>
            <p className="leading-relaxed">
              La información consignada en este expediente proviene de denuncias formuladas por acreedores bajo gravedad de juramento y respaldadas con títulos valores o contratos válidos, revisados administrativamente. Si usted es el titular de este registro y considera que la deuda ha sido extinguida o contiene inexactitudes, puede ejercer su derecho de rectificación.
            </p>
            <div className="pt-2">
              {!showRectificationForm ? (
                <button
                  id="start-rectification-btn"
                  onClick={() => setShowRectificationForm(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition"
                >
                  ¿Desea solicitar una corrección, rectificación o dar de baja este registro?
                </button>
              ) : (
                <form onSubmit={handleSendRectification} className="mt-3 p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3">
                  <h4 className="font-bold text-white text-xs">Solicitud de Rectificación / Habeas Data</h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Su correo electrónico para notificaciones legales:
                    </label>
                    <input
                      type="email"
                      required
                      value={rectificationEmail}
                      onChange={(e) => setRectificationEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Motivo y fundamentación de la rectificación (adjuntar soporte o constancia de pago):
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={rectificationReason}
                      onChange={(e) => setRectificationReason(e.target.value)}
                      placeholder="Indique si la obligación fue cancelada, prescribió o no corresponde a su identidad..."
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRectificationForm(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                    >
                      Radicar Solicitud de Rectificación
                    </button>
                  </div>
                </form>
              )}

              {showRectificationSent && (
                <div className="mt-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Solicitud de rectificación radicada exitosamente ante la Mesa de Cumplimiento. Se le notificará a su correo en un plazo máximo de 48 horas hábiles.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Registro Oficial Verificado • MI DEUDOR
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>

      {/* Document Preview Lightbox Modal */}
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
                <span className="text-sm font-bold text-white truncate">
                  {previewDoc.title}
                </span>
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
