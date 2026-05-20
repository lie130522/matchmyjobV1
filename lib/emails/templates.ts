const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://matchmyjob.io'

// ── Shared layout ─────────────────────────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MatchMyJob</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <!-- Logo header -->
      <tr><td style="padding-bottom:24px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#1B4FFF;border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;">
              <span style="color:#fff;font-weight:800;font-size:16px;">M</span>
            </td>
            <td style="padding-left:10px;font-weight:700;font-size:17px;color:#0F172A;">MatchMyJob</td>
          </tr>
        </table>
      </td></tr>
      <!-- Card -->
      <tr><td style="background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:40px;">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;font-size:12px;color:#94A3B8;line-height:1.6;">
        © 2026 MatchMyJob · Kinshasa, RDC<br>
        <a href="${APP_URL}/settings" style="color:#94A3B8;">Manage preferences</a> ·
        <a href="${APP_URL}/legal" style="color:#94A3B8;">Terms</a> ·
        <a href="${APP_URL}/privacy" style="color:#94A3B8;">Privacy</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function btn(href: string, label: string, color = '#1B4FFF'): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">${label}</a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">${text}</h1>`
}

function p(text: string, muted = false): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${muted ? '#64748B' : '#0F172A'};">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;">`
}

// ── 1. Welcome email ──────────────────────────────────────────
export function welcomeEmail({ name, lang = 'en' }: { name: string; lang?: 'en' | 'fr' }) {
  const isFr = lang === 'fr'
  return {
    subject: isFr ? 'Bienvenue sur MatchMyJob 🎉' : 'Welcome to MatchMyJob 🎉',
    html: layout(`
      ${h1(isFr ? `Bienvenue, ${name} !` : `Welcome, ${name}!`)}
      ${p(isFr
        ? 'Votre compte est activé. Vous disposez de <strong>4 tentatives gratuites</strong> pour explorer toutes les fonctionnalités IA.'
        : 'Your account is ready. You have <strong>4 free attempts</strong> to explore all AI features.'
      )}
      ${p(isFr ? 'Que pouvez-vous faire ?' : 'What can you do?', true)}
      <ul style="margin:0 0 24px;padding-left:20px;color:#64748B;font-size:14px;line-height:2;">
        <li>${isFr ? '📄 Optimiser votre CV avec un score ATS' : '📄 Optimize your CV with an ATS score'}</li>
        <li>${isFr ? '🔍 Analyser une offre d\'emploi' : '🔍 Analyze a job offer'}</li>
        <li>${isFr ? '✉️ Générer une lettre de motivation' : '✉️ Generate a cover letter'}</li>
        <li>${isFr ? '🌐 Rechercher des offres agrégées' : '🌐 Search aggregated job listings'}</li>
      </ul>
      ${btn(`${APP_URL}/dashboard`, isFr ? 'Accéder à mon espace' : 'Go to my dashboard')}
    `),
  }
}

// ── 2. Renewal reminder J-3 ───────────────────────────────────
export function renewalReminderEmail({ name, plan, renewalDate, lang = 'en' }: {
  name: string; plan: string; renewalDate: string; lang?: 'en' | 'fr'
}) {
  const isFr = lang === 'fr'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  return {
    subject: isFr
      ? `Votre abonnement ${planLabel} expire dans 3 jours`
      : `Your ${planLabel} plan expires in 3 days`,
    html: layout(`
      ${h1(isFr ? 'Votre abonnement arrive à échéance' : 'Your subscription is expiring')}
      ${p(isFr
        ? `Bonjour ${name},`
        : `Hi ${name},`
      )}
      ${p(isFr
        ? `Votre plan <strong>${planLabel}</strong> expire le <strong>${renewalDate}</strong>. Confirmez le renouvellement pour continuer à accéder aux fonctionnalités IA.`
        : `Your <strong>${planLabel}</strong> plan expires on <strong>${renewalDate}</strong>. Confirm renewal to keep accessing AI features.`
      )}
      ${p(isFr
        ? 'Si vous ne confirmez pas, votre compte passera automatiquement en plan Gratuit (0 tentative).'
        : 'If you don\'t confirm, your account will automatically switch to the Free plan (0 attempts).',
        true
      )}
      ${divider()}
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:12px;">${btn(`${APP_URL}/settings`, isFr ? '✅ Confirmer le renouvellement' : '✅ Confirm renewal', '#00C97A')}</td>
        <td>${btn(`${APP_URL}/api/stripe/cancel`, isFr ? 'Annuler' : 'Cancel', '#64748B')}</td>
      </tr></table>
    `),
  }
}

// ── 3. Renewal confirmed ──────────────────────────────────────
export function renewalConfirmedEmail({ name, plan, nextDate, lang = 'en' }: {
  name: string; plan: string; nextDate: string; lang?: 'en' | 'fr'
}) {
  const isFr = lang === 'fr'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  return {
    subject: isFr ? `Renouvellement ${planLabel} confirmé ✓` : `${planLabel} plan renewed ✓`,
    html: layout(`
      ${h1(isFr ? 'Renouvellement confirmé !' : 'Renewal confirmed!')}
      ${p(isFr
        ? `Merci, ${name}. Votre plan <strong>${planLabel}</strong> a été renouvelé. Vos tentatives ont été réinitialisées.`
        : `Thank you, ${name}. Your <strong>${planLabel}</strong> plan has been renewed. Your attempts have been reset.`
      )}
      ${p(isFr ? `Prochain renouvellement : <strong>${nextDate}</strong>` : `Next renewal: <strong>${nextDate}</strong>`, true)}
      ${divider()}
      ${btn(`${APP_URL}/dashboard`, isFr ? 'Retour au tableau de bord' : 'Back to dashboard')}
    `),
  }
}

// ── 4. Subscription expired ───────────────────────────────────
export function subscriptionExpiredEmail({ name, plan, lang = 'en' }: {
  name: string; plan: string; lang?: 'en' | 'fr'
}) {
  const isFr = lang === 'fr'
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)
  return {
    subject: isFr ? 'Votre abonnement a expiré' : 'Your subscription has expired',
    html: layout(`
      ${h1(isFr ? 'Abonnement expiré' : 'Subscription expired')}
      ${p(isFr
        ? `Votre plan <strong>${planLabel}</strong> a expiré, ${name}. Votre compte est repassé en plan Gratuit.`
        : `Your <strong>${planLabel}</strong> plan has expired, ${name}. Your account has been downgraded to the Free plan.`
      )}
      ${p(isFr
        ? 'Vous pouvez vous réabonner à tout moment pour retrouver un accès complet.'
        : 'You can resubscribe at any time to regain full access.',
        true
      )}
      ${divider()}
      ${btn(`${APP_URL}/pricing`, isFr ? 'Voir les plans' : 'See plans')}
    `),
  }
}

// ── 5. Cancellation confirmed ─────────────────────────────────
export function cancellationEmail({ name, lang = 'en' }: { name: string; lang?: 'en' | 'fr' }) {
  const isFr = lang === 'fr'
  return {
    subject: isFr ? 'Annulation confirmée' : 'Cancellation confirmed',
    html: layout(`
      ${h1(isFr ? 'Annulation confirmée' : 'Your plan has been cancelled')}
      ${p(isFr
        ? `C'est confirmé, ${name}. Votre abonnement a été annulé et votre compte est repassé en plan Gratuit.`
        : `Confirmed, ${name}. Your subscription has been cancelled and your account is now on the Free plan.`
      )}
      ${p(isFr
        ? 'Vos données sont conservées. Vous pouvez vous réabonner à tout moment.'
        : 'Your data is kept safe. You can resubscribe anytime.',
        true
      )}
      ${divider()}
      ${btn(`${APP_URL}/dashboard`, isFr ? 'Retour au tableau de bord' : 'Back to dashboard', '#64748B')}
    `),
  }
}
