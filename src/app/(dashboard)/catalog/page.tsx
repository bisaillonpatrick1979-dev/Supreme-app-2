import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const supabase = await createClient()

  const [{ data: siding }, { data: roofing }] = await Promise.all([
    supabase.from('catalog_siding').select('*').order('brand').order('model'),
    supabase.from('catalog_roofing').select('*').order('brand').order('type'),
  ])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Catalogue</h1>

      {/* Siding */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revêtement extérieur (Siding)</h2>
          <Link href="/dashboard/catalog/siding/new" className="text-sm text-blue-400 hover:text-blue-300">
            + Ajouter
          </Link>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Marque / Modèle</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Couleur</th>
                <th className="text-right px-5 py-3">Coût/pi²</th>
                <th className="text-right px-5 py-3">Prix client/pi²</th>
                <th className="text-right px-5 py-3">Markup %</th>
                <th className="text-right px-5 py-3">Inst. ST/h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(!siding || siding.length === 0) && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Aucun article</td></tr>
              )}
              {(siding ?? []).map(item => (
                <tr key={item.id} className="hover:bg-gray-800/50">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{item.brand}</p>
                    <p className="text-gray-500 text-xs">{item.model}{item.profile ? ` · ${item.profile}` : ''}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{item.type}</td>
                  <td className="px-5 py-3 text-gray-400">{item.color ?? '—'}</td>
                  <td className="px-5 py-3 text-right text-gray-300">${Number(item.supplier_cost_per_sqft).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-medium">${Number(item.client_price_per_sqft).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-gray-400">{Number(item.markup_percent).toFixed(1)}%</td>
                  <td className="px-5 py-3 text-right text-gray-400">${Number(item.subcontractor_installation_rate_per_hour).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Roofing */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Toiture (Roofing)</h2>
          <Link href="/dashboard/catalog/roofing/new" className="text-sm text-blue-400 hover:text-blue-300">
            + Ajouter
          </Link>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Marque</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Couleur</th>
                <th className="text-center px-5 py-3">Garantie</th>
                <th className="text-right px-5 py-3">Coût/pi²</th>
                <th className="text-right px-5 py-3">Prix client/pi²</th>
                <th className="text-right px-5 py-3">Markup %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(!roofing || roofing.length === 0) && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Aucun article</td></tr>
              )}
              {(roofing ?? []).map(item => (
                <tr key={item.id} className="hover:bg-gray-800/50">
                  <td className="px-5 py-3 font-medium text-white">{item.brand}</td>
                  <td className="px-5 py-3 text-gray-400">{item.type}</td>
                  <td className="px-5 py-3 text-gray-400">{item.color ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-gray-400">
                    {item.warranty_years ? `${item.warranty_years} ans` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-300">${Number(item.supplier_cost_per_sqft).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-medium">${Number(item.client_price_per_sqft).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-gray-400">{Number(item.markup_percent).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
