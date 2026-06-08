'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEmployeeSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

interface Project {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  work_radius_feet: number
}

interface ActiveEntry {
  id: string
  project_id: string
  clock_in: string
}

function distanceFeet(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 20902231 // Earth radius in feet
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export default function EmployeeDashboardPage() {
  const supabase = createClient()
  const session = getEmployeeSession()

  const [projects, setProjects] = useState<Project[]>([])
  const [activeEntry, setActiveEntry] = useState<ActiveEntry | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [gps, setGps] = useState<GeolocationCoordinates | null>(null)
  const [gpsError, setGpsError] = useState('')
  const [elapsed, setElapsed] = useState('')

  // Load projects and active punch
  const loadData = useCallback(async () => {
    if (!session) return

    const { data: projectEmployees } = await supabase
      .from('project_employees')
      .select('project_id')
      .eq('employee_id', session.employeeId)

    if (projectEmployees && projectEmployees.length > 0) {
      const ids = projectEmployees.map(pe => pe.project_id)
      const { data: proj } = await supabase
        .from('projects')
        .select('id, name, address, latitude, longitude, work_radius_feet')
        .in('id', ids)
        .eq('status', 'Active')
      setProjects(proj ?? [])
    }

    const { data: entry } = await supabase
      .from('time_entries')
      .select('id, project_id, clock_in')
      .eq('employee_id', session.employeeId)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1)
      .maybeSingle()

    setActiveEntry(entry ?? null)
    if (entry) setSelectedProject(entry.project_id)
  }, [session, supabase])

  useEffect(() => { loadData() }, [loadData])

  // Elapsed timer
  useEffect(() => {
    if (!activeEntry) { setElapsed(''); return }
    const tick = () => {
      const diff = Date.now() - new Date(activeEntry.clock_in).getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeEntry])

  // Get GPS
  function getPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('GPS non disponible')); return }
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(new Error(`GPS: ${err.message}`)),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  async function handleClockIn() {
    if (!session || !selectedProject) return
    setLoading(true); setMessage(''); setGpsError('')
    try {
      const coords = await getPosition()
      setGps(coords)

      const project = projects.find(p => p.id === selectedProject)
      if (project?.latitude && project?.longitude) {
        const dist = distanceFeet(coords.latitude, coords.longitude, project.latitude, project.longitude)
        if (dist > project.work_radius_feet) {
          setMessage(`⚠️ Vous êtes à ${Math.round(dist)} pi du chantier (rayon: ${project.work_radius_feet} pi)`)
        }
      }

      const { error } = await supabase.from('time_entries').insert({
        employee_id: session.employeeId,
        project_id: selectedProject,
        type: 'regular',
        clock_in: new Date().toISOString(),
        gps_lat_in: coords.latitude,
        gps_lng_in: coords.longitude,
      })

      if (error) throw error
      setMessage('✅ Punch IN enregistré')
      loadData()
    } catch (e) {
      setGpsError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleClockOut() {
    if (!session || !activeEntry) return
    setLoading(true); setMessage(''); setGpsError('')
    try {
      const coords = await getPosition()
      setGps(coords)

      const clockInTime = new Date(activeEntry.clock_in).getTime()
      const totalMinutes = Math.round((Date.now() - clockInTime) / 60000)

      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: new Date().toISOString(),
          gps_lat_out: coords.latitude,
          gps_lng_out: coords.longitude,
          total_minutes: totalMinutes,
        })
        .eq('id', activeEntry.id)

      if (error) throw error
      setMessage(`✅ Punch OUT — ${totalMinutes} minutes enregistrées`)
      loadData()
    } catch (e) {
      setGpsError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const activeProject = projects.find(p => p.id === (activeEntry?.project_id ?? selectedProject))

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-xl font-bold text-center">Portail Employé</h1>

        {/* Active punch display */}
        {activeEntry && (
          <div className="bg-green-900/20 border border-green-700/50 rounded-2xl p-6 text-center space-y-2">
            <p className="text-green-400 font-semibold text-sm">EN CHANTIER</p>
            <p className="text-3xl font-bold font-mono text-white">{elapsed}</p>
            <p className="text-gray-400 text-sm">{activeProject?.name}</p>
            <p className="text-gray-500 text-xs">{activeProject?.address}</p>
          </div>
        )}

        {/* Project selector (only when not punched in) */}
        {!activeEntry && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Chantier</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Sélectionner un chantier —</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* GPS status */}
        {gps && (
          <p className="text-xs text-center text-gray-500">
            GPS: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
            {gps.accuracy ? ` ±${Math.round(gps.accuracy)}m` : ''}
          </p>
        )}

        {/* Messages */}
        {message && (
          <p className="text-sm text-center text-green-400 bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
        {gpsError && (
          <p className="text-sm text-center text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
            {gpsError}
          </p>
        )}

        {/* Action button */}
        {activeEntry ? (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl transition-colors"
          >
            {loading ? 'Enregistrement...' : '⏹ PUNCH OUT'}
          </button>
        ) : (
          <button
            onClick={handleClockIn}
            disabled={loading || !selectedProject}
            className="w-full py-5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl transition-colors"
          >
            {loading ? 'Enregistrement...' : '▶ PUNCH IN'}
          </button>
        )}
      </div>
    </div>
  )
}
