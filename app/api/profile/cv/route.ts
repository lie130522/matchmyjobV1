import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — récupère le CV de profil de l'utilisateur connecté
export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cv } = await supabase
    .from('cvs')
    .select('id, filename, format, cv_text, created_at')
    .eq('user_id', user.id)
    .eq('is_profile', true)
    .single()

  return NextResponse.json({ cv: cv ?? null })
}

// POST — upload ou remplace le CV de profil
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('cv') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const isValidType = file.type === 'application/pdf' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isValidType) return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 })

  // Extract text
  let cvText: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (file.type === 'application/pdf') {
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
    return NextResponse.json({ error: 'Could not read the file. Please check it is not corrupted.' }, { status: 422 })
  }

  if (!cvText.trim()) {
    return NextResponse.json({ error: 'The CV appears to be empty or image-only.' }, { status: 422 })
  }

  const format = file.type === 'application/pdf' ? 'pdf' : 'docx'

  // Supprimer l'ancien CV de profil s'il existe
  await supabase.from('cvs').delete()
    .eq('user_id', user.id)
    .eq('is_profile', true)

  // Insérer le nouveau CV de profil
  const { data: newCv, error: insertError } = await supabase.from('cvs').insert({
    user_id: user.id,
    filename: file.name,
    format,
    storage_path: `${user.id}/profile.${format}`,
    is_profile: true,
    is_optimized: false,
    cv_text: cvText,
  }).select('id, filename, format, cv_text, created_at').single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ cv: newCv })
}

// DELETE — supprime le CV de profil
export async function DELETE() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('cvs').delete()
    .eq('user_id', user.id)
    .eq('is_profile', true)

  return NextResponse.json({ success: true })
}
