import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Eye,
  Calendar,
  Building,
  DollarSign,
  FileCheck,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

interface ReporterDashboardProps {
  currentUser: User;
  complaints: Complaint[];
  onOpenNewComplaint: () => void;
  onRefresh: () => void;
}

export const ReporterDashboard: React.FC<ReporterDashboardProps> = ({
  currentUser,
  complaints,
  onOpenNewComplaint,
  onRefresh,
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; fileType?: string } | null>(null);

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            En Revisión
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprobada y Publicada
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
            <FileText className="w-3.5 h-3.5" />
            Borrador
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Suspendida
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            Bandeja de Denunciante Habilitado
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mis Denuncias Radicadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Entidad: <strong className="text-slate-200">{currentUser.name}</strong> • {currentUser.email}
          </p>
        </div>

        <button
          id="reporter-new-complaint-cta"
          onClick={onOpenNewComplaint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Radicar Nueva Denuncia</span>
        </button>
      </div>

      {/* Complaints List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Historial de Reportes Enviados ({complaints.length})
          </h2>
          <button
            onClick={onRefresh}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Actualizar Estados
          </button>
        </div>

        {complaints.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {complaints.map((comp) => {
              const totalAmount = comp.debts.reduce((sum, d) => sum + d.amount, 0);

              return (
                <div
                  key={comp.id}
                  className="p-5 sm:p-6 hover:bg-slate-850/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {comp.id}
                      </span>
                      {getStatusBadge(comp.status)}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comp.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">
                        Deudor: {comp.debtorData.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Doc: {comp.debtorData.documentNumber} • Ciudad: {comp.debtorData.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span>
                        Monto reportado:{' '}
                        <strong className="text-red-400 font-mono">
                          {formatCurrency(totalAmount)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>{comp.debts.length} obligación(es)</span>
                    </div>

                    {/* Show Rejection Reason if Rejected */}
                    {comp.status === 'REJECTED' && comp.rejectionReason && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 space-y-1">
                        <span className="font-bold block text-red-400">
                          Motivo de Rechazo por Mesa de Cumplimiento:
                        </span>
                        <p>{comp.rejectionReason}</p>
                      </div>
                    )}

                    {/* Show Correction Requested if Draft/Correction */}
                    {comp.correctionNotes && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 space-y-1">
                        <span className="font-bold block text-amber-400">
                          Corrección Solicitada por Administrador:
                        </span>
                        <p>{comp.correctionNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setSelectedComplaint(comp)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ver Ficha Radicada</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No ha radicado denuncias aún</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Utilice el formulario electrónico para radicar deudores morosos con los debidos documentos probatorios.
            </p>
            <button
              onClick={onOpenNewComplaint}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
            >
              Radicar Primera Denuncia
            </button>
          </div>
        )}
      </div>

      {/* Complaint Quick Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Detalle de Denuncia Radicada {selectedComplaint.id}
                </h3>
                <span className="text-xs text-slate-400">
                  Radicada el {formatDate(selectedComplaint.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Deudor:</span>
                  <span className="font-bold text-white">{selectedComplaint.debtorData.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Documento:</span>
                  <span className="font-mono text-white">{selectedComplaint.debtorData.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ciudad:</span>
                  <span className="text-white">{selectedComplaint.debtorData.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estado Actual:</span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block">Obligaciones Reportadas:</span>
                {selectedComplaint.debts.map((d, i) => {
                  const isPdf = d.documentFileType?.includes('pdf') || d.documentTitle?.toLowerCase().endsWith('.pdf');
                  return (
                    <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200">Acreedor: {d.creditorName}</span>
                        <span className="text-red-400 font-mono">{formatCurrency(d.amount, d.currency)}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{d.description}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
                        <span>Vencimiento: {formatDate(d.dueDate)}</span>
                        {d.documentUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc({
                                title: d.documentTitle || 'Evidencia de Respaldo',
                                url: d.documentUrl || '',
                                fileType: d.documentFileType,
                              })
                            }
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-sans font-semibold underline"
                          >
                            {isPdf ? (
                              <FileText className="w-3 h-3 text-red-400" />
                            ) : (
                              <ImageIcon className="w-3 h-3 text-blue-400" />
                            )}
                            <span>{d.documentTitle || 'Ver Evidencia Adjunta'}</span>
                          </button>
                        ) : (
                          <span>Soporte: {d.documentTitle || 'Evidencia radicada'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Evidence Preview */}
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
