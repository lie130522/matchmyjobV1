import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/gemini'
import { z } from 'zod'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { input_type: 'url' | 'text'; content: string; log_id?: string; lang?: 'en' | 'fr' }
  try {
    body = await request.json()
    if (!body.content?.trim()) throw new Error('Missing content')
    if (!['url', 'text'].includes(body.input_type)) throw new Error('Invalid input_type')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { input_type, content, log_id, lang = 'en' } = body

  // Scrape URL if needed
  let jobText = content
  if (input_type === 'url') {
    const scraped = await scrapeUrl(content)
    if (!scraped) {
      return NextResponse.json({
        error: 'Could not fetch the job posting from this URL. Please paste the job description as text instead.',
        code: 'SCRAPE_FAILED',
      }, { status: 422 })
    }
    jobText = scraped
  }

  if (jobText.trim().length < 100) {
    return NextResponse.json({ error: 'The job description is too short to analyze.' }, { status: 422 })
  }

  // Fetch profile CV text for match score (same Gemini call)
  const { data: profileCv } = await supabase
    .from('cvs')
    .select('cv_text')
    .eq('user_id', user.id)
    .eq('is_profile', true)
    .maybeSingle()

  const cvText = profileCv?.cv_text ?? null

  // Call Gemini (retry ×2, then refund)
  let result: JobAnalysisResult | null = null
  let lastError: string | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      result = await callGemini(jobText, lang, cvText)
      break
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error'
      if (attempt === 0) await new Promise(r => setTimeout(r, 1500))
    }
  }

  if (!result) {
    if (log_id) await refund(log_id, request)
    return NextResponse.json({
      error: 'AI service temporarily unavailable. Your attempt has been refunded.',
      refunded: true,
      detail: lastError,
    }, { status: 503 })
  }

  // Save to history (fire and forget)
  const historyTitle = [result.job_title, result.company].filter(Boolean).join(' — ') || 'Job Analysis'
  supabase.from('ai_history').insert({
    user_id: user.id,
    feature: 'job_analyzer',
    title: historyTitle,
    input_text: content.slice(0, 300),
    result: { ...result, has_cv: !!cvText },
    lang,
  }).then(() => {})

  return NextResponse.json({ success: true, ...result, has_cv: !!cvText })
}

// ─── Scraper ───────────────────────────────────────────────────────────────────

async function scrapeUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchMyJobBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const { load } = await import('cheerio')
    const $ = load(html)
    $('nav, footer, header, script, style, noscript, iframe, svg').remove()
    const text = $('body').text().replace(/\s+/g, ' ').trim()
    return text.slice(0, 8000) || null
  } catch {
    return null
  }
}

// ─── Refund helper ─────────────────────────────────────────────────────────────

async function refund(logId: string, request: Request) {
  await fetch(new URL('/api/attempts/refund', request.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
    body: JSON.stringify({ log_id: logId }),
  })
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface JobAnalysisResult {
  // Identity
  job_title: string
  company: string | null
  location: string | null
  announcement_number: string | null

  // Contract & logistics
  contract_type: string | null
  work_schedule: string | null
  appointment_type: string | null
  telework: string | null
  is_supervisory: boolean | null
  promotion_potential: string | null

  // Timing
  closing_date: string | null   // ISO YYYY-MM-DD
  start_timeline: string | null
  timezone: string | null

  // Compensation
  salary: string | null
  benefits: string[]

  // Seniority & experience
  level: string
  years_experience_required: number | null
  experience_details: string[]

  // Education
  education_required: string | null
  education_fields: string[]

  // Skills
  required_skills: string[]
  nice_to_have_skills: string[]

  // Languages
  languages: Array<{ language: string; level: string; capabilities: string }>

  // Conditions
  working_conditions: string[]
  physical_requirements: string[]

  // Documents
  required_documents: Array<{ name: string; required_for: string }>

  // Application process
  application_steps: string[]
  evaluation_methods: string[]
  contact: { phone?: string | null; email?: string | null } | null
  hiring_preference: string[]

  // Security
  security_clearance: string | null
  background_investigation: boolean | null
  medical_exam: boolean | null

  // Responsibilities
  key_responsibilities: string[]

  // AI analysis
  red_flags: string[]
  critical_requirements: string[]
  application_tips: string[]
  difficulty_level: string

  // Match
  match_score: number | null
}

// ─── Zod schema ────────────────────────────────────────────────────────────────

const nullStr = z.string().nullable().optional().transform(v => v ?? null)
const nullBool = z.boolean().nullable().optional().transform(v => v ?? null)
const nullNum = z.number().nullable().optional().transform(v => v ?? null)
const strArray = z.array(z.string()).optional().transform(v => v ?? [])

const JobAnalysisSchema = z.object({
  job_title: z.string(),
  company: nullStr,
  location: nullStr,
  announcement_number: nullStr,
  contract_type: nullStr,
  work_schedule: nullStr,
  appointment_type: nullStr,
  telework: nullStr,
  is_supervisory: nullBool,
  promotion_potential: nullStr,
  closing_date: nullStr,
  start_timeline: nullStr,
  timezone: nullStr,
  salary: nullStr,
  benefits: strArray,
  level: z.string(),
  years_experience_required: nullNum,
  experience_details: strArray,
  education_required: nullStr,
  education_fields: strArray,
  required_skills: strArray,
  nice_to_have_skills: strArray,
  languages: z.array(z.object({
    language: z.string(),
    level: z.string(),
    capabilities: z.string(),
  })).optional().transform(v => v ?? []),
  working_conditions: strArray,
  physical_requirements: strArray,
  required_documents: z.array(z.object({
    name: z.string(),
    required_for: z.string(),
  })).optional().transform(v => v ?? []),
  application_steps: strArray,
  evaluation_methods: strArray,
  contact: z.object({
    phone: z.string().nullable().optional().transform(v => v ?? null),
    email: z.string().nullable().optional().transform(v => v ?? null),
  }).nullable().optional().transform(v => v ?? null),
  hiring_preference: strArray,
  security_clearance: nullStr,
  background_investigation: nullBool,
  medical_exam: nullBool,
  key_responsibilities: strArray,
  red_flags: strArray,
  critical_requirements: strArray,
  application_tips: strArray,
  difficulty_level: z.string(),
  match_score: nullNum,
})

// ─── Gemini call ───────────────────────────────────────────────────────────────

async function callGemini(
  jobText: string,
  lang: 'en' | 'fr',
  cvText: string | null,
): Promise<JobAnalysisResult> {
  const langInstruction = lang === 'fr'
    ? `IMPORTANT — Langue de réponse: Réponds en FRANÇAIS pour tous les champs textuels (red_flags, key_responsibilities, experience_details, application_tips, critical_requirements, working_conditions, physical_requirements, benefits, application_steps, evaluation_methods, hiring_preference, difficulty_level, appointment_type, telework).
Les noms propres de technologies/logiciels (Microsoft Office, AutoCAD, SAP, React…) restent dans leur langue originale.
Les champs contract_type doivent utiliser: "Temps plein" | "Temps partiel" | "Freelance" | "Stage" | "CDD" | "CDI".
Le champ level doit utiliser: "Junior" | "Intermédiaire" | "Senior" | "Cadre dirigeant" | "Inconnu".
Le champ difficulty_level doit utiliser: "Accessible" | "Modéré" | "Compétitif" | "Très compétitif".`
    : `IMPORTANT — Response language: Respond in ENGLISH for all text fields.
contract_type values: "Full-time" | "Part-time" | "Freelance" | "Internship" | "Fixed-term" | "Permanent".
level values: "Junior" | "Mid" | "Senior" | "Executive" | "Unknown".
difficulty_level values: "Easy" | "Moderate" | "Competitive" | "Very Competitive".`

  const matchSection = cvText
    ? `\n--- CANDIDATE CV (for match score calculation) ---\n${cvText.slice(0, 3000)}\n---\nCalculate match_score (integer 0–100) reflecting how well this CV matches the job requirements (skills, experience, education, languages).`
    : ''

  const prompt = `You are a senior talent acquisition specialist and job offer analyst. Your mission is to extract EVERY relevant piece of information from this job posting and structure it into a comprehensive, actionable intelligence report for a candidate.

${langInstruction}
${matchSection}

--- JOB POSTING ---
${jobText.slice(0, 7000)}
---

Return ONLY the following JSON object. Use null for fields not found. Use [] for missing lists. Be EXHAUSTIVE — do not truncate lists. Convert all dates to ISO format YYYY-MM-DD.

{
  "job_title": "<exact job title from the posting>",
  "company": "<company or organization name, or null>",
  "location": "<city, country — e.g. 'Kinshasa, DRC' — or 'Remote', or null>",
  "announcement_number": "<vacancy/announcement/reference number, or null>",

  "contract_type": "<contract type — use the values defined above, or null>",
  "work_schedule": "<e.g. 'Full-time, 40 hours/week' or null>",
  "appointment_type": "<e.g. 'Permanent', 'Temporary', 'Indefinite', or null>",
  "telework": "<'Yes' | 'No' | 'Partial' | null>",
  "is_supervisory": <true if position involves supervising others, false if not, null if not mentioned>,
  "promotion_potential": "<e.g. 'LE-11' or null>",

  "closing_date": "<ISO date YYYY-MM-DD, or null>",
  "start_timeline": "<e.g. 'Within 4 weeks of offer' or null>",
  "timezone": "<e.g. 'GMT+1' or null>",

  "salary": "<salary info or null — if listed as $0 or unclear, note that it is undisclosed>",
  "benefits": [<list every benefit mentioned: health, insurance, pension, relocation, etc.>],

  "level": "<seniority level — use the values defined above>",
  "years_experience_required": <minimum years as integer, or null>,
  "experience_details": [<specific experience requirements exactly as listed — be exhaustive>],

  "education_required": "<highest degree required, e.g. 'Bachelor\\'s degree', or null>",
  "education_fields": [<list all accepted fields of study>],

  "required_skills": [<ALL mandatory skills, tools, software, certifications — be exhaustive, no artificial limit>],
  "nice_to_have_skills": [<optional/preferred skills — separate from required>],

  "languages": [
    {"language": "<language name>", "level": "<Fluent|Advanced|Intermediate|Basic>", "capabilities": "<e.g. speaking, reading, writing, translation>"}
  ],

  "working_conditions": [<all environment conditions: indoor/outdoor, hot, cold, noisy, dusty, rainy, etc.>],
  "physical_requirements": [<physical demands: heights, ladders, driving, lifting, etc.>],

  "required_documents": [
    {"name": "<document name>", "required_for": "<'All Applicants' | 'EFM only' | 'If applicable' | 'Veterans only'>"}
  ],

  "application_steps": [<ordered list of steps to apply>],
  "evaluation_methods": [<tests, interviews, assessments, skill evaluations mentioned>],
  "contact": {"phone": "<phone or null>", "email": "<email or null>"},
  "hiring_preference": [<priority categories in order, if specified>],

  "security_clearance": "<required clearance level, e.g. 'Public Trust' or null>",
  "background_investigation": <true | false | null>,
  "medical_exam": <true | false | null>,

  "key_responsibilities": [<all main duties — be thorough, do not truncate>],

  "red_flags": [<honest concerns for candidates: undisclosed salary, tight deadlines, heavy requirements, etc.>],
  "critical_requirements": [<absolute disqualifiers if missing — e.g. specific degree, clearance, license>],
  "application_tips": [<3–5 strategic tips specific to this job — based on hiring preference, evaluation methods, required docs>],
  "difficulty_level": "<use the values defined above>",

  "match_score": ${cvText ? '<integer 0–100 based on CV vs. job requirements>' : 'null'}
}

Return valid JSON only. No markdown, no code blocks, no comments outside the JSON.`

  const text = await generateText(prompt)

  // Strip potential markdown code fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Gemini response')

  const raw = JSON.parse(jsonMatch[0])
  const validated = JobAnalysisSchema.safeParse(raw)
  if (!validated.success) {
    throw new Error(`Gemini response validation failed: ${validated.error.message}`)
  }
  return validated.data as JobAnalysisResult
}
