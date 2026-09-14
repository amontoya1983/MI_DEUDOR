import React from 'react';
import { ShieldCheck, Scale, FileCheck2, Lock } from 'lucide-react';

interface FooterProps {
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              MI DEUDOR - Plataforma de Cumplimiento Crediticio
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Plataforma pública para la transparencia crediticia y reporte de obligaciones insolutas con soporte probatorio. Todo registro publicado ha surtido un proceso formal de verificación documental, notificación previa y auditoría administrativa inmutable.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Cifrado TLS 256-bit
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                Garantía Habeas Data
              </span>
              <span className="flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                Auditoría Inmutable
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Marco Legal y Garantías
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  id="footer-terms-btn"
                  onClick={onOpenTerms}
                  className="hover:text-blue-400 transition"
                >
                  Términos y Condiciones del Servicio
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-blue-400 transition"
                >
                  Política de Privacidad y Habeas Data
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-blue-400 transition"
                >
                  Derecho de Rectificación y Desfije
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-blue-400 transition"
                >
                  Responsabilidad Civil del Denunciante
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Mesa de Cumplimiento
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Oficina de Auditoría: cumplimiento@mideudor.com</li>
              <li>Atención Ciudadana: rectificaciones@mideudor.com</li>
              <li>Horario de Radicación: Lunes a Viernes 08:00 - 18:00</li>
              <li className="pt-2 text-[11px] text-slate-500">
                Bogotá D.C., Colombia • Cobertura Nacional
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MI DEUDOR. Todos los derechos reservados.</p>
          <p>Ningún registro es publicado sin previa revisión y cotejo por el Oficial de Cumplimiento.</p>
        </div>
      </div>
    </footer>
  );
};
