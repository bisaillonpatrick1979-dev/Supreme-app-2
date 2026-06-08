import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, phone, address, company_name, total_spent, created_at')
    .order('name')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="grid gap-3">
        {(!clients || clients.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Aucun client</p>
            <p className="text-sm mt-1">Ajoutez vos premiers clients.</p>
          </div>
        )}
        {(clients ?? []).map(c => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 hover:border-gray-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 flex-shrink-0">
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{c.name}</p>
              <p className="text-sm text-gray-500 truncate">
                {c.company_name ? `${c.company_name} · ` : ''}{c.email ?? ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-semibold">
                {Number(c.total_spent).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
              </p>
              <p className="text-xs text-gray-500">total dépensé</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
