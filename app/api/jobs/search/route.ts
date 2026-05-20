import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const location = searchParams.get('location') ?? ''
  const employment_type = searchParams.get('employment_type') ?? ''
  const remote = searchParams.get('remote') ?? ''
  const page = searchParams.get('page') ?? '1'

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  // Build JSearch query string
  const q = location ? `${query} in ${location}` : query

  const params = new URLSearchParams({
    query: q,
    page,
    num_pages: '1',
    date_posted: 'all',
  })
  if (employment_type) params.set('employment_types', employment_type.toUpperCase())
  if (remote === 'true') params.set('job_requirements', 'no_experience') // JSearch has no direct remote filter; we filter client-side

  const apiUrl = `https://${process.env.RAPIDAPI_HOST}/search?${params}`

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('JSearch error:', res.status, text)
      return NextResponse.json({ error: 'Job search service unavailable. Please try again later.' }, { status: 502 })
    }

    const data = await res.json() as { data: JSearchJob[]; status: string }

    // Normalize and optionally filter remote
    let jobs = (data.data ?? []).map(normalizeJob)
    if (remote === 'true') jobs = jobs.filter(j => j.is_remote)

    // Fetch user's saved job IDs to mark saved state on results
    const { data: saved } = await supabase
      .from('saved_jobs')
      .select('job_data')
      .eq('user_id', user.id)

    const savedIds = new Set(
      (saved ?? []).map(s => (s.job_data as { job_id?: string }).job_id).filter(Boolean)
    )

    return NextResponse.json({
      jobs: jobs.map(j => ({ ...j, is_saved: savedIds.has(j.job_id) })),
      total: jobs.length,
    })
  } catch (err) {
    console.error('JSearch fetch error:', err)
    return NextResponse.json({ error: 'Job search service unavailable. Please try again later.' }, { status: 502 })
  }
}

interface JSearchJob {
  job_id: string
  job_title: string
  employer_name: string
  employer_logo: string | null
  job_city: string | null
  job_country: string | null
  job_is_remote: boolean
  job_employment_type: string | null
  job_min_salary: number | null
  job_max_salary: number | null
  job_salary_currency: string | null
  job_apply_link: string
  job_description: string
  job_posted_at_datetime_utc: string | null
}

function normalizeJob(j: JSearchJob) {
  const salary = formatSalary(j.job_min_salary, j.job_max_salary, j.job_salary_currency)
  const location = [j.job_city, j.job_country].filter(Boolean).join(', ')

  return {
    job_id: j.job_id,
    title: j.job_title,
    company: j.employer_name,
    logo: j.employer_logo,
    location: location || null,
    is_remote: j.job_is_remote,
    employment_type: j.job_employment_type ?? null,
    salary,
    apply_link: j.job_apply_link,
    description: j.job_description?.slice(0, 400) ?? '',
    posted_at: j.job_posted_at_datetime_utc,
  }
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string | null {
  if (!min && !max) return null
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : (currency ?? '')
  if (min && max) return `${sym}${(min / 1000).toFixed(0)}k – ${sym}${(max / 1000).toFixed(0)}k`
  if (min) return `${sym}${(min / 1000).toFixed(0)}k+`
  if (max) return `up to ${sym}${(max / 1000).toFixed(0)}k`
  return null
}
