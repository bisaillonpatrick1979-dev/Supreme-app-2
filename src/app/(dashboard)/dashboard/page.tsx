import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('profile_name, role, company_id')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HailiteManager</h1>
            <p className="text-gray-400 mt-1">
              Bienvenue, {userRecord?.profile_name ?? user.email}
            </p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Projets',        href: '/dashboard/projects',     icon: '🏗️' },
            { label: 'Employés',       href: '/dashboard/employees',    icon: '👷' },
            { label: 'Clients',        href: '/dashboard/clients',      icon: '🤝' },
            { label: 'Facturation',    href: '/dashboard/invoices',     icon: '🧾' },
            { label: 'Catalogue',      href: '/dashboard/catalog',      icon: '📦' },
            { label: 'Paramètres',     href: '/dashboard/settings',     icon: '⚙️' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl transition-colors group"
            >
              <span className="text-4xl">{item.icon}</span>
              <span className="font-medium text-gray-200 group-hover:text-white">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        {userRecord?.role === 'admin' && (
          <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl text-sm text-amber-300">
            <strong>Checklist post-connexion :</strong> changez votre mot de passe, activez le 2FA, ajoutez vos employés, vérifiez les catalogues.
          </div>
        )}
      </div>
    </main>
  )
}
