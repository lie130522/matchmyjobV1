import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST — save a job (0 attempts)
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let job_data: Record<string, unknown>
  try {
    const body = await request.json()
    if (!body.job_data?.job_id) throw new Error('Missing job_data.job_id')
    job_data = body.job_data
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { error } = await supabase
    .from('saved_jobs')
    .insert({ user_id: user.id, job_data })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE — unsave a job by job_id
export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const job_id = searchParams.get('job_id')
  if (!job_id) {
    return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
  }

  // job_data is jsonb — filter by nested field
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', user.id)
    .eq('job_data->>job_id', job_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
