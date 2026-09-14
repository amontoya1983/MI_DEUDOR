import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, ArrowRight, Building } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (data: { name: string; email: string; phone?: string; documentNumber?: string }) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const ok = await onLogin(email, password);
        if (ok) onClose();
      } else {
        const ok = await onRegister({ name, email, phone, documentNumber });
        if (ok) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('demo123');
    setLoading(true);
    setErrorMsg(null);
    try {
      const ok = await onLogin(quickEmail, 'demo123');
      if (ok) onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Acceso a MI DEUDOR' : 'Registro de Denunciante'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Inicie sesión para radicar denuncias o administrar el portal.'
              : 'Complete el registro para habilitar la radicación de obligaciones.'}
          </p>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block text-[11px] text-center uppercase tracking-wider">
            Acceso Rápido de Demostración
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-admin-login-btn"
              onClick={() => handleQuickLogin('admin@mideudor.com')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold text-center transition"
            >
              👑 Administrador
            </button>
            <button
              type="button"
              id="demo-reporter-login-btn"
              onClick={() => handleQuickLogin('denunciante@empresa.com')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold text-center transition"
            >
              🏢 Denunciante
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nombre Completo o Razón Social *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Inversiones Andina S.A.S."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Correo Electrónico *
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Contraseña {mode === 'login' ? '*' : '(opcional demo)'}
            </label>
            <input
              id="auth-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">NIT / Cédula</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="NIT 900.000..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              ¿No tiene cuenta de denunciante?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-400 hover:underline font-semibold"
              >
                Crear cuenta
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tiene cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-400 hover:underline font-semibold"
              >
                Iniciar sesión
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
