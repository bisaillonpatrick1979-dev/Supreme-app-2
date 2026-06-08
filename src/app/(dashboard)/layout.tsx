import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/dashboard',          label: 'Tableau de bord', icon: '⊞' },
  { href: '/dashboard/projects', label: 'Projets',         icon: '🏗️' },
  { href: '/dashboard/clients',  label: 'Clients',         icon: '🤝' },
  { href: '/dashboard/employees',label: 'Employés',        icon: '👷' },
  { href: '/dashboard/catalog',  label: 'Catalogue',       icon: '📦' },
  { href: '/dashboard/invoices', label: 'Facturation',     icon: '🧾' },
  { href: '/dashboard/settings', label: 'Paramètres',      icon: '⚙️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('profile_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="font-bold text-white text-sm leading-tight">HailiteManager</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{userRecord?.profile_name ?? user.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  )
}
