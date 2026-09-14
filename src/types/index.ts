export type RoleType = 'ADMIN' | 'REPORTER' | 'VIEWER';

export type ComplaintStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type DebtorStatus = 'PUBLISHED' | 'INACTIVE' | 'SUSPENDED';

export type DebtStatus = 'PENDING' | 'PAID' | 'DISPUTED';

export type RiskClassification = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  phone?: string;
  documentNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface DebtObligation {
  id: string;
  debtorId: string;
  creditorName: string;
  creditorDocument?: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  status: DebtStatus;
  documents: DocumentItem[];
}

export interface Debtor {
  id: string;
  fullName: string;
  documentNumber: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  observations?: string;
  totalDebt: number;
  creditorCount: number;
  riskScore: number; // 1 to 100
  riskLevel: RiskClassification;
  status: DebtorStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  debts: DebtObligation[];
}

export interface ComplaintDebtInput {
  creditorName: string;
  creditorDocument?: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  documentTitle?: string;
  documentUrl?: string;
  documentFileType?: string;
  documentFileSize?: number;
}

export interface Complaint {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  debtorId?: string;
  debtorData: {
    fullName: string;
    documentNumber: string;
    photoUrl?: string;
    phone?: string;
    email?: string;
    address?: string;
    city: string;
    observations?: string;
  };
  debts: ComplaintDebtInput[];
  status: ComplaintStatus;
  adminNotes?: string;
  rejectionReason?: string;
  correctionNotes?: string;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ScoreConfig {
  maxDebtReference: number;       // default 50,000,000 COP / reference unit
  maxCreditorsReference: number;  // default 10 creditors
}

export interface DashboardMetrics {
  pendingComplaints: number;
  publishedDebtors: number;
  rejectedComplaints: number;
  totalDebtors: number;
  totalDebtReported: number;
  averageRiskScore: number;
  riskDistribution: {
    bajo: number;
    medio: number;
    alto: number;
    critico: number;
  };
  topDebtorsRanking: Debtor[];
}
