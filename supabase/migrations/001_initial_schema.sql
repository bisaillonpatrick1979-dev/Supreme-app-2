-- =============================================================================
-- HailiteManager - Initial Database Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- COMPANIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name          TEXT NOT NULL,
  logo_url      TEXT,
  theme         TEXT NOT NULL DEFAULT 'cosmic-space',
  settings      JSONB NOT NULL DEFAULT '{"currency":"CAD","timezone":"America/Edmonton","country":"CA","province":"AB","gst_rate":0.05}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USERS (Admin / Managers - linked to Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,  -- matches auth.users.id (UUID)
  company_id        TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  profile_name      TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  avatar_url        TEXT,
  role              TEXT NOT NULL CHECK (role IN ('admin','manager','employee')) DEFAULT 'employee',
  biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  theme_preference  TEXT NOT NULL DEFAULT 'cosmic-space',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- EMPLOYEES (Field workers - PIN auth, not necessarily Supabase Auth users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id                              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id                         TEXT REFERENCES users(id) ON DELETE SET NULL,
  company_id                      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name                       TEXT NOT NULL,
  dob                             DATE,
  address                         TEXT,
  phone                           TEXT,
  email                           TEXT NOT NULL,
  position                        TEXT NOT NULL,
  hire_date                       DATE NOT NULL,
  hourly_rate                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  employment_type                 TEXT NOT NULL CHECK (employment_type IN ('Salaried','Hourly','Subcontractor')) DEFAULT 'Hourly',
  nas_encrypted                   TEXT,           -- AES-256 encrypted NAS
  deduction_federal_tax           NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  deduction_provincial_tax        NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  deduction_cpp                   NUMERIC(5,4) NOT NULL DEFAULT 0.0595,
  deduction_ei                    NUMERIC(5,4) NOT NULL DEFAULT 0.0166,
  benefits_health                 BOOLEAN NOT NULL DEFAULT FALSE,
  benefits_dental                 BOOLEAN NOT NULL DEFAULT FALSE,
  benefits_rrsp_percent           NUMERIC(5,4) NOT NULL DEFAULT 0,
  status                          TEXT NOT NULL CHECK (status IN ('Active','Inactive','OnLeave')) DEFAULT 'Active',
  pin_hash                        TEXT,           -- bcrypt hash of 4-6 digit PIN
  avatar_url                      TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SUBCONTRACTORS
-- =============================================================================
CREATE TABLE IF NOT EXISTS subcontractors (
  id                    TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id            TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  business_name         TEXT,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  address               TEXT,
  gst_number            TEXT,
  wcb_number            TEXT,
  insurance_cert_url    TEXT,
  payment_terms_days    INTEGER NOT NULL DEFAULT 30,
  rate_per_hour         NUMERIC(10,2),
  status                TEXT NOT NULL CHECK (status IN ('Active','Inactive','OnLeave')) DEFAULT 'Active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CLIENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id    TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  company_name  TEXT,
  total_spent   NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CATALOG - SIDING
-- =============================================================================
CREATE TABLE IF NOT EXISTS catalog_siding (
  id                                      TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id                              TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                                    TEXT NOT NULL,
  brand                                   TEXT NOT NULL,
  model                                   TEXT NOT NULL,
  profile                                 TEXT,
  color                                   TEXT,
  supplier_cost_per_sqft                  NUMERIC(10,4) NOT NULL,
  client_price_per_sqft                   NUMERIC(10,4) NOT NULL,
  subcontractor_installation_rate_per_hour NUMERIC(10,2) NOT NULL,
  markup_percent                          NUMERIC(6,2) NOT NULL,
  created_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CATALOG - ROOFING
-- =============================================================================
CREATE TABLE IF NOT EXISTS catalog_roofing (
  id                                      TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id                              TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                                    TEXT NOT NULL,
  brand                                   TEXT NOT NULL,
  color                                   TEXT,
  warranty_years                          INTEGER,
  supplier_cost_per_sqft                  NUMERIC(10,4) NOT NULL,
  client_price_per_sqft                   NUMERIC(10,4) NOT NULL,
  subcontractor_installation_rate_per_hour NUMERIC(10,2) NOT NULL,
  markup_percent                          NUMERIC(6,2) NOT NULL,
  created_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CONTRACTS / DEVIS
-- =============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id    TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id     TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  contract_number TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('Draft','Signed','InProgress','Completed','Cancelled')) DEFAULT 'Draft',
  type          TEXT NOT NULL CHECK (type IN ('Siding','Roofing','Both','Other')),
  scope         JSONB NOT NULL DEFAULT '[]',   -- array of line items
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  deposit_paid  NUMERIC(12,2) NOT NULL DEFAULT 0,
  signed_at     TIMESTAMPTZ,
  signed_by     TEXT,
  pdf_url       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PROJECTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id                  TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id          TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  contract_id         TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('Siding','Roofing','Both','Other')),
  address             TEXT NOT NULL,
  latitude            NUMERIC(10,7),
  longitude           NUMERIC(10,7),
  work_radius_feet    INTEGER NOT NULL DEFAULT 200,
  start_date          DATE NOT NULL,
  end_date_target     DATE,
  estimated_budget    NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  manager_id          TEXT REFERENCES employees(id) ON DELETE SET NULL,
  status              TEXT NOT NULL CHECK (status IN ('Draft','Active','Completed','Cancelled')) DEFAULT 'Draft',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PROJECT TASKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id                          TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  project_id                  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description                 TEXT NOT NULL,
  priority                    TEXT NOT NULL CHECK (priority IN ('Haute','Normal','Basse')) DEFAULT 'Normal',
  completed                   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at                TIMESTAMPTZ,
  completed_by                TEXT REFERENCES employees(id) ON DELETE SET NULL,
  estimated_completion_date   DATE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PROJECT EMPLOYEES (M:N)
-- =============================================================================
CREATE TABLE IF NOT EXISTS project_employees (
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id   TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, employee_id)
);

-- =============================================================================
-- TIME ENTRIES (Punch In/Out with GPS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  employee_id   TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id    TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('regular','overtime','travel')) DEFAULT 'regular',
  clock_in      TIMESTAMPTZ NOT NULL,
  clock_out     TIMESTAMPTZ,
  gps_lat_in    NUMERIC(10,7),
  gps_lng_in    NUMERIC(10,7),
  gps_lat_out   NUMERIC(10,7),
  gps_lng_out   NUMERIC(10,7),
  total_minutes INTEGER,    -- computed on clock_out
  notes         TEXT,
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INVOICES
-- =============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id                    TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id            TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id             TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id            TEXT REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number        TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('Draft','Sent','Paid','Overdue','Cancelled')) DEFAULT 'Draft',
  line_items            JSONB NOT NULL DEFAULT '[]',
  subtotal              NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                 NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date              DATE NOT NULL,
  paid_at               TIMESTAMPTZ,
  stripe_payment_link   TEXT,
  stripe_payment_intent TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PAYROLL RUNS
-- =============================================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id                TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  company_id        TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  processed_at      TIMESTAMPTZ,
  processed_by      TEXT REFERENCES users(id) ON DELETE SET NULL,
  total_gross       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_net         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions  NUMERIC(12,2) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL CHECK (status IN ('Draft','Processed','Paid')) DEFAULT 'Draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PAYROLL RECORDS (per employee per run)
-- =============================================================================
CREATE TABLE IF NOT EXISTS payroll_records (
  id                TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  payroll_run_id    TEXT NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id       TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  hours_regular     NUMERIC(8,2) NOT NULL DEFAULT 0,
  hours_overtime    NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate       NUMERIC(10,2) NOT NULL,
  gross_pay         NUMERIC(12,2) NOT NULL,
  deduction_federal NUMERIC(12,2) NOT NULL DEFAULT 0,
  deduction_prov    NUMERIC(12,2) NOT NULL DEFAULT 0,
  deduction_cpp     NUMERIC(12,2) NOT NULL DEFAULT 0,
  deduction_ei      NUMERIC(12,2) NOT NULL DEFAULT 0,
  deduction_rrsp    NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay           NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_employees_company     ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_status      ON employees(status);
CREATE INDEX IF NOT EXISTS idx_clients_company       ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company      ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_client       ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status       ON projects(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project  ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_invoices_company      ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client       ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status       ON invoices(status);
