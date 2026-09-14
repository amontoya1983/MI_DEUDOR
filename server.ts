import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import {
  INITIAL_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_AUDIT_LOGS,
  buildDebtors,
} from './src/data/initialData';
import { Debtor, Complaint, AuditLog, User, ScoreConfig, RiskClassification } from './src/types';
import { calculateRiskScore, DEFAULT_SCORE_CONFIG } from './src/utils/scoreCalculator';

// In-Memory Database Stores with persistent runtime mutability
let scoreConfig: ScoreConfig = { ...DEFAULT_SCORE_CONFIG };
let users: User[] = [...INITIAL_USERS];
let debtors: Debtor[] = buildDebtors(scoreConfig);
let complaints: Complaint[] = [...INITIAL_COMPLAINTS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Current session simulation helper
function getSessionUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return users.find((u) => u.id === token || u.email === token) || null;
}

function logAudit(
  action: string,
  entity: string,
  entityId: string | undefined,
  details: string,
  userId?: string,
  userName?: string,
  req?: Request
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userName: userName || 'Sistema',
    action,
    entity,
    entityId,
    details,
    ipAddress: req?.ip || req?.socket.remoteAddress || '127.0.0.1',
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(newLog);
}

// Zod Validation Schemas
const ComplaintSchema = z.object({
  debtor: z.object({
    fullName: z.string().min(3, 'Nombre completo requerido'),
    documentNumber: z.string().min(4, 'Número de documento requerido'),
    photoUrl: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().min(2, 'Ciudad requerida'),
    observations: z.string().optional(),
  }),
  debts: z.array(
    z.object({
      creditorName: z.string().min(2, 'Nombre de acreedor requerido'),
      creditorDocument: z.string().optional(),
      amount: z.number().positive('El monto debe ser positivo'),
      currency: z.string().default('BS'),
      dueDate: z.string().min(4, 'Fecha de vencimiento requerida'),
      description: z.string().min(5, 'Descripción de la obligación requerida'),
      documentTitle: z.string().optional(),
      documentUrl: z.string().optional(),
      documentFileType: z.string().optional(),
      documentFileSize: z.number().optional(),
    })
  ).min(1, 'Debe registrar al menos una obligación'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos legales y declaración jurada',
  }),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Auth Endpoints
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Usuario deshabilitado por administración.' });
      return;
    }

    logAudit('USER_LOGIN', 'USER', user.id, `Inicio de sesión exitoso de ${user.email}`, user.id, user.name, req);

    res.json({
      token: user.id,
      user,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, phone, documentNumber } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Nombre y correo electrónico son obligatorios.' });
      return;
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      res.status(400).json({ error: 'Este correo ya se encuentra registrado.' });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'REPORTER',
      phone: phone?.trim(),
      documentNumber: documentNumber?.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    logAudit('USER_REGISTERED', 'USER', newUser.id, `Nuevo denunciante registrado: ${newUser.name} (${newUser.email})`, newUser.id, newUser.name, req);

    res.status(201).json({
      token: newUser.id,
      user: newUser,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    res.json({ user });
  });

  // 2. Public Debtors Query & Profile
  app.get('/api/debtors', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const city = ((req.query.city as string) || '').toLowerCase().trim();
    const riskLevel = ((req.query.riskLevel as string) || '').toUpperCase().trim();
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '9', 10);
    const includeInactive = req.query.all === 'true';

    let filtered = debtors.filter((d) => {
      if (!includeInactive && d.status !== 'PUBLISHED') return false;

      if (search) {
        const matchesName = d.fullName.toLowerCase().includes(search);
        const matchesDoc = d.documentNumber.toLowerCase().includes(search);
        if (!matchesName && !matchesDoc) return false;
      }

      if (city && city !== 'todas') {
        if (d.city.toLowerCase() !== city) return false;
      }

      if (riskLevel && riskLevel !== 'TODOS') {
        if (d.riskLevel !== riskLevel) return false;
      }

      return true;
    });

    // Sort by riskScore descending by default
    filtered.sort((a, b) => b.riskScore - a.riskScore);

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Collect available cities for filter dropdown
    const availableCities = Array.from(new Set(debtors.map((d) => d.city))).sort();

    res.json({
      debtors: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      availableCities,
    });
  });

  app.get('/api/debtors/:id', (req: Request, res: Response) => {
    const debtor = debtors.find((d) => d.id === req.params.id);
    if (!debtor) {
      res.status(404).json({ error: 'Registro de deudor no encontrado.' });
      return;
    }
    res.json({ debtor });
  });

  // 3. Complaints Submission & Management
  app.post('/api/complaints', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'Debe iniciar sesión como Denunciante para radicar un reporte.' });
      return;
    }

    const parseResult = ComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Datos de la denuncia inválidos',
        details: parseResult.error.issues.map((e) => e.message),
      });
      return;
    }

    const { debtor, debts: incomingDebts, termsAccepted } = parseResult.data;
    const isDraft = req.query.draft === 'true';

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      reporterId: user.id,
      reporterName: user.name,
      reporterEmail: user.email,
      debtorData: {
        fullName: debtor.fullName.trim(),
        documentNumber: debtor.documentNumber.trim(),
        photoUrl: debtor.photoUrl || '',
        phone: debtor.phone?.trim() || '',
        email: debtor.email?.trim() || '',
        address: debtor.address?.trim() || '',
        city: debtor.city.trim(),
        observations: debtor.observations?.trim() || '',
      },
      debts: incomingDebts.map((d) => ({
        creditorName: d.creditorName.trim(),
        creditorDocument: d.creditorDocument?.trim() || '',
        amount: d.amount,
        currency: d.currency || 'BS',
        dueDate: d.dueDate,
        description: d.description.trim(),
        documentTitle: d.documentTitle || 'Evidencia Soporte Radicada',
        documentUrl: d.documentUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        documentFileType: d.documentFileType || (d.documentTitle?.toLowerCase().endsWith('.pdf') || d.documentUrl?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
        documentFileSize: d.documentFileSize || 1200000,
      })),
      status: isDraft ? 'DRAFT' : 'UNDER_REVIEW',
      termsAccepted: !!termsAccepted,
      termsAcceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    complaints.unshift(newComplaint);

    logAudit(
      isDraft ? 'COMPLAINT_SAVED_DRAFT' : 'COMPLAINT_SUBMITTED',
      'COMPLAINT',
      newComplaint.id,
      `Denuncia radicada contra ${debtor.fullName} (${debtor.documentNumber}) por $${incomingDebts.reduce((s, i) => s + i.amount, 0).toLocaleString()} COP. Estado: ${newComplaint.status}`,
      user.id,
      user.name,
      req
    );

    res.status(201).json({
      message: isDraft
        ? 'Borrador guardado exitosamente'
        : 'Denuncia enviada exitosamente. Se encuentra EN REVISIÓN por el Administrador.',
      complaint: newComplaint,
    });
  });

  app.get('/api/complaints/my', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const myComplaints = complaints.filter((c) => c.reporterId === user.id);
    res.json({ complaints: myComplaints });
  });

  // 4. Admin Workflow & Moderation
  app.get('/api/admin/complaints', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores de Cumplimiento.' });
      return;
    }

    const status = req.query.status as string;
    let filtered = complaints;
    if (status && status !== 'ALL') {
      filtered = complaints.filter((c) => c.status === status);
    }

    res.json({ complaints: filtered });
  });

  // Approve Complaint -> Publishes Debtor
  app.post('/api/admin/complaints/:id/approve', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const complaint = complaints.find((c) => c.id === req.params.id);
    if (!complaint) {
      res.status(404).json({ error: 'Denuncia no encontrada.' });
      return;
    }

    const { adminNotes } = req.body;
    complaint.status = 'APPROVED';
    complaint.adminNotes = adminNotes || 'Aprobado tras cotejo de evidencia y validez de títulos ejecutivos.';
    complaint.reviewedByUserId = user.id;
    complaint.reviewedAt = new Date().toISOString();
    complaint.updatedAt = new Date().toISOString();

    // Check if debtor already exists by documentNumber
    let debtor = debtors.find(
      (d) => d.documentNumber.toLowerCase() === complaint.debtorData.documentNumber.toLowerCase()
    );

    const mappedDebts = complaint.debts.map((d, index) => ({
      id: `debt-${Date.now()}-${index}`,
      debtorId: debtor ? debtor.id : `deb-${Date.now()}`,
      creditorName: d.creditorName,
      creditorDocument: d.creditorDocument,
      amount: d.amount,
      currency: d.currency,
      dueDate: d.dueDate,
      description: d.description,
      status: 'PENDING' as const,
      documents: [
        {
          id: `doc-${Date.now()}-${index}`,
          title: d.documentTitle || 'Título Soporte Verificado',
          fileUrl: d.documentUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: d.documentFileType || (d.documentTitle?.toLowerCase().endsWith('.pdf') || d.documentUrl?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
          fileSize: d.documentFileSize || 1200000,
          uploadedAt: new Date().toISOString(),
        },
      ],
    }));

    if (debtor) {
      debtor.debts.push(...mappedDebts);
      debtor.status = 'PUBLISHED';
      debtor.publishedAt = debtor.publishedAt || new Date().toISOString();
      debtor.updatedAt = new Date().toISOString();
      if (complaint.debtorData.photoUrl && !debtor.photoUrl) {
        debtor.photoUrl = complaint.debtorData.photoUrl;
      }
    } else {
      const newDebtorId = `deb-${Date.now()}`;
      debtor = {
        id: newDebtorId,
        fullName: complaint.debtorData.fullName,
        documentNumber: complaint.debtorData.documentNumber,
        photoUrl:
          complaint.debtorData.photoUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        phone: complaint.debtorData.phone,
        email: complaint.debtorData.email,
        address: complaint.debtorData.address,
        city: complaint.debtorData.city,
        observations: complaint.debtorData.observations,
        totalDebt: 0,
        creditorCount: 0,
        riskScore: 1,
        riskLevel: 'BAJO',
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        debts: mappedDebts,
      };
      debtors.unshift(debtor);
    }

    // Recalculate Debtor totals and Risk Score
    const totalDebt = debtor.debts.reduce((sum, d) => sum + d.amount, 0);
    const creditorSet = new Set(debtor.debts.map((d) => d.creditorName.toLowerCase().trim()));
    const creditorCount = creditorSet.size;
    const { score, level } = calculateRiskScore(totalDebt, creditorCount, scoreConfig);

    debtor.totalDebt = totalDebt;
    debtor.creditorCount = creditorCount;
    debtor.riskScore = score;
    debtor.riskLevel = level;

    complaint.debtorId = debtor.id;

    logAudit(
      'COMPLAINT_APPROVED',
      'COMPLAINT',
      complaint.id,
      `Denuncia aprobada por ${user.name}. Deudor publicado: ${debtor.fullName} con Score: ${score} (${level}).`,
      user.id,
      user.name,
      req
    );

    res.json({
      message: 'Denuncia aprobada y deudor publicado en la plataforma pública.',
      complaint,
      debtor,
    });
  });

  // Reject Complaint
  app.post('/api/admin/complaints/:id/reject', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const complaint = complaints.find((c) => c.id === req.params.id);
    if (!complaint) {
      res.status(404).json({ error: 'Denuncia no encontrada.' });
      return;
    }

    const { reason, adminNotes } = req.body;
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'Es obligatorio indicar el motivo legal o probatorio del rechazo.' });
      return;
    }

    complaint.status = 'REJECTED';
    complaint.rejectionReason = reason.trim();
    complaint.adminNotes = adminNotes?.trim() || 'Rechazado tras revisión de cumplimiento normativo.';
    complaint.reviewedByUserId = user.id;
    complaint.reviewedAt = new Date().toISOString();
    complaint.updatedAt = new Date().toISOString();

    logAudit(
      'COMPLAINT_REJECTED',
      'COMPLAINT',
      complaint.id,
      `Denuncia rechazada por ${user.name}. Motivo: ${reason}`,
      user.id,
      user.name,
      req
    );

    res.json({ message: 'Denuncia rechazada exitosamente.', complaint });
  });

  // Request Correction
  app.post('/api/admin/complaints/:id/request-correction', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const complaint = complaints.find((c) => c.id === req.params.id);
    if (!complaint) {
      res.status(404).json({ error: 'Denuncia no encontrada.' });
      return;
    }

    const { notes } = req.body;
    complaint.status = 'DRAFT';
    complaint.correctionNotes = notes || 'Se solicita adjuntar títulos de deuda con mayor nitidez o firma autenticada.';
    complaint.updatedAt = new Date().toISOString();

    logAudit(
      'CORRECTION_REQUESTED',
      'COMPLAINT',
      complaint.id,
      `Correcciones solicitadas a denunciante por ${user.name}: ${complaint.correctionNotes}`,
      user.id,
      user.name,
      req
    );

    res.json({ message: 'Solicitud de corrección remitida al denunciante.', complaint });
  });

  // Deactivate Debtor (Dar de baja)
  app.post('/api/admin/debtors/:id/deactivate', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const debtor = debtors.find((d) => d.id === req.params.id);
    if (!debtor) {
      res.status(404).json({ error: 'Deudor no encontrado.' });
      return;
    }

    debtor.status = 'INACTIVE';
    debtor.updatedAt = new Date().toISOString();

    logAudit(
      'DEBTOR_DEACTIVATED',
      'DEBTOR',
      debtor.id,
      `Registro dado de baja de consulta pública: ${debtor.fullName} (${debtor.documentNumber}) por ${user.name}`,
      user.id,
      user.name,
      req
    );

    res.json({ message: 'Registro de deudor retirado de la consulta pública (Dado de baja).', debtor });
  });

  // Reactivate Debtor
  app.post('/api/admin/debtors/:id/reactivate', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const debtor = debtors.find((d) => d.id === req.params.id);
    if (!debtor) {
      res.status(404).json({ error: 'Deudor no encontrado.' });
      return;
    }

    debtor.status = 'PUBLISHED';
    debtor.updatedAt = new Date().toISOString();

    logAudit(
      'DEBTOR_REACTIVATED',
      'DEBTOR',
      debtor.id,
      `Registro reactivado en consulta pública: ${debtor.fullName} (${debtor.documentNumber}) por ${user.name}`,
      user.id,
      user.name,
      req
    );

    res.json({ message: 'Registro reactivado exitosamente en consulta pública.', debtor });
  });

  // Admin Dashboard Metrics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    const pendingComplaints = complaints.filter((c) => c.status === 'UNDER_REVIEW').length;
    const publishedDebtors = debtors.filter((d) => d.status === 'PUBLISHED').length;
    const rejectedComplaints = complaints.filter((c) => c.status === 'REJECTED').length;
    const totalDebtReported = debtors
      .filter((d) => d.status === 'PUBLISHED')
      .reduce((sum, d) => sum + d.totalDebt, 0);

    const publishedList = debtors.filter((d) => d.status === 'PUBLISHED');
    const averageRiskScore =
      publishedList.length > 0
        ? Math.round(publishedList.reduce((acc, d) => acc + d.riskScore, 0) / publishedList.length)
        : 0;

    const riskDistribution = {
      bajo: publishedList.filter((d) => d.riskLevel === 'BAJO').length,
      medio: publishedList.filter((d) => d.riskLevel === 'MEDIO').length,
      alto: publishedList.filter((d) => d.riskLevel === 'ALTO').length,
      critico: publishedList.filter((d) => d.riskLevel === 'CRITICO').length,
    };

    const topDebtorsRanking = [...publishedList]
      .sort((a, b) => b.riskScore - a.riskScore || b.totalDebt - a.totalDebt)
      .slice(0, 5);

    res.json({
      pendingComplaints,
      publishedDebtors,
      rejectedComplaints,
      totalDebtors: debtors.length,
      totalDebtReported,
      averageRiskScore,
      riskDistribution,
      topDebtorsRanking,
    });
  });

  // Admin Audit Logs
  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }
    res.json({ auditLogs });
  });

  // Admin Users List & Status Management
  app.get('/api/admin/users', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }
    res.json({ users });
  });

  app.patch('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const target = users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    target.isActive = !target.isActive;

    logAudit(
      'USER_STATUS_TOGGLED',
      'USER',
      target.id,
      `Estado de usuario ${target.email} cambiado a ${target.isActive ? 'ACTIVO' : 'INACTIVO'} por ${user.name}`,
      user.id,
      user.name,
      req
    );

    res.json({ user: target });
  });

  // 5. Configurable Risk Score Algorithm
  app.get('/api/config/score', (req: Request, res: Response) => {
    res.json({ config: scoreConfig });
  });

  app.post('/api/config/score', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso restringido a Administradores.' });
      return;
    }

    const { maxDebtReference, maxCreditorsReference } = req.body;
    if (typeof maxDebtReference === 'number' && maxDebtReference > 0) {
      scoreConfig.maxDebtReference = maxDebtReference;
    }
    if (typeof maxCreditorsReference === 'number' && maxCreditorsReference > 0) {
      scoreConfig.maxCreditorsReference = maxCreditorsReference;
    }

    // Recalculate scores for all debtors
    debtors.forEach((d) => {
      const { score, level } = calculateRiskScore(d.totalDebt, d.creditorCount, scoreConfig);
      d.riskScore = score;
      d.riskLevel = level;
      d.updatedAt = new Date().toISOString();
    });

    logAudit(
      'ALGORITHM_CONFIG_UPDATED',
      'CONFIG',
      'scoreConfig',
      `Parámetros actualizados: MontoRef=$${scoreConfig.maxDebtReference.toLocaleString()}, AcreedoresRef=${scoreConfig.maxCreditorsReference}. Deudores recalculados.`,
      user.id,
      user.name,
      req
    );

    res.json({
      message: 'Algoritmo recalculado exitosamente con nuevos parámetros de referencia.',
      config: scoreConfig,
    });
  });

  // Mock Upload Handler (Supports Data URI / simulated upload)
  app.post('/api/upload', (req: Request, res: Response) => {
    const { filename, dataUrl } = req.body;
    res.json({
      url: dataUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      title: filename || 'documento_adjunto.pdf',
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (Development) or STATIC SERVE (Production)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MI DEUDOR] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
