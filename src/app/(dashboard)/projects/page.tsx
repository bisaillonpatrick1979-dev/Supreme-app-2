import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusColor: Record<string, string> = {
  Active:    'bg-green-500/20 text-green-400 border-green-700/30',
  Draft:     'bg-gray-500/20 text-gray-400 border-gray-700/30',
  Completed: 'bg-blue-500/20 text-blue-400 border-blue-700/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-700/30',
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, name, type, status, address, start_date, end_date_target,
      estimated_budget, spent_amount,
      clients(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projets</h1>
        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
        >
          + Nouveau projet
        </Link>
      </div>

      <div className="grid gap-4">
        {(!projects || projects.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Aucun projet</p>
            <p className="text-sm mt-1">Créez votre premier projet pour commencer.</p>
          </div>
        )}
        {(projects ?? []).map(p => {
          const budget = p.estimated_budget ?? 0
          const spent = p.spent_amount ?? 0
          const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
          // @ts-expect-error supabase join type
          const clientName = p.clients?.name ?? '—'

          return (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-white">{p.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{clientName} · {p.address}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.start_date}{p.end_date_target ? ` → ${p.end_date_target}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-semibold">{budget.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                  <p className="text-xs text-gray-500">{pct}% dépensé</p>
                </div>
              </div>
              {budget > 0 && (
                <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
