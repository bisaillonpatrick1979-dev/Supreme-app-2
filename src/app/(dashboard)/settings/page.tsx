import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: userRecord }, { data: company }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('companies').select('*').limit(1).single(),
  ])

  const settings = company?.settings as Record<string, unknown> | null

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {/* Company info */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Entreprise</h2>
        <dl className="space-y-3 text-sm">
          {[
            { label: 'Nom',        value: company?.name },
            { label: 'Thème',      value: company?.theme },
            { label: 'Devise',     value: settings?.currency as string },
            { label: 'Fuseau',     value: settings?.timezone as string },
            { label: 'Province',   value: settings?.province as string },
            { label: 'TPS (GST)',  value: settings?.gst_rate ? `${Number(settings.gst_rate) * 100}%` : undefined },
          ].map(row => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-gray-500">{row.label}</dt>
              <dd className="text-gray-200">{row.value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Admin profile */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Profil administrateur</h2>
        <dl className="space-y-3 text-sm">
          {[
            { label: 'Nom',   value: userRecord?.profile_name },
            { label: 'Email', value: userRecord?.email },
            { label: 'Rôle',  value: userRecord?.role },
          ].map(row => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-gray-500">{row.label}</dt>
              <dd className="text-gray-200">{row.value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Security */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sécurité</h2>
        <p className="text-sm text-gray-400">
          Pour changer votre mot de passe ou activer le 2FA, rendez-vous dans votre tableau de bord Supabase :
        </p>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Authentication → Users → {userRecord?.email}</li>
          <li>Activez la 2FA (authentification à deux facteurs)</li>
          <li>Configurez les backups automatiques</li>
        </ul>
        <div className="p-3 bg-amber-900/20 border border-amber-700/40 rounded-lg text-sm text-amber-300">
          ⚠️ Si le mot de passe est encore <strong>0000</strong>, changez-le immédiatement.
        </div>
      </section>
    </div>
  )
}
