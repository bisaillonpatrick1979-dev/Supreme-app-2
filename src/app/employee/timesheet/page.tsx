'use client'

import { useState, useEffect } from 'react'
import { getEmployeeSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

interface TimeEntry {
  id: string
  clock_in: string
  clock_out: string | null
  total_minutes: number | null
  type: string
  approved: boolean
  projects: { name: string }[] | { name: string } | null
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export default function TimesheetPage() {
  const supabase = createClient()
  const session = getEmployeeSession()

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    supabase
      .from('time_entries')
      .select('id, clock_in, clock_out, total_minutes, type, approved, projects(name)')
      .eq('employee_id', session.employeeId)
      .order('clock_in', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data as unknown as TimeEntry[]) ?? [])
        setLoading(false)
      })
  }, [session, supabase])

  const totalMinutes = entries
    .filter(e => e.clock_out)
    .reduce((acc, e) => acc + (e.total_minutes ?? 0), 0)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mes heures</h1>
        <p className="text-sm text-gray-400">
          Total : <span className="text-white font-semibold">{formatDuration(totalMinutes)}</span>
        </p>
      </div>

      {loading && <p className="text-center text-gray-500 py-8">Chargement...</p>}

      <div className="space-y-2">
        {!loading && entries.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune entrée de temps</p>
        )}
        {entries.map(entry => {
          const proj = entry.projects
          const projectName = (Array.isArray(proj) ? proj[0]?.name : (proj as { name: string } | null)?.name) ?? '—'
          const clockIn = new Date(entry.clock_in)
          const clockOut = entry.clock_out ? new Date(entry.clock_out) : null

          return (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white text-sm">{projectName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {clockIn.toLocaleDateString('fr-CA')} · {clockIn.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    {clockOut ? ` → ${clockOut.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}` : ' → en cours'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-semibold text-sm">{formatDuration(entry.total_minutes)}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    {entry.approved
                      ? <span className="text-xs text-green-400">✓ Approuvé</span>
                      : <span className="text-xs text-gray-500">En attente</span>
                    }
                    {!entry.clock_out && (
                      <span className="text-xs text-amber-400 font-medium">EN COURS</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
