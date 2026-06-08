// ─── Supabase Database Types ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee'
export type EmploymentType = 'Salaried' | 'Hourly' | 'Subcontractor'
export type EmployeeStatus = 'Active' | 'Inactive' | 'OnLeave'
export type ProjectStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled'
export type ProjectType = 'Siding' | 'Roofing' | 'Both' | 'Other'
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
export type ContractStatus = 'Draft' | 'Signed' | 'InProgress' | 'Completed' | 'Cancelled'
export type TaskPriority = 'Haute' | 'Normal' | 'Basse'
export type TimeEntryType = 'regular' | 'overtime' | 'travel'

export interface Company {
  id: string
  name: string
  logo_url: string | null
  theme: string
  settings: CompanySettings
  created_at: string
}

export interface CompanySettings {
  currency: string
  timezone: string
  country: string
  province: string
  gst_rate?: number
  qst_rate?: number
}

export interface User {
  id: string
  company_id: string
  profile_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  biometric_enabled: boolean
  theme_preference: string
  created_at: string
}

export interface Employee {
  id: string
  user_id: string | null
  company_id: string
  full_name: string
  dob: string | null
  address: string | null
  phone: string | null
  email: string
  position: string
  hire_date: string
  hourly_rate: number
  employment_type: EmploymentType
  nas_encrypted: string | null
  deduction_federal_tax: number
  deduction_provincial_tax: number
  deduction_cpp: number
  deduction_ei: number
  benefits_health: boolean
  benefits_dental: boolean
  benefits_rrsp_percent: number
  status: EmployeeStatus
  pin_hash: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Subcontractor {
  id: string
  company_id: string
  full_name: string
  business_name: string | null
  email: string
  phone: string | null
  address: string | null
  gst_number: string | null
  wcb_number: string | null
  insurance_cert_url: string | null
  payment_terms_days: number
  rate_per_hour: number | null
  status: EmployeeStatus
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  company_name: string | null
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  company_id: string
  client_id: string
  contract_id: string | null
  name: string
  type: ProjectType
  address: string
  latitude: number | null
  longitude: number | null
  work_radius_feet: number
  start_date: string
  end_date_target: string | null
  estimated_budget: number
  spent_amount: number
  manager_id: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectTask {
  id: string
  project_id: string
  description: string
  priority: TaskPriority
  completed: boolean
  completed_at: string | null
  completed_by: string | null
  estimated_completion_date: string | null
  created_at: string
}

export interface TimeEntry {
  id: string
  employee_id: string
  project_id: string
  type: TimeEntryType
  clock_in: string
  clock_out: string | null
  gps_lat_in: number | null
  gps_lng_in: number | null
  gps_lat_out: number | null
  gps_lng_out: number | null
  total_minutes: number | null
  notes: string | null
  approved: boolean
  approved_by: string | null
  created_at: string
}

export interface Invoice {
  id: string
  company_id: string
  client_id: string
  project_id: string | null
  invoice_number: string
  status: InvoiceStatus
  subtotal: number
  gst_amount: number
  total: number
  due_date: string
  paid_at: string | null
  stripe_payment_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CatalogSiding {
  id: string
  company_id: string
  type: string
  brand: string
  model: string
  profile: string | null
  color: string | null
  supplier_cost_per_sqft: number
  client_price_per_sqft: number
  subcontractor_installation_rate_per_hour: number
  markup_percent: number
  created_at: string
  updated_at: string
}

export interface CatalogRoofing {
  id: string
  company_id: string
  type: string
  brand: string
  color: string | null
  warranty_years: number | null
  supplier_cost_per_sqft: number
  client_price_per_sqft: number
  subcontractor_installation_rate_per_hour: number
  markup_percent: number
  created_at: string
  updated_at: string
}
