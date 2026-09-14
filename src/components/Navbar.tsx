import React from 'react';
import { Shield, ShieldAlert, FileText, UserCircle, LogIn, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentView: 'public' | 'reporter' | 'admin';
  onNavigate: (view: 'public' | 'reporter' | 'admin') => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenReportModal,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('public')}
              className="flex items-center gap-2.5 text-left group transition"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition duration-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  MI DEUDOR
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Oficial
                  </span>
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">
                  Consulta Pública y Auditoría de Crédito
                </span>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-public-btn"
                onClick={() => onNavigate('public')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  currentView === 'public'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Consulta Pública
              </button>

              {currentUser && (
                <button
                  id="nav-reporter-btn"
                  onClick={() => onNavigate('reporter')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                    currentView === 'reporter'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  Mis Denuncias
                </button>
              )}

              {currentUser?.role === 'ADMIN' && (
                <button
                  id="nav-admin-btn"
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                    currentView === 'admin'
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  Panel Administrador
                </button>
              )}
            </nav>
          </div>

          {/* Action Buttons & Session State */}
          <div className="flex items-center gap-3">
            <button
              id="report-debtor-cta-btn"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/30 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Reportar Deudor</span>
              <span className="sm:hidden">Reportar</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono uppercase">
                    {currentUser.role === 'ADMIN' ? 'Administrador' : 'Denunciante'}
                  </div>
                </div>

                <button
                  id="user-profile-badge"
                  onClick={() => onNavigate(currentUser.role === 'ADMIN' ? 'admin' : 'reporter')}
                  className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition"
                  title={`Sesión activa: ${currentUser.email}`}
                >
                  <UserCircle className="w-5 h-5" />
                </button>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-trigger-btn"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium transition"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
