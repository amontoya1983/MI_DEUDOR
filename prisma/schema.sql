-- ==========================================================
-- MI DEUDOR - Database Schema Script (PostgreSQL Compatible)
-- Tables: roles, users, debtors, creditors, debts, complaints, documents, audit_logs
-- ==========================================================

-- 1. Create Enums / Domains
CREATE TYPE role_type AS ENUM ('ADMIN', 'REPORTER', 'VIEWER');
CREATE TYPE complaint_status AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE debtor_status AS ENUM ('PUBLISHED', 'INACTIVE', 'SUSPENDED');
CREATE TYPE debt_status AS ENUM ('PENDING', 'PAID', 'DISPUTED');
CREATE TYPE risk_classification AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- 2. Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name role_type UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    document_number VARCHAR(50) UNIQUE,
    phone VARCHAR(50),
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: debtors
CREATE TABLE IF NOT EXISTS debtors (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(50) UNIQUE NOT NULL,
    photo_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    observations TEXT,
    total_debt NUMERIC(14, 2) DEFAULT 0.00,
    creditor_count INT DEFAULT 0,
    risk_score INT DEFAULT 1 CHECK (risk_score >= 1 AND risk_score <= 100),
    risk_level risk_classification DEFAULT 'BAJO',
    status debtor_status DEFAULT 'INACTIVE',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: creditors
CREATE TABLE IF NOT EXISTS creditors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document_number VARCHAR(50) UNIQUE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: complaints
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    debtor_id VARCHAR(36) REFERENCES debtors(id) ON DELETE SET NULL,
    debtor_name_snapshot VARCHAR(255) NOT NULL,
    debtor_doc_snapshot VARCHAR(50) NOT NULL,
    debtor_city_snapshot VARCHAR(100) NOT NULL,
    debtor_phone_snapshot VARCHAR(50),
    debtor_email_snapshot VARCHAR(255),
    status complaint_status DEFAULT 'UNDER_REVIEW',
    admin_notes TEXT,
    rejection_reason TEXT,
    correction_notes TEXT,
    terms_accepted BOOLEAN DEFAULT TRUE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: debts
CREATE TABLE IF NOT EXISTS debts (
    id VARCHAR(36) PRIMARY KEY,
    debtor_id VARCHAR(36) NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
    creditor_id VARCHAR(36) NOT NULL REFERENCES creditors(id) ON DELETE RESTRICT,
    complaint_id VARCHAR(36) REFERENCES complaints(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'COP',
    due_date DATE NOT NULL,
    description TEXT NOT NULL,
    status debt_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: documents
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id VARCHAR(36) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    debt_id VARCHAR(36) REFERENCES debts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    debtor_id VARCHAR(36) REFERENCES debtors(id) ON DELETE SET NULL,
    complaint_id VARCHAR(36) REFERENCES complaints(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX idx_debtors_doc ON debtors(document_number);
CREATE INDEX idx_debtors_city ON debtors(city);
CREATE INDEX idx_debtors_score ON debtors(risk_score);
CREATE INDEX idx_debtors_status ON debtors(status);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_reporter ON complaints(reporter_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- Initial seed data for essential roles
INSERT INTO roles (id, name, description) VALUES
('role-admin-01', 'ADMIN', 'Administrador de plataforma con facultades de aprobación, rechazo y auditoría'),
('role-reporter-02', 'REPORTER', 'Denunciante habilitado para reportar deudores y subir evidencias'),
('role-viewer-03', 'VIEWER', 'Visitante público con acceso a consulta y perfiles')
ON CONFLICT (id) DO NOTHING;
