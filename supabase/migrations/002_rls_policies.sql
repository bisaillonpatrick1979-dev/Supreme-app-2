-- =============================================================================
-- HailiteManager - Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_siding   ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_roofing  ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS TEXT AS $$
  SELECT company_id FROM users WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- COMPANIES POLICIES
-- =============================================================================
CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id() AND get_user_role() = 'admin');

-- =============================================================================
-- USERS POLICIES
-- =============================================================================
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (id = auth.uid()::text OR get_user_role() IN ('admin','manager'));

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (get_user_role() = 'admin');

-- =============================================================================
-- EMPLOYEES POLICIES
-- =============================================================================
CREATE POLICY "Employees can view their own record"
  ON employees FOR SELECT
  USING (
    user_id = auth.uid()::text
    OR get_user_role() IN ('admin','manager')
  );

CREATE POLICY "Admins and managers can insert employees"
  ON employees FOR INSERT
  WITH CHECK (
    get_user_role() IN ('admin','manager')
    AND company_id = get_user_company_id()
  );

CREATE POLICY "Admins and managers can update employees"
  ON employees FOR UPDATE
  USING (
    get_user_role() IN ('admin','manager')
    AND company_id = get_user_company_id()
  );

CREATE POLICY "Admins can delete employees"
  ON employees FOR DELETE
  USING (get_user_role() = 'admin' AND company_id = get_user_company_id());

-- =============================================================================
-- CLIENTS POLICIES
-- =============================================================================
CREATE POLICY "Company users can view clients"
  ON clients FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins and managers can manage clients"
  ON clients FOR ALL
  USING (
    get_user_role() IN ('admin','manager')
    AND company_id = get_user_company_id()
  );

-- =============================================================================
-- PROJECTS POLICIES
-- =============================================================================
CREATE POLICY "Company users can view projects"
  ON projects FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins and managers can manage projects"
  ON projects FOR ALL
  USING (
    get_user_role() IN ('admin','manager')
    AND company_id = get_user_company_id()
  );

-- =============================================================================
-- PROJECT TASKS POLICIES
-- =============================================================================
CREATE POLICY "Company users can view tasks"
  ON project_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Admins and managers can manage tasks"
  ON project_tasks FOR ALL
  USING (
    get_user_role() IN ('admin','manager')
    AND project_id IN (
      SELECT id FROM projects WHERE company_id = get_user_company_id()
    )
  );

-- =============================================================================
-- TIME ENTRIES POLICIES
-- =============================================================================
CREATE POLICY "Employees can view their own time entries"
  ON time_entries FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()::text)
    OR get_user_role() IN ('admin','manager')
  );

CREATE POLICY "Admins and managers can approve time entries"
  ON time_entries FOR UPDATE
  USING (get_user_role() IN ('admin','manager'));

-- =============================================================================
-- INVOICES POLICIES
-- =============================================================================
CREATE POLICY "Company users can view invoices"
  ON invoices FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (get_user_role() = 'admin' AND company_id = get_user_company_id());

-- =============================================================================
-- CATALOG POLICIES (read: all company users; write: admin only)
-- =============================================================================
CREATE POLICY "Company users can view siding catalog"
  ON catalog_siding FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage siding catalog"
  ON catalog_siding FOR ALL
  USING (get_user_role() = 'admin' AND company_id = get_user_company_id());

CREATE POLICY "Company users can view roofing catalog"
  ON catalog_roofing FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage roofing catalog"
  ON catalog_roofing FOR ALL
  USING (get_user_role() = 'admin' AND company_id = get_user_company_id());

-- =============================================================================
-- PAYROLL POLICIES
-- =============================================================================
CREATE POLICY "Admins can manage payroll runs"
  ON payroll_runs FOR ALL
  USING (get_user_role() = 'admin' AND company_id = get_user_company_id());

CREATE POLICY "Employees can view their payroll records"
  ON payroll_records FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()::text)
    OR get_user_role() IN ('admin','manager')
  );

CREATE POLICY "Admins can manage payroll records"
  ON payroll_records FOR ALL
  USING (get_user_role() = 'admin');
