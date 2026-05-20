import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/suggestions
 * Returns personalized job listings based on the user's profile CV.
 * Uses Gemini to extract job title + location, then queries JSearch.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Load profile CV
  const { data: profileCv } = await supabase
    .from('cvs')
    .select('cv_text, filename')
    .eq('user_id', user.id)
    .eq('is_profile', true)
    .maybeSingle()

  if (!profileCv?.cv_text) {
    return NextResponse.json({ jobs: [], hasProfileCv: false })
  }

  // Extract job title + skills from CV via Gemini (fast, 8s timeout)
  let extractedTitle = ''
  let extractedLocation = ''

  try {
    const cvSnippet = profileCv.cv_text.slice(0, 2000)
    const prompt = `Extract from this CV (JSON only, no markdown):
{
  "job_title": "most recent or target job title (1-4 words, e.g. Software Engineer)",
  "location": "city and country if mentioned, else empty string",
  "top_skills": ["skill1", "skill2", "skill3"]
}

CV:
${cvSnippet}`

    const raw = await generateText(prompt, undefined, 8_000)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    extractedTitle = parsed.job_title ?? ''
    extractedLocation = parsed.location ?? ''
  } catch {
    // Fallback: use generic search
    extractedTitle = 'Software Engineer'
  }

  if (!extractedTitle) {
    return NextResponse.json({ jobs: [], hasProfileCv: true, extractedTitle: '' })
  }

  // Query JSearch
  const rapidApiKey = process.env.RAPIDAPI_KEY
  const rapidApiHost = process.env.RAPIDAPI_HOST ?? 'jsearch.p.rapidapi.com'

  if (!rapidApiKey) {
    return NextResponse.json({ jobs: [], hasProfileCv: true, extractedTitle })
  }

  try {
    const searchQuery = extractedLocation
      ? `${extractedTitle} in ${extractedLocation}`
      : extractedTitle

    const url = new URL(`https://${rapidApiHost}/search`)
    url.searchParams.set('query', searchQuery)
    url.searchParams.set('num_pages', '1')
    url.searchParams.set('page', '1')
    url.searchParams.set('date_posted', 'week')

    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ jobs: [], hasProfileCv: true, extractedTitle })
    }

    const data = await res.json()
    const rawJobs = data.data ?? []

    // Check which jobs are already saved
    const { data: savedRows } = await supabase
      .from('saved_jobs')
      .select('job_data')
      .eq('user_id', user.id)

    const savedIds = new Set(
      (savedRows ?? []).map((r) => (r.job_data as { job_id?: string })?.job_id).filter(Boolean)
    )

    const jobs = rawJobs.slice(0, 6).map((j: Record<string, unknown>) => ({
      job_id: j.job_id,
      title: j.job_title,
      company: j.employer_name,
      logo: j.employer_logo ?? null,
      location: [j.job_city, j.job_country].filter(Boolean).join(', ') || null,
      is_remote: j.job_is_remote ?? false,
      employment_type: j.job_employment_type ?? null,
      salary: j.job_salary ?? null,
      apply_link: j.job_apply_link ?? '#',
      description: (j.job_description as string)?.slice(0, 300) ?? '',
      posted_at: j.job_posted_at_datetime_utc ?? null,
      is_saved: savedIds.has(j.job_id as string),
    }))

    return NextResponse.json({ jobs, hasProfileCv: true, extractedTitle })
  } catch {
    return NextResponse.json({ jobs: [], hasProfileCv: true, extractedTitle })
  }
}
