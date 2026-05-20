import { Resend } from 'resend'

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Initialisation lazy — évite l'exécution au module-level pendant le build
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@matchmyjob.app'
  try {
    const { error } = await resend.emails.send({
      from: `MatchMyJob <${FROM}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
    if (error) { console.error('Resend error:', error); return false }
    return true
  } catch (err) {
    console.error('sendEmail failed:', err)
    return false
  }
}
