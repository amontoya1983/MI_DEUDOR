import React from 'react';
import { X, Scale, ShieldCheck, FileText, Check } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        id="legal-terms-modal"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Términos, Condiciones y Política de Habeas Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. Finalidad y Principio de No Publicación Automática
            </h3>
            <p>
              MI DEUDOR es una plataforma tecnológica de carácter consultivo y probatorio. <strong>Queda expresamente establecido que ninguna denuncia radicada en el portal es publicada de manera automática</strong>. Toda solicitud ingresa a una bandeja de auditoría para verificación documental previa por un Oficial de Cumplimiento autorizado, garantizando el respeto al buen nombre, el derecho de contradicción y el debido proceso.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              2. Declaración Jurada y Responsabilidad del Denunciante
            </h3>
            <p>
              El usuario denunciante manifiesta, bajo la gravedad de juramento, que las obligaciones reportadas corresponden a deudas ciertas, líquidas y actualmente exigibles, soportadas en títulos ejecutivos, pagarés válidamente otorgados, sentencias judiciales, facturas cambiarias o contratos con mérito de cobro.
            </p>
            <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400">
              La radicación de denuncias con dolo, información adulterada, deudas inexistentes o prescritas acarreará la cancelación irrevocable de la cuenta, sin perjuicio de las acciones penales por falsedad en documento y las demandas por responsabilidad civil extracontractual.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              3. Derecho de Rectificación y Desfije
            </h3>
            <p>
              Cualquier persona natural o jurídica que figure en los registros públicos de MI DEUDOR podrá solicitar en cualquier momento la rectificación, aclaración, suspensión o desfije de su registro aportando prueba del pago total, acuerdo de reestructuración o resolución judicial de extinción de la obligación. La plataforma responderá a las peticiones en un término máximo de dos (2) a cinco (5) días hábiles.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              4. Algoritmo de Cálculo de Riesgo Crediticio
            </h3>
            <p>
              El puntaje de 1 a 100 es una métrica matemática referencial normalizada con base en:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Monto total insoluto verificado (Ponderación: 70%).</li>
              <li>Dispersión o cantidad de acreedores distintos afectados (Ponderación: 30%).</li>
            </ul>
            <p>
              El índice resultante no constituye calificación crediticia bancaria formal bajo supervisión financiera, sino un indicador de exposición patrimonial reportada.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              5. Trazabilidad y Registro de Auditoría
            </h3>
            <p>
              Todas las interacciones, radicaciones, aprobaciones, rechazos, correcciones y modificaciones en el sistema quedan almacenadas de manera inmutable en bitácoras de auditoría criptográficas con dirección IP, fecha, hora y datos del operador actuante.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
