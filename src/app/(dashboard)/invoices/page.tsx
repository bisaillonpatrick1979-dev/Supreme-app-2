import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusColor: Record<string, string> = {
  Draft:     'bg-gray-500/20 text-gray-400',
  Sent:      'bg-blue-500/20 text-blue-400',
  Paid:      'bg-green-500/20 text-green-400',
  Overdue:   'bg-red-500/20 text-red-400',
  Cancelled: 'bg-gray-600/20 text-gray-500',
}

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, due_date, paid_at, clients(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Facturation</h1>
        <Link
          href="/dashboard/invoices/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
        >
          + Nouvelle facture
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3">Numéro</th>
              <th className="text-left px-6 py-3">Client</th>
              <th className="text-center px-6 py-3">Statut</th>
              <th className="text-right px-6 py-3">Total</th>
              <th className="text-right px-6 py-3">Échéance</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(!invoices || invoices.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucune facture
                </td>
              </tr>
            )}
            {(invoices ?? []).map(inv => {
              // @ts-expect-error supabase join
              const clientName = inv.clients?.name ?? '—'
              return (
                <tr key={inv.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-white">{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-gray-300">{clientName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white">
                    {Number(inv.total).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-400">{inv.due_date}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                      Voir →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
