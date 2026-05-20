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

  // Parse multipart form
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('cv') as File | null
  const jobOffer = formData.get('job_offer') as string | null
  const logId = formData.get('log_id') as string | null
  const lang = (formData.get('lang') as 'en' | 'fr' | null) ?? 'en'
  const isTextCv = formData.get('is_text_cv') === 'true'

  if (!file || !jobOffer?.trim()) {
    return NextResponse.json({ error: 'Missing CV file or job offer' }, { status: 400 })
  }

  // Validate file type and size
  // Skip MIME check when isTextCv=true (profile CV sent as text/plain blob)
  if (!isTextCv) {
    const isValidType = file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (!isValidType) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 })
    }
  }

  // Extract text from CV
  let cvText: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (isTextCv) {
      // CV de profil déjà extrait — lire directement comme texte
      cvText = buffer.toString('utf-8')
    } else if (file.type === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const parsed = await pdfParse(buffer)
      cvText = parsed.text
    } else {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      cvText = result.value
    }
  } catch {
    if (logId) {
      await fetch(new URL('/api/attempts/refund', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
        body: JSON.stringify({ log_id: logId }),
      })
    }
    return NextResponse.json({ error: 'Could not read the CV file. Please check it is not corrupted.' }, { status: 422 })
  }

  if (!cvText.trim()) {
    if (logId) {
      await fetch(new URL('/api/attempts/refund', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
        body: JSON.stringify({ log_id: logId }),
      })
    }
    return NextResponse.json({ error: 'The CV appears to be empty or image-only (no extractable text).' }, { status: 422 })
  }

  // Call Gemini API (with retry x2 then refund)
  let result: ATSResult | null = null
  let lastError: string | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      result = await callGemini(cvText, jobOffer, lang)
      break
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error'
      if (attempt === 0) await new Promise(r => setTimeout(r, 1500))
    }
  }

  if (!result) {
    // Refund the attempt
    if (logId) {
      await fetch(new URL('/api/attempts/refund', request.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
        body: JSON.stringify({ log_id: logId }),
      })
    }
    return NextResponse.json({
      error: 'AI service temporarily unavailable. Your attempt has been refunded.',
      refunded: true,
      detail: lastError,
    }, { status: 503 })
  }

  // Save to history (fire and forget)
  supabase.from('ai_history').insert({
    user_id: user.id,
    feature: 'cv_optimizer',
    title: `CV optimisé — ${file.name}`,
    input_text: jobOffer.slice(0, 300),
    result,
    lang,
  }).then(() => {})

  return NextResponse.json({ success: true, ...result })
}

const ATSResultSchema = z.object({
  score_before: z.number().int().min(0).max(100),
  score_after: z.number().int().min(0).max(100),
  ats_issues: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  present_keywords: z.array(z.string()),
  optimized_cv: z.string().min(1),
  summary: z.string(),
})

type ATSResult = z.infer<typeof ATSResultSchema>

async function callGemini(cvText: string, jobOffer: string, lang: 'en' | 'fr'): Promise<ATSResult> {
  const langInstruction = lang === 'fr'
    ? 'IMPORTANT: Réponds en français pour les champs textuels (ats_issues, summary, optimized_cv). Les mots-clés techniques (missing_keywords, present_keywords) restent dans leur langue d\'origine.'
    : 'IMPORTANT: Respond in English for all text fields.'

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and CV optimizer.

${langInstruction}

Analyze this CV against the job offer and return a JSON response ONLY (no explanation outside the JSON).

CV:
${cvText.slice(0, 6000)}

Job Offer:
${jobOffer.slice(0, 3000)}

Return this exact JSON structure:
{
  "score_before": <integer 0-100, current ATS compatibility score>,
  "score_after": <integer 0-100, score after applying optimizations>,
  "ats_issues": [<list of ATS problems found, max 8 items, each under 80 chars — in the response language>],
  "missing_keywords": [<keywords from the job offer missing in the CV, max 15 items — keep original language>],
  "present_keywords": [<important keywords already present in both, max 10 items — keep original language>],
  "optimized_cv": <the full CV text rewritten to improve ATS score — same language as the original CV>,
  "summary": <one sentence summarizing the main improvement made — in the response language>
}

Rules:
- Keep the optimized CV truthful — only rephrase, restructure, and add relevant keywords that match the candidate's actual experience
- Do not invent experience or qualifications
- score_after must be higher than score_before
- Return valid JSON only`

  const text = await generateText(prompt)

  // Extract JSON from response (Gemini sometimes wraps in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Gemini response')

  const raw = JSON.parse(jsonMatch[0])
  const validated = ATSResultSchema.safeParse(raw)
  if (!validated.success) {
    throw new Error(`Gemini response validation failed: ${validated.error.message}`)
  }
  return validated.data
}
