import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Building,
  FileText,
  Eye,
  FileUp,
  File,
} from 'lucide-react';
import { ComplaintDebtInput } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (complaintData: any, isDraft: boolean) => Promise<boolean>;
  onOpenTerms: () => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  onOpenTerms,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{
    title: string;
    url: string;
    fileType?: string;
  } | null>(null);

  // Step 1: Debtor Details
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [observations, setObservations] = useState('');

  // Step 2: Debts List
  const [debts, setDebts] = useState<ComplaintDebtInput[]>([
    {
      creditorName: '',
      creditorDocument: '',
      amount: 0,
      currency: 'BS',
      dueDate: '',
      description: '',
      documentTitle: '',
      documentUrl: '',
    },
  ]);

  // Step 3: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAddDebt = () => {
    setDebts([
      ...debts,
      {
        creditorName: '',
        creditorDocument: '',
        amount: 0,
        currency: 'BS',
        dueDate: '',
        description: '',
        documentTitle: '',
        documentUrl: '',
      },
    ]);
  };

  const handleRemoveDebt = (index: number) => {
    if (debts.length === 1) return;
    setDebts(debts.filter((_, i) => i !== index));
  };

  const handleDebtChange = (index: number, field: keyof ComplaintDebtInput, value: any) => {
    const updated = [...debts];
    updated[index] = { ...updated[index], [field]: value };
    setDebts(updated);
  };

  const handleDocumentUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`El archivo ${file.name} supera el límite de 10 MB.`);
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setErrorMsg('Por favor seleccione un archivo PDF o imagen válida (.pdf, .jpg, .png, .webp).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = [...debts];
      updated[index] = {
        ...updated[index],
        documentTitle: file.name,
        documentUrl: dataUrl,
        documentFileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        documentFileSize: file.size,
      };
      setDebts(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (index: number) => {
    const updated = [...debts];
    updated[index] = {
      ...updated[index],
      documentTitle: '',
      documentUrl: '',
      documentFileType: undefined,
      documentFileSize: undefined,
    };
    setDebts(updated);
  };

  const handleAttachSamplePdf = (index: number) => {
    const updated = [...debts];
    updated[index] = {
      ...updated[index],
      documentTitle: 'Pagare_Notariado_Certificado.pdf',
      documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      documentFileType: 'application/pdf',
      documentFileSize: 850000,
    };
    setDebts(updated);
  };

  const handleAttachSampleImage = (index: number) => {
    const updated = [...debts];
    updated[index] = {
      ...updated[index],
      documentTitle: 'Foto_Contrato_Firmado.jpg',
      documentUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      documentFileType: 'image/jpeg',
      documentFileSize: 1240000,
    };
    setDebts(updated);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Mock Photo Upload / Preset
  const handlePhotoUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create object URL for local preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoUrl(previewUrl);
    }
  };

  const validateStep1 = () => {
    if (!fullName.trim()) return 'El nombre completo del deudor es obligatorio.';
    if (!documentNumber.trim()) return 'El número de documento de identidad es obligatorio.';
    if (!city.trim()) return 'La ciudad es obligatoria.';
    return null;
  };

  const validateStep2 = () => {
    for (let i = 0; i < debts.length; i++) {
      const d = debts[i];
      if (!d.creditorName.trim()) return `Obligación #${i + 1}: Debe ingresar el nombre del acreedor.`;
      if (!d.amount || d.amount <= 0) return `Obligación #${i + 1}: El monto debe ser superior a cero.`;
      if (!d.dueDate) return `Obligación #${i + 1}: Debe ingresar la fecha de vencimiento.`;
      if (!d.description.trim()) return `Obligación #${i + 1}: Debe detallar el concepto de la obligación.`;
    }
    return null;
  };

  const handleSubmit = async (isDraft: boolean) => {
    setErrorMsg(null);

    const err1 = validateStep1();
    if (err1) {
      setErrorMsg(err1);
      setActiveStep(1);
      return;
    }

    const err2 = validateStep2();
    if (err2) {
      setErrorMsg(err2);
      setActiveStep(2);
      return;
    }

    if (!isDraft && !termsAccepted) {
      setErrorMsg('Debe aceptar los términos legales y la declaración jurada de veracidad.');
      setActiveStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        debtor: {
          fullName,
          documentNumber,
          photoUrl,
          phone,
          email,
          address,
          city,
          observations,
        },
        debts,
        termsAccepted: true,
      };

      const success = await onSubmitComplaint(payload, isDraft);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al radicar la denuncia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        id="new-complaint-modal"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Radicar Denuncia y Reporte de Deudor
              </h2>
              <span className="text-xs text-slate-400">
                Paso {activeStep} de 3 • Formulario Electrónico Verificado
              </span>
            </div>
          </div>
          <button
            id="close-complaint-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold text-center bg-slate-950/40">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-3 px-2 border-b-2 transition ${
              activeStep === 1
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. Datos del Deudor
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`py-3 px-2 border-b-2 transition ${
              activeStep === 2
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            2. Obligaciones / Deudas ({debts.length})
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`py-3 px-2 border-b-2 transition ${
              activeStep === 3
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Declaración Jurada y Envío
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Debtor Information */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Identificación Oficial del Deudor</h3>
                <p className="text-xs text-slate-400">
                  Ingrese con exactitud los datos del deudor conforme a su documento de identidad.
                </p>
              </div>

              {/* Photo Upload & Preview */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Vista previa de deudor"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Fotografía del Deudor
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Suba una imagen nítida del rostro del deudor para facilitar su identificación inequívoca.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition border border-slate-700">
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>Seleccionar Archivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUploadSimulation}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80')
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      (Usar foto de muestra)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nombre Completo del Deudor <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="complaint-debtor-name"
                    type="text"
                    required
                    placeholder="Ej. Carlos Alberto Torres Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Número de Documento (Cédula/NIT/Pasaporte) <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="complaint-debtor-doc"
                    type="text"
                    required
                    placeholder="Ej. CC 71.392.810"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ciudad de Residencia / Obligación <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="complaint-debtor-city"
                    type="text"
                    required
                    placeholder="Ej. Bogotá, Medellín, Cali..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Teléfono de Contacto (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. +57 311 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Correo Electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="deudor@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dirección Domicilio / Comercial (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Calle 45 # 18-34"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Observaciones y Antecedentes del Caso (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa antecedentes relevantes, compromisos de pago incumplidos o circunstancias especiales..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Debts Information */}
          {activeStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Registro de Obligaciones y Evidencia</h3>
                  <p className="text-xs text-slate-400">
                    Registre cada crédito impago y adjunte el título valor o soporte legal que lo sustenta.
                  </p>
                </div>
                <button
                  type="button"
                  id="add-debt-row-btn"
                  onClick={handleAddDebt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Otra Deuda</span>
                </button>
              </div>

              {debts.map((debt, index) => (
                <div
                  key={index}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      Obligación #{index + 1}
                    </span>

                    {debts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDebt(index)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Nombre o Razón Social del Acreedor <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Distribuidora Central S.A.S."
                        value={debt.creditorName}
                        onChange={(e) => handleDebtChange(index, 'creditorName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        NIT o Documento del Acreedor
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. NIT 900.123.456-7"
                        value={debt.creditorDocument}
                        onChange={(e) => handleDebtChange(index, 'creditorDocument', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Monto Adeudado <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={debt.currency}
                          onChange={(e) => handleDebtChange(index, 'currency', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
                        >
                          <option value="BS">BS (Boliviano)</option>
                          <option value="COP">COP (Peso Col.)</option>
                          <option value="USD">USD (Dólar)</option>
                        </select>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Ej. 15000"
                          value={debt.amount || ''}
                          onChange={(e) => handleDebtChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Fecha de Vencimiento de la Mora <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={debt.dueDate}
                        onChange={(e) => handleDebtChange(index, 'dueDate', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Descripción de la Obligación o Causa de la Deuda <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describa el contrato de suministro, pagaré notariado, letra de cambio, factura o canon impago..."
                      value={debt.description}
                      onChange={(e) => handleDebtChange(index, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Evidencia Documental de Respaldo (PDF o Imagen) */}
                  <div className="pt-3 border-t border-slate-850 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-blue-400" />
                          Evidencia Documental de Respaldo (PDF o Imagen)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Adjunte el documento escaneado (PDF) o fotografía nítida del pagaré, factura cambiaria, contrato o mandamiento judicial.
                        </span>
                      </div>
                    </div>

                    {debt.documentTitle || debt.documentUrl ? (
                      /* Attached Document Card */
                      <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {debt.documentFileType?.includes('pdf') || debt.documentTitle?.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 overflow-hidden flex items-center justify-center text-blue-400 shrink-0">
                              {debt.documentUrl && debt.documentUrl.startsWith('data:image') ? (
                                <img
                                  src={debt.documentUrl}
                                  alt="Miniatura"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5" />
                              )}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                                {debt.documentTitle || 'Evidencia_Adjunta'}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  debt.documentFileType?.includes('pdf') || debt.documentTitle?.toLowerCase().endsWith('.pdf')
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                }`}
                              >
                                {debt.documentFileType?.includes('pdf') || debt.documentTitle?.toLowerCase().endsWith('.pdf')
                                  ? 'PDF'
                                  : 'IMAGEN'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {debt.documentFileSize ? formatFileSize(debt.documentFileSize) : 'Archivo verificado para auditoría'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {debt.documentUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDocument({
                                  title: debt.documentTitle || 'Evidencia de Respaldo',
                                  url: debt.documentUrl || '',
                                  fileType: debt.documentFileType,
                                })
                              }
                              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver</span>
                            </button>
                          )}

                          <label className="cursor-pointer px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1">
                            <FileUp className="w-3.5 h-3.5 text-slate-400" />
                            <span>Cambiar</span>
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={(e) => handleDocumentUpload(index, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(index)}
                            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
                            title="Quitar soporte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Empty Upload Dropzone */
                      <div className="bg-slate-900/60 border-2 border-dashed border-slate-700/80 hover:border-blue-500/70 rounded-xl p-4 transition text-center space-y-2">
                        <div className="flex justify-center gap-2 text-slate-400">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                          </div>
                        </div>

                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition">
                            <Upload className="w-4 h-4" />
                            <span>Adjuntar Archivo PDF o Imagen</span>
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={(e) => handleDocumentUpload(index, e)}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Formatos soportados: <strong>PDF, JPG, PNG, WebP</strong> (Máx. 10 MB por archivo)
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span>Soportes de prueba rápidos:</span>
                          <button
                            type="button"
                            onClick={() => handleAttachSamplePdf(index)}
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            (Ejemplo PDF)
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleAttachSampleImage(index)}
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            (Ejemplo Imagen)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Legal Terms and Acceptance */}
          {activeStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  Declaración Jurada y Marco de Cumplimiento Legal
                </h3>
                <p className="text-xs text-slate-400">
                  Por favor lea con atención antes de radicar la denuncia.
                </p>
              </div>

              {/* Warning Callout */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  REGLA OBLIGATORIA: NINGÚN DEUDOR SE PUBLICA AUTOMÁTICAMENTE
                </div>
                <p className="leading-relaxed text-amber-300/90">
                  Al enviar este formulario, la denuncia quedará registrada en estado <strong>"EN REVISIÓN"</strong>. El Administrador y Oficial de Cumplimiento de la plataforma validará que los documentos adjuntos tengan mérito ejecutivo antes de cualquier publicación en la lista pública.
                </p>
              </div>

              {/* Summary Review */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <span className="font-bold text-white block">Resumen del Reporte:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500">Deudor: </span>
                    <span className="font-semibold">{fullName || 'Sin especificar'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Documento: </span>
                    <span className="font-mono">{documentNumber || 'Sin especificar'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Obligaciones: </span>
                    <span className="font-bold text-red-400 font-mono">
                      {formatCurrency(
                        debts.reduce((sum, d) => sum + (d.amount || 0), 0),
                        debts[0]?.currency || 'BS'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Acreedores: </span>
                    <span>{debts.length} registradas</span>
                  </div>
                </div>

                {/* Attached Document Summary */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 font-semibold block mb-1.5">
                    Evidencia de Respaldo Adjunta ({debts.filter(d => d.documentTitle || d.documentUrl).length}/{debts.length}):
                  </span>
                  <div className="space-y-1.5">
                    {debts.map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-2 truncate">
                          {d.documentFileType?.includes('pdf') || d.documentTitle?.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate text-slate-200">
                            {d.documentTitle || `Obligación #${i + 1} (Sin archivo)`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {d.currency} {d.amount?.toLocaleString()}
                          </span>
                        </div>
                        {d.documentUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDocument({
                                title: d.documentTitle || 'Evidencia de Respaldo',
                                url: d.documentUrl || '',
                                fileType: d.documentFileType,
                              })
                            }
                            className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] underline shrink-0"
                          >
                            Ver
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="complaint-terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">
                      Declaro bajo la gravedad de juramento que la información y documentos suministrados son fidedignos, legítimos y exigibles.
                    </strong>{' '}
                    Asumo plena responsabilidad legal por eventuales perjuicios derivados de denuncias temerarias o fraudulentas, y acepto los{' '}
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      Términos y Condiciones del Servicio
                    </button>
                    .
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Guardar como Borrador
            </button>

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  if (activeStep === 1) {
                    const err = validateStep1();
                    if (err) {
                      setErrorMsg(err);
                      return;
                    }
                  } else if (activeStep === 2) {
                    const err = validateStep2();
                    if (err) {
                      setErrorMsg(err);
                      return;
                    }
                  }
                  setActiveStep((s) => (s + 1) as any);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                id="submit-complaint-btn"
                disabled={submitting || !termsAccepted}
                onClick={() => handleSubmit(false)}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition flex items-center gap-2"
              >
                {submitting ? (
                  <span>Radicando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Radicar Denuncia para Revisión</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Lightbox Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2 min-w-0">
                {previewDocument.fileType?.includes('pdf') || previewDocument.title.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="w-5 h-5 text-red-400 shrink-0" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
                )}
                <span className="text-sm font-bold text-white truncate">
                  {previewDocument.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-950/60">
              {previewDocument.fileType?.includes('pdf') || previewDocument.title.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-[65vh] flex flex-col">
                  <iframe
                    src={previewDocument.url}
                    title={previewDocument.title}
                    className="w-full h-full rounded-lg border border-slate-800 bg-white"
                  />
                  <div className="mt-2 text-center text-xs text-slate-400">
                    ¿No visualiza el PDF correctamente en su navegador?{' '}
                    <a
                      href={previewDocument.url}
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
                    src={previewDocument.url}
                    alt={previewDocument.title}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
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
