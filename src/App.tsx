import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicSearch } from './components/PublicSearch';
import { DebtorDetailModal } from './components/DebtorDetailModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { ReporterDashboard } from './components/ReporterDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { LegalTermsModal } from './components/LegalTermsModal';
import {
  Debtor,
  Complaint,
  AuditLog,
  User,
  DashboardMetrics,
  ScoreConfig,
} from './types';
import { DEFAULT_SCORE_CONFIG } from './utils/scoreCalculator';
import { ShieldCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function App() {
  // Session & Navigation State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mideudor_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<'public' | 'reporter' | 'admin'>('public');

  // Application Data Stores
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [totalPublished, setTotalPublished] = useState<number>(0);
  const [totalDebtAmount, setTotalDebtAmount] = useState<number>(0);

  // Complaints and Admin Data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [scoreConfig, setScoreConfig] = useState<ScoreConfig>(DEFAULT_SCORE_CONFIG);

  // Modals
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  // UI Feedback Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper Headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: currentUser ? `Bearer ${currentUser.id}` : '',
    };
  };

  // 1. Fetch Public Debtors
  const fetchPublicDebtors = useCallback(async () => {
    try {
      const res = await fetch('/api/debtors?all=true&limit=100');
      if (res.ok) {
        const data = await res.json();
        setDebtors(data.debtors || []);
        setAvailableCities(data.availableCities || []);

        const published = (data.debtors || []).filter((d: Debtor) => d.status === 'PUBLISHED');
        setTotalPublished(published.length);
        const debtSum = published.reduce((acc: number, d: Debtor) => acc + d.totalDebt, 0);
        setTotalDebtAmount(debtSum);
      }
    } catch (err) {
      console.error('Error fetching debtors:', err);
    }
  }, []);

  // 2. Fetch Score Config
  const fetchScoreConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config/score');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setScoreConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching score config:', err);
    }
  }, []);

  // 3. Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    try {
      const headers = getAuthHeaders();
      const [mRes, cRes, aRes, uRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/complaints?status=ALL', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setComplaints(cData.complaints || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData.auditLogs || []);
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  }, [currentUser]);

  // 4. Fetch Reporter Complaints
  const fetchReporterComplaints = useCallback(async () => {
    if (!currentUser) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/complaints/my', { headers });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching reporter complaints:', err);
    }
  }, [currentUser]);

  // Initial Load
  useEffect(() => {
    fetchPublicDebtors();
    fetchScoreConfig();
  }, [fetchPublicDebtors, fetchScoreConfig]);

  // Role Based Data Refresh
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchAdminData();
    } else if (currentUser?.role === 'REPORTER') {
      fetchReporterComplaints();
    }
  }, [currentUser, fetchAdminData, fetchReporterComplaints]);

  // Auth Operations
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Credenciales inválidas');
    }

    setCurrentUser(data.user);
    localStorage.setItem('mideudor_user', JSON.stringify(data.user));

    if (data.user.role === 'ADMIN') {
      setCurrentView('admin');
    } else {
      setCurrentView('reporter');
    }

    showToast(`Bienvenido a la plataforma, ${data.user.name}`, 'success');
    return true;
  };

  const handleRegister = async (regData: {
    name: string;
    email: string;
    phone?: string;
    documentNumber?: string;
  }): Promise<boolean> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error en registro');
    }

    setCurrentUser(data.user);
    localStorage.setItem('mideudor_user', JSON.stringify(data.user));
    setCurrentView('reporter');
    showToast('Registro de denunciante exitoso. Ya puede radicar deudores.', 'success');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mideudor_user');
    setCurrentView('public');
    showToast('Sesión finalizada con éxito.', 'info');
  };

  // Submit Complaint
  const handleSubmitComplaint = async (complaintData: any, isDraft: boolean): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    const res = await fetch(`/api/complaints${isDraft ? '?draft=true' : ''}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.details?.[0] || 'Error al radicar');
    }

    showToast(
      isDraft
        ? 'Borrador guardado correctamente'
        : '¡Denuncia radicada con éxito! Estado: EN REVISIÓN por Oficial de Cumplimiento.',
      'success'
    );

    fetchReporterComplaints();
    if (currentUser.role === 'ADMIN') fetchAdminData();
    return true;
  };

  // Admin Actions
  const handleApproveComplaint = async (id: string, adminNotes: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/complaints/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminNotes }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al aprobar', 'error');
      return false;
    }

    showToast('Denuncia aprobada y deudor publicado en la consulta pública.', 'success');
    fetchAdminData();
    fetchPublicDebtors();
    return true;
  };

  const handleRejectComplaint = async (id: string, reason: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/complaints/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al rechazar', 'error');
      return false;
    }

    showToast('Denuncia rechazada formalmente.', 'info');
    fetchAdminData();
    return true;
  };

  const handleRequestCorrection = async (id: string, notes: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/complaints/${id}/request-correction`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al solicitar corrección', 'error');
      return false;
    }

    showToast('Solicitud de corrección enviada al denunciante.', 'info');
    fetchAdminData();
    return true;
  };

  const handleDeactivateDebtor = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/debtors/${id}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al dar de baja', 'error');
      return false;
    }

    showToast('Registro de deudor retirado de la consulta pública.', 'info');
    fetchAdminData();
    fetchPublicDebtors();
    return true;
  };

  const handleReactivateDebtor = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/debtors/${id}/reactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al reactivar', 'error');
      return false;
    }

    showToast('Registro de deudor reactivado en la consulta pública.', 'success');
    fetchAdminData();
    fetchPublicDebtors();
    return true;
  };

  const handleUpdateScoreConfig = async (newConfig: ScoreConfig): Promise<boolean> => {
    const res = await fetch('/api/config/score', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newConfig),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al actualizar configuración', 'error');
      return false;
    }

    setScoreConfig(data.config);
    showToast('Algoritmo recalculado exitosamente con nuevos parámetros.', 'success');
    fetchPublicDebtors();
    fetchAdminData();
    return true;
  };

  const handleToggleUserStatus = async (userId: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Error al actualizar usuario', 'error');
      return false;
    }

    showToast(`Estado de usuario actualizado a: ${data.user.isActive ? 'ACTIVO' : 'INACTIVO'}`, 'info');
    fetchAdminData();
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-red-950 border-red-500/50 text-red-200'
              : 'bg-blue-950 border-blue-500/50 text-blue-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenReportModal={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsReportModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'public' && (
          <PublicSearch
            debtors={debtors}
            totalPublished={totalPublished}
            totalDebtAmount={totalDebtAmount}
            availableCities={availableCities}
            onSelectDebtor={(d) => setSelectedDebtor(d)}
            onOpenReportModal={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsReportModalOpen(true);
            }}
          />
        )}

        {currentView === 'reporter' && currentUser && (
          <ReporterDashboard
            currentUser={currentUser}
            complaints={complaints}
            onOpenNewComplaint={() => setIsReportModalOpen(true)}
            onRefresh={fetchReporterComplaints}
          />
        )}

        {currentView === 'admin' && currentUser?.role === 'ADMIN' && (
          <AdminDashboard
            currentUser={currentUser}
            metrics={metrics}
            complaints={complaints}
            debtors={debtors}
            auditLogs={auditLogs}
            usersList={usersList}
            scoreConfig={scoreConfig}
            onApproveComplaint={handleApproveComplaint}
            onRejectComplaint={handleRejectComplaint}
            onRequestCorrection={handleRequestCorrection}
            onDeactivateDebtor={handleDeactivateDebtor}
            onReactivateDebtor={handleReactivateDebtor}
            onUpdateScoreConfig={handleUpdateScoreConfig}
            onToggleUserStatus={handleToggleUserStatus}
            onSelectDebtorDetail={(d) => setSelectedDebtor(d)}
            onRefreshAll={() => {
              fetchAdminData();
              fetchPublicDebtors();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenTerms={() => setIsTermsModalOpen(true)} />

      {/* Modals */}
      <DebtorDetailModal
        debtor={selectedDebtor}
        onClose={() => setSelectedDebtor(null)}
      />

      <NewComplaintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitComplaint={handleSubmitComplaint}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <LegalTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}
