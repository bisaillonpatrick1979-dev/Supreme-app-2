import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusBadge: Record<string, string> = {
  Active:   'bg-green-500/20 text-green-400',
  Inactive: 'bg-gray-500/20 text-gray-400',
  OnLeave:  'bg-amber-500/20 text-amber-400',
}

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, position, email, phone, hourly_rate, employment_type, status, hire_date, pin_hash')
    .order('full_name')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employés</h1>
        <Link
          href="/dashboard/employees/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
        >
          + Ajouter employé
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Nom</th>
              <th className="text-left px-6 py-3">Poste</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-right px-6 py-3">Taux / h</th>
              <th className="text-center px-6 py-3">PIN</th>
              <th className="text-center px-6 py-3">Statut</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(!employees || employees.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Aucun employé — ajoutez votre équipe
                </td>
              </tr>
            )}
            {(employees ?? []).map(emp => (
              <tr key={emp.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{emp.full_name}</p>
                  <p className="text-gray-500 text-xs">{emp.email}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">{emp.position}</td>
                <td className="px-6 py-4 text-gray-400">{emp.employment_type}</td>
                <td className="px-6 py-4 text-right text-gray-300">
                  {Number(emp.hourly_rate).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                </td>
                <td className="px-6 py-4 text-center">
                  {emp.pin_hash
                    ? <span className="text-green-400 text-xs font-medium">✓ Configuré</span>
                    : <span className="text-amber-400 text-xs">Non configuré</span>
                  }
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[emp.status]}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/dashboard/employees/${emp.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Éditer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
