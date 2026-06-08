'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateEmployeeWithPIN } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

interface EmployeeOption {
  id: string
  full_name: string
  position: string
  avatar_url: string | null
}

export default function EmployeeLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'select' | 'pin'>('select')
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selected, setSelected] = useState<EmployeeOption | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  async function searchEmployees(q: string) {
    setQuery(q)
    if (q.length < 2) {
      setEmployees([])
      return
    }
    setSearching(true)
    const { data } = await supabase
      .from('employees')
      .select('id, full_name, position, avatar_url')
      .ilike('full_name', `%${q}%`)
      .eq('status', 'Active')
      .limit(10)

    setEmployees(data ?? [])
    setSearching(false)
  }

  function selectEmployee(emp: EmployeeOption) {
    setSelected(emp)
    setStep('pin')
    setPin('')
    setError('')
  }

  function appendPin(digit: string) {
    if (pin.length < 6) setPin(prev => prev + digit)
  }

  function clearPin() {
    setPin('')
    setError('')
  }

  async function submitPIN() {
    if (!selected || pin.length < 4) return
    setError('')
    setLoading(true)

    try {
      await authenticateEmployeeWithPIN(selected.id, pin)
      router.push('/employee/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN invalide')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Portail Employé</h1>
          <p className="text-sm text-gray-400">
            {step === 'select' ? 'Cherchez votre nom' : `Bienvenue, ${selected?.full_name}`}
          </p>
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            <input
              type="text"
              value={query}
              onChange={e => searchEmployees(e.target.value)}
              placeholder="Votre nom..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searching && (
              <p className="text-sm text-gray-400 text-center">Recherche...</p>
            )}
            <ul className="space-y-1">
              {employees.map(emp => (
                <li key={emp.id}>
                  <button
                    onClick={() => selectEmployee(emp)}
                    className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <p className="text-white font-medium">{emp.full_name}</p>
                    <p className="text-gray-400 text-sm">{emp.position}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-4">
            {/* PIN display */}
            <div className="flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                    i < pin.length
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  {i < pin.length && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                <button
                  key={i}
                  onClick={() => d === '⌫' ? setPin(p => p.slice(0,-1)) : d ? appendPin(d) : null}
                  disabled={!d}
                  className={`h-14 rounded-xl text-xl font-semibold transition-colors ${
                    d
                      ? 'bg-gray-800 hover:bg-gray-700 text-white active:bg-gray-600'
                      : 'invisible'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-center">
                {error}
              </p>
            )}

            <button
              onClick={submitPIN}
              disabled={pin.length < 4 || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Vérification...' : 'Confirmer'}
            </button>

            <button
              onClick={() => { setStep('select'); setSelected(null); clearPin() }}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Changer d&apos;employé
            </button>
          </div>
        )}

        <div className="text-center border-t border-gray-800 pt-4">
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Connexion Admin →
          </a>
        </div>
      </div>
    </div>
  )
}
