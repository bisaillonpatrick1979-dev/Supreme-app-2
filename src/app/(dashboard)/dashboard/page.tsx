import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Parallel data fetch
  const [
    { count: projectCount },
    { count: employeeCount },
    { count: clientCount },
    { data: recentProjects },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'Cancelled'),
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('id, name, status, type, start_date').neq('status', 'Cancelled').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Projets actifs',   value: projectCount ?? 0,  href: '/dashboard/projects',  color: 'text-blue-400' },
    { label: 'Employés actifs',  value: employeeCount ?? 0, href: '/dashboard/employees', color: 'text-green-400' },
    { label: 'Clients',          value: clientCount ?? 0,   href: '/dashboard/clients',   color: 'text-purple-400' },
  ]

  const statusColor: Record<string, string> = {
    Active: 'bg-green-500/20 text-green-400',
    Draft: 'bg-gray-500/20 text-gray-400',
    Completed: 'bg-blue-500/20 text-blue-400',
    Cancelled: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Link key={s.href} href={s.href} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold">Projets récents</h2>
          <Link href="/dashboard/projects" className="text-sm text-blue-400 hover:text-blue-300">
            Voir tout →
          </Link>
        </div>
        <ul className="divide-y divide-gray-800">
          {(recentProjects ?? []).length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500 text-sm">Aucun projet</li>
          )}
          {(recentProjects ?? []).map(p => (
            <li key={p.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{p.name}</p>
                <p className="text-sm text-gray-500">{p.type} · {p.start_date}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[p.status] ?? 'bg-gray-800 text-gray-400'}`}>
                {p.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nouveau projet',  href: '/dashboard/projects?new=1' },
          { label: 'Nouveau client',  href: '/dashboard/clients?new=1' },
          { label: 'Ajouter employé', href: '/dashboard/employees?new=1' },
          { label: 'Nouvelle facture',href: '/dashboard/invoices?new=1' },
        ].map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="text-center px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
