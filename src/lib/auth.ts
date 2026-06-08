import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ─── Admin / Email Auth ───────────────────────────────────────────────────────

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  const { data: userRecord } = await supabase
    .from('users')
    .select('id, role, profile_name, company_id')
    .eq('email', email)
    .single()

  return { session: data.session, user: data.user, userRecord }
}

export async function signOutAdmin() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ─── Employee PIN Auth ────────────────────────────────────────────────────────

export async function authenticateEmployeeWithPIN(
  employeeId: string,
  pin: string
): Promise<{ success: boolean; employee: EmployeeSession }> {
  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, full_name, position, avatar_url, pin_hash, status')
    .eq('id', employeeId)
    .single()

  if (error || !employee) throw new Error('Employé introuvable')
  if (employee.status !== 'Active') throw new Error('Compte employé inactif')
  if (!employee.pin_hash) throw new Error('PIN non configuré')

  const valid = await bcrypt.compare(pin, employee.pin_hash)
  if (!valid) throw new Error('PIN invalide')

  const session: EmployeeSession = {
    employeeId: employee.id,
    name: employee.full_name,
    position: employee.position,
    avatar: employee.avatar_url,
    token: crypto.randomUUID(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('employee_session', JSON.stringify(session))
  }

  return { success: true, employee: session }
}

export function getEmployeeSession(): EmployeeSession | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem('employee_session')
  if (!raw) return null

  try {
    const session: EmployeeSession = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('employee_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearEmployeeSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('employee_session')
  }
}

// ─── PIN Utilities ────────────────────────────────────────────────────────────

export async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12)
}

export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeSession {
  employeeId: string
  name: string
  position: string
  avatar: string | null
  token: string
  expiresAt: number
}
