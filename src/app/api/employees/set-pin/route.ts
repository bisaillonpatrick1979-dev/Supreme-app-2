import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashPIN } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { employeeId, pin } = await req.json()

    if (!employeeId || !pin) {
      return NextResponse.json({ error: 'employeeId et pin requis' }, { status: 400 })
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN invalide (4-6 chiffres)' }, { status: 400 })
    }

    // Verify caller is an authenticated admin
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRecord || !['admin', 'manager'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const pinHash = await hashPIN(pin)

    const { error } = await supabase
      .from('employees')
      .update({ pin_hash: pinHash })
      .eq('id', employeeId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('set-pin error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
