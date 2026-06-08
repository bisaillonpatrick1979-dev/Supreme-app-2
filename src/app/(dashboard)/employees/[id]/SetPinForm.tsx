'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  employeeId: string
  hasPin: boolean
}

export function SetPinForm({ employeeId, hasPin }: Props) {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setMessage('')

    if (!/^\d{4,6}$/.test(pin)) {
      setError('Le PIN doit contenir 4 à 6 chiffres')
      return
    }
    if (pin !== confirm) {
      setError('Les PINs ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/employees/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setMessage('PIN configuré avec succès')
      setPin(''); setConfirm('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {hasPin ? 'Nouveau PIN' : 'PIN (4-6 chiffres)'}
          </label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••"
            inputMode="numeric"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Confirmer PIN</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••"
            inputMode="numeric"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {message && <p className="text-xs text-green-400">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? 'Enregistrement...' : hasPin ? 'Changer le PIN' : 'Configurer le PIN'}
      </button>
    </form>
  )
}
