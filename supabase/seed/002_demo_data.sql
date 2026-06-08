-- =============================================================================
-- HailiteManager - Seed Data: Demo Employees, Clients, Catalog & Project
-- Run AFTER 001_company_and_admin.sql
-- =============================================================================

-- =============================================================================
-- DEMO EMPLOYEES (PINs: stored as bcrypt hashes — set via admin UI)
-- =============================================================================
INSERT INTO employees (
  id, company_id, full_name, dob, address, phone, email,
  position, hire_date, hourly_rate, employment_type,
  deduction_federal_tax, deduction_provincial_tax, deduction_cpp, deduction_ei,
  benefits_health, benefits_dental, benefits_rrsp_percent, status,
  created_at, updated_at
)
VALUES
  (
    'emp-jean-001', 'company-hailite-001', 'Jean Dupont',
    '1985-03-15', '123 Rue Principal, Edmonton, AB T5J 2R7', '780-555-1234', 'jean@hailite.com',
    'Roofer', '2020-05-01', 28.50, 'Salaried',
    0.15, 0.08, 0.0595, 0.0166,
    TRUE, TRUE, 0.03, 'Active',
    NOW(), NOW()
  ),
  (
    'emp-marco-001', 'company-hailite-001', 'Marco Rossi',
    '1990-07-22', '456 Elm St, Edmonton, AB T5K 1R8', '780-555-5678', 'marco@hailite.com',
    'Siding Specialist', '2021-03-15', 32.00, 'Salaried',
    0.15, 0.08, 0.0595, 0.0166,
    TRUE, TRUE, 0.03, 'Active',
    NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEMO CLIENTS
-- =============================================================================
INSERT INTO clients (id, company_id, name, email, phone, address, company_name, total_spent, created_at, updated_at)
VALUES
  ('client-abc-001', 'company-hailite-001', 'John Smith',    'john@abc.com',   '780-555-0001', '100 Main St, Edmonton, AB',   'ABC Corp', 0, NOW(), NOW()),
  ('client-xyz-001', 'company-hailite-001', 'Sarah Johnson', 'sarah@xyz.com',  '780-555-0002', '200 Oak Ave, Edmonton, AB',   'XYZ Inc',  0, NOW(), NOW()),
  ('client-def-001', 'company-hailite-001', 'Mike Brown',    'mike@def.com',   '780-555-0003', '300 Maple Dr, Edmonton, AB',  'DEF Ltd',  0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEMO CATALOG - SIDING
-- =============================================================================
INSERT INTO catalog_siding (
  id, company_id, type, brand, model, profile, color,
  supplier_cost_per_sqft, client_price_per_sqft, subcontractor_installation_rate_per_hour,
  markup_percent, created_at, updated_at
)
VALUES
  ('cat-siding-001', 'company-hailite-001', 'Vinyl',         'GAF',            'WaterGuard Plus',  'Dutch Lap',   'Sandstone',    0.85, 1.50, 45.00, 76.47,  NOW(), NOW()),
  ('cat-siding-002', 'company-hailite-001', 'Vinyl',         'CertainTeed',    'Monogram',         'Shiplap',     'Arctic White', 0.90, 1.60, 45.00, 77.78,  NOW(), NOW()),
  ('cat-siding-003', 'company-hailite-001', 'Fiber Cement',  'James Hardie',   'HardiePanel',      'Traditional', 'Cream',        2.00, 4.00, 55.00, 100.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEMO CATALOG - ROOFING
-- =============================================================================
INSERT INTO catalog_roofing (
  id, company_id, type, brand, color, warranty_years,
  supplier_cost_per_sqft, client_price_per_sqft, subcontractor_installation_rate_per_hour,
  markup_percent, created_at, updated_at
)
VALUES
  ('cat-roof-001', 'company-hailite-001', 'Asphalt Shingles', 'GAF',     'Charcoal Black',        30, 1.20, 2.50, 50.00, 108.33, NOW(), NOW()),
  ('cat-roof-002', 'company-hailite-001', 'Metal Roofing',    'Vicwest', 'Standing Seam - Steel', 50, 4.50, 8.00, 60.00,  77.78, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEMO PROJECT
-- =============================================================================
INSERT INTO projects (
  id, company_id, client_id, name, type, address,
  latitude, longitude, work_radius_feet,
  start_date, end_date_target, estimated_budget, spent_amount,
  manager_id, status, created_at, updated_at
)
VALUES (
  'proj-demo-001', 'company-hailite-001', 'client-abc-001',
  'ABC Corp - Siding Renovation', 'Siding',
  '100 Main St, Edmonton, AB T5J 2R7',
  53.5461, -113.4938, 200,
  CURRENT_DATE, CURRENT_DATE + INTERVAL '16 days',
  8500.00, 0,
  'emp-jean-001', 'Active',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Demo project tasks
INSERT INTO project_tasks (id, project_id, description, priority, completed, estimated_completion_date, created_at)
VALUES
  ('task-001', 'proj-demo-001', 'Inspection & Measurement',   'Haute',  FALSE, CURRENT_DATE,            NOW()),
  ('task-002', 'proj-demo-001', 'Site Preparation',           'Haute',  FALSE, CURRENT_DATE + 1,        NOW()),
  ('task-003', 'proj-demo-001', 'Installation (Part 1)',       'Normal', FALSE, CURRENT_DATE + 2,        NOW()),
  ('task-004', 'proj-demo-001', 'Installation (Part 2)',       'Normal', FALSE, CURRENT_DATE + 3,        NOW()),
  ('task-005', 'proj-demo-001', 'Final Inspection',            'Normal', FALSE, CURRENT_DATE + 4,        NOW()),
  ('task-006', 'proj-demo-001', 'Client Sign-off',             'Haute',  FALSE, CURRENT_DATE + 5,        NOW())
ON CONFLICT (id) DO NOTHING;

-- Assign employees to demo project
INSERT INTO project_employees (project_id, employee_id)
VALUES
  ('proj-demo-001', 'emp-jean-001'),
  ('proj-demo-001', 'emp-marco-001')
ON CONFLICT DO NOTHING;
