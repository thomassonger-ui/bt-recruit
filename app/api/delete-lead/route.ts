import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DASHBOARD_PW = process.env.DASHBOARD_PASSWORD || ''

export async function POST(req: Request) {
  try {
    const { leadId, pw } = await req.json()
    if (!pw || pw !== DASHBOARD_PW) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
    }
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
    if (error) {
      console.error('[delete-lead]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[delete-lead] unexpected:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
