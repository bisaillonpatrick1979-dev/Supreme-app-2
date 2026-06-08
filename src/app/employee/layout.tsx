'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEmployeeSession, clearEmployeeSession, type EmployeeSession } from '@/lib/auth'
import Link from 'next/link'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<EmployeeSession | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const s = getEmployeeSession()
    if (!s) {
      router.replace('/employee-login')
    } else {
      setSession(s)
    }
    setChecked(true)
  }, [router])

  function handleLogout() {
    clearEmployeeSession()
    router.push('/employee-login')
  }

  if (!checked) return null
  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">{session.name}</p>
          <p className="text-xs text-gray-500">{session.position}</p>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/employee/dashboard" className="text-sm text-gray-400 hover:text-white">Accueil</Link>
          <Link href="/employee/timesheet" className="text-sm text-gray-400 hover:text-white">Mes heures</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-white ml-2">
            Quitter
          </button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
