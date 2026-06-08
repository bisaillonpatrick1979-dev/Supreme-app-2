import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const priorityColor: Record<string, string> = {
  Haute:  'bg-red-500/20 text-red-400',
  Normal: 'bg-blue-500/20 text-blue-400',
  Basse:  'bg-gray-500/20 text-gray-400',
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      clients(name, email, phone),
      project_tasks(id, description, priority, completed, completed_at, estimated_completion_date)
    `)
    .eq('id', id)
    .single()

  if (!project) notFound()

  const client = project.clients as { name: string; email: string | null; phone: string | null } | null
  const tasks = (project.project_tasks ?? []) as { id: string; description: string; priority: string; completed: boolean; estimated_completion_date: string | null }[]

  const completedCount = tasks.filter(t => t.completed).length
  const budget = Number(project.estimated_budget)
  const spent = Number(project.spent_amount)
  const budgetPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/projects" className="text-sm text-gray-500 hover:text-gray-300">
            ← Projets
          </Link>
          <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
          <p className="text-gray-400 mt-0.5">{project.address}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${
          project.status === 'Active' ? 'bg-green-500/20 text-green-400' :
          project.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {project.status}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Budget</h3>
          <p className="text-2xl font-bold text-white">
            {budget.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
          </p>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {spent.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })} dépensé ({budgetPct}%)
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Client</h3>
          <p className="text-lg font-semibold text-white">{client?.name ?? '—'}</p>
          <p className="text-sm text-gray-400">{client?.email ?? ''}</p>
          <p className="text-sm text-gray-400">{client?.phone ?? ''}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 grid grid-cols-3 gap-4 text-sm">
        {[
          { label: 'Type',     value: project.type },
          { label: 'Début',    value: project.start_date },
          { label: 'Fin cible',value: project.end_date_target ?? '—' },
        ].map(row => (
          <div key={row.label}>
            <p className="text-gray-500 text-xs uppercase tracking-wider">{row.label}</p>
            <p className="text-white mt-1">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold">Tâches ({completedCount}/{tasks.length})</h2>
          <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}%` : '0%' }}
            />
          </div>
        </div>
        <ul className="divide-y divide-gray-800">
          {tasks.length === 0 && (
            <li className="px-6 py-6 text-center text-gray-500 text-sm">Aucune tâche</li>
          )}
          {tasks.map(task => (
            <li key={task.id} className="px-6 py-4 flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                task.completed ? 'bg-green-600 border-green-600' : 'border-gray-600'
              }`}>
                {task.completed && <span className="text-xs text-white">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {task.description}
                </p>
                {task.estimated_completion_date && (
                  <p className="text-xs text-gray-500 mt-0.5">Prévu le {task.estimated_completion_date}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}>
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
