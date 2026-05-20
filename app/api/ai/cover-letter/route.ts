import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/gemini'

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    mode: 'auto' | 'guided'
    job_offer: string
    cv_text?: string
    answers?: Record<string, string>
    log_id?: string
    lang?: 'en' | 'fr'
  }

  try {
    body = await request.json()
    if (!['auto', 'guided'].includes(body.mode)) throw new Error('Invalid mode')
    if (!body.job_offer?.trim()) throw new Error('Missing job_offer')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { mode, job_offer, cv_text, answers, log_id, lang = 'en' } = body

  let letter: string | null = null
  let lastError: string | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      letter = mode === 'auto'
        ? await generateAuto(job_offer, cv_text, lang)
        : await generateGuided(job_offer, answers ?? {}, lang)
      break
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error'
      if (attempt === 0) await new Promise(r => setTimeout(r, 1500))
    }
  }

  if (!letter) {
    if (log_id) await refund(log_id, request)
    return NextResponse.json({
      error: 'AI service temporarily unavailable. Your attempt has been refunded.',
      refunded: true,
      detail: lastError,
    }, { status: 503 })
  }

  // Save to history (fire and forget)
  supabase.from('ai_history').insert({
    user_id: user.id,
    feature: 'cover_letter',
    title: `Lettre de motivation — ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}`,
    input_text: job_offer.slice(0, 300),
    result: { letter, mode },
    lang,
  }).then(() => {})

  return NextResponse.json({ success: true, letter })
}

async function generateAuto(jobOffer: string, cvText?: string, lang: 'en' | 'fr' = 'en'): Promise<string> {
  const cvSection = cvText?.trim()
    ? `\nCandidate CV:\n${cvText.slice(0, 4000)}`
    : ''

  const langInstruction = lang === 'fr'
    ? 'Écris la lettre en français, ton professionnel et chaleureux.'
    : 'Write the letter in English, professional yet warm tone.'

  const prompt = `You are an expert career coach and professional writer. Write a compelling cover letter in 300-400 words.

${langInstruction}

Job Offer:
${jobOffer.slice(0, 3000)}
${cvSection}

Instructions:
- Write in first person
- Open with a strong hook (not "I am writing to apply for…" / not "Je me permets de vous contacter…")
- Highlight 2-3 specific achievements or skills matching the role
- Show genuine interest in the company and role
- End with a confident call to action
- Do NOT use placeholders like [Your Name] — write a complete, ready-to-send letter
- If no CV is provided, write a strong generic letter adapted to the job requirements
- Output the letter text only, no subject line, no header`

  return await generateText(prompt)
}

async function generateGuided(jobOffer: string, answers: Record<string, string>, lang: 'en' | 'fr' = 'en'): Promise<string> {
  const answersText = Object.entries(answers)
    .map(([q, a]) => `${q}: ${a}`)
    .join('\n')

  const langInstruction = lang === 'fr'
    ? 'Écris la lettre en français.'
    : 'Write the letter in English.'

  const prompt = `You are an expert career coach. Write a tailored cover letter using the candidate's personal answers.

${langInstruction}

Job Offer:
${jobOffer.slice(0, 3000)}

Candidate's answers:
${answersText}

Instructions:
- Write 300-400 words in first person
- Weave the candidate's actual answers into a natural, compelling narrative
- Match the tone to the industry (tech = clear & direct, creative = expressive, finance = formal)
- Open with a strong hook, close with a confident call to action
- Output the letter text only, complete and ready to send`

  return await generateText(prompt)
}

async function refund(logId: string, request: Request) {
  await fetch(new URL('/api/attempts/refund', request.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
    body: JSON.stringify({ log_id: logId }),
  })
}
