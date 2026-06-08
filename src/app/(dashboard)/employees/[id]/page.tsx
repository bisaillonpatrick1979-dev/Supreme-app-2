import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SetPinForm } from './SetPinForm'

export const dynamic = 'force-dynamic'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: emp } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!emp) notFound()

  const { data: recentEntries } = await supabase
    .from('time_entries')
    .select('id, clock_in, clock_out, total_minutes, approved, projects(name)')
    .eq('employee_id', id)
    .order('clock_in', { ascending: false })
    .limit(10)

  const totalHours = (recentEntries ?? [])
    .filter(e => e.clock_out)
    .reduce((acc, e) => acc + (e.total_minutes ?? 0), 0) / 60

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <div>
        <Link href="/dashboard/employees" className="text-sm text-gray-500 hover:text-gray-300">
          ← Employés
        </Link>
        <h1 className="text-2xl font-bold mt-1">{emp.full_name}</h1>
        <p className="text-gray-400">{emp.position} · {emp.employment_type}</p>
      </div>

      {/* Profile */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 col-span-2">
          <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Informations</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Email',       value: emp.email },
              { label: 'Téléphone',   value: emp.phone ?? '—' },
              { label: 'Embauche',    value: emp.hire_date },
              { label: 'Taux horaire',value: `${Number(emp.hourly_rate).toFixed(2)} $/h` },
              { label: 'Statut',      value: emp.status },
              { label: 'Adresse',     value: emp.address ?? '—' },
            ].map(row => (
              <div key={row.label}>
                <dt className="text-gray-500 text-xs">{row.label}</dt>
                <dd className="text-white mt-0.5">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* PIN management */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">PIN d&apos;accès employé</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${emp.pin_hash ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {emp.pin_hash ? 'Configuré' : 'Non configuré'}
          </span>
        </div>
        <p className="text-sm text-gray-400">
          Le PIN permet à l&apos;employé de se connecter au portail employé sans mot de passe.
          4 à 6 chiffres. Stocké chiffré (bcrypt).
        </p>
        <SetPinForm employeeId={id} hasPin={!!emp.pin_hash} />
      </div>

      {/* Deductions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Déductions</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Impôt fédéral', value: `${(Number(emp.deduction_federal_tax) * 100).toFixed(1)}%` },
            { label: 'Impôt prov.',   value: `${(Number(emp.deduction_provincial_tax) * 100).toFixed(1)}%` },
            { label: 'RPC/CPP',       value: `${(Number(emp.deduction_cpp) * 100).toFixed(2)}%` },
            { label: 'AE/EI',         value: `${(Number(emp.deduction_ei) * 100).toFixed(2)}%` },
            { label: 'REER %',        value: `${(Number(emp.benefits_rrsp_percent) * 100).toFixed(1)}%` },
            { label: 'Santé',         value: emp.benefits_health ? 'Oui' : 'Non' },
          ].map(row => (
            <div key={row.label}>
              <dt className="text-gray-500 text-xs">{row.label}</dt>
              <dd className="text-white mt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Recent time entries */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold">Heures récentes</h2>
          <span className="text-sm text-gray-400">{totalHours.toFixed(1)}h total</span>
        </div>
        <ul className="divide-y divide-gray-800">
          {(!recentEntries || recentEntries.length === 0) && (
            <li className="px-6 py-6 text-center text-gray-500 text-sm">Aucune entrée</li>
          )}
          {(recentEntries ?? []).map(entry => {
            // @ts-expect-error supabase join
            const projectName = entry.projects?.name ?? '—'
            const clockIn = new Date(entry.clock_in)
            const mins = entry.total_minutes
            const duration = mins ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2,'0')}m` : '—'
            return (
              <li key={entry.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-white">{projectName}</p>
                  <p className="text-gray-500 text-xs">{clockIn.toLocaleDateString('fr-CA')}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{duration}</p>
                  <p className={`text-xs ${entry.approved ? 'text-green-400' : 'text-gray-500'}`}>
                    {entry.approved ? '✓ Approuvé' : 'En attente'}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
