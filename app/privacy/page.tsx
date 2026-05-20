import { LegalLayout } from '@/components/marketing/LegalLayout'

export const metadata = {
  title: 'Privacy Policy — MatchMyJob',
  description: 'Privacy Policy for MatchMyJob. How we collect, use, and protect your personal data.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How MatchMyJob collects, uses, and protects your personal data."
      lastUpdated="May 16, 2026"
      sections={[
        {
          title: '1. Who We Are',
          content: (
            <>
              <p>MatchMyJob (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI-powered job search optimization platform operated from Kinshasa, Democratic Republic of Congo. We are committed to protecting your personal data in accordance with the GDPR (EU Regulation 2016/679) and the Congolese law n°20/017 on the protection of personal data.</p>
              <p className="mt-2">Contact for privacy matters: <a href="mailto:privacy@matchmyjob.io" className="text-[#1B4FFF] hover:underline">privacy@matchmyjob.io</a></p>
            </>
          ),
        },
        {
          title: '2. Data We Collect',
          content: (
            <>
              <p>We collect the following categories of personal data:</p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="font-semibold text-[#0F172A]">Account data</p>
                  <p>First name, last name, email address, country, preferred language. Collected at registration.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">CV and application documents</p>
                  <p>PDF or DOCX files you upload for optimization, extracted text content, and AI-generated optimized versions.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">Usage data</p>
                  <p>Which AI features you use, timestamps, attempt counts, saved jobs. Used to power the Service and enforce plan limits.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">Payment data</p>
                  <p>Payment processing is handled entirely by Stripe. We store only the Stripe customer ID and subscription status — never card numbers or banking details.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">Technical data</p>
                  <p>IP address (for rate limiting only, not stored long-term), browser type via standard HTTP headers. We do not use tracking cookies or third-party analytics.</p>
                </div>
              </div>
            </>
          ),
        },
        {
          title: '3. How We Use Your Data',
          content: (
            <>
              <p>We process your data for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Service delivery</strong> — Processing CVs and job offers through AI, generating outputs, managing attempt balances. Legal basis: <em>performance of contract</em>.</li>
                <li><strong>Account management</strong> — Authentication, profile settings, subscription management. Legal basis: <em>performance of contract</em>.</li>
                <li><strong>Transactional emails</strong> — Welcome email, renewal reminders, subscription confirmations. Legal basis: <em>legitimate interest / performance of contract</em>.</li>
                <li><strong>Security and fraud prevention</strong> — Rate limiting, detecting abuse. Legal basis: <em>legitimate interest</em>.</li>
                <li><strong>Legal compliance</strong> — Retaining records as required by applicable law. Legal basis: <em>legal obligation</em>.</li>
              </ul>
              <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </>
          ),
        },
        {
          title: '4. Third-Party Services',
          content: (
            <>
              <p>We use the following trusted third-party processors:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Supabase</strong> (EU region — eu-west-1) — Database, authentication, and file storage. <a href="https://supabase.com/privacy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
                <li><strong>Anthropic (Claude AI)</strong> — AI processing of CV and job offer text. Your content is sent to Anthropic&apos;s API for processing. <a href="https://www.anthropic.com/privacy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
                <li><strong>Stripe</strong> — Payment processing. We never see your full card details. <a href="https://stripe.com/privacy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
                <li><strong>Resend</strong> — Transactional email delivery. <a href="https://resend.com/privacy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
                <li><strong>RapidAPI / JSearch</strong> — Job listing aggregation. Job search queries may be processed by this service. <a href="https://rapidapi.com/privacy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
                <li><strong>Vercel</strong> — Hosting and edge infrastructure. <a href="https://vercel.com/legal/privacy-policy" className="text-[#1B4FFF] hover:underline" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
              </ul>
            </>
          ),
        },
        {
          title: '5. Data Retention',
          content: (
            <>
              <p>We retain your data for the following periods:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Account data</strong> — Until account deletion, then purged within 30 days</li>
                <li><strong>CV files</strong> — Until deleted by you or upon account deletion</li>
                <li><strong>Usage logs</strong> — 12 months from the date of use</li>
                <li><strong>Payment records</strong> — 7 years as required by accounting regulations</li>
              </ul>
              <p className="mt-3">When you delete your account, all associated personal data is permanently deleted within 30 days, except data we are legally required to retain (e.g., payment records).</p>
            </>
          ),
        },
        {
          title: '6. Data Security',
          content: (
            <>
              <p>We implement appropriate technical and organizational measures to protect your data:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>All data is encrypted in transit (HTTPS/TLS) and at rest</li>
                <li>Row-Level Security (RLS) on all database tables — each user can only access their own data</li>
                <li>API keys are never exposed to the browser — all AI and payment calls are server-side only</li>
                <li>Authentication is handled by Supabase with industry-standard practices</li>
                <li>File uploads are validated for type and size before processing</li>
              </ul>
            </>
          ),
        },
        {
          title: '7. Your Rights (GDPR)',
          content: (
            <>
              <p>If you are located in the European Economic Area, you have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Right of access</strong> — Request a copy of the data we hold about you</li>
                <li><strong>Right to rectification</strong> — Request correction of inaccurate data</li>
                <li><strong>Right to erasure</strong> — Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to portability</strong> — Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to object</strong> — Object to processing based on legitimate interest</li>
                <li><strong>Right to restriction</strong> — Request that we limit how we use your data</li>
                <li><strong>Right to withdraw consent</strong> — Where processing is based on consent, you may withdraw at any time</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@matchmyjob.io" className="text-[#1B4FFF] hover:underline">privacy@matchmyjob.io</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local supervisory authority.</p>
            </>
          ),
        },
        {
          title: '8. Cookies',
          content: (
            <>
              <p>We use only strictly necessary cookies:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Authentication cookies</strong> — Set by Supabase to maintain your session. Essential for the Service to function.</li>
                <li><strong>Locale cookie</strong> (<code className="bg-[#F1F5F9] px-1 rounded">NEXT_LOCALE</code>) — Stores your language preference (EN/FR). No personal data.</li>
              </ul>
              <p className="mt-3">We do not use analytics cookies, advertising cookies, or any third-party tracking cookies. No consent banner is required as we only use strictly necessary cookies.</p>
            </>
          ),
        },
        {
          title: '9. International Data Transfers',
          content: (
            <p>Your data is primarily stored in Supabase&apos;s EU (eu-west-1) region. When data is processed by Anthropic (Claude AI) or other US-based providers, it is transferred under appropriate safeguards (Standard Contractual Clauses or equivalent mechanisms) in compliance with GDPR Chapter V.</p>
          ),
        },
        {
          title: '10. Children',
          content: (
            <p>The Service is not directed to children under 16. We do not knowingly collect personal data from anyone under 16. If you become aware that a child has provided us with personal data, please contact us at <a href="mailto:privacy@matchmyjob.io" className="text-[#1B4FFF] hover:underline">privacy@matchmyjob.io</a> and we will delete it promptly.</p>
          ),
        },
        {
          title: '11. Changes to This Policy',
          content: (
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-app notice at least 14 days before the changes take effect. The &quot;last updated&quot; date at the top of this page indicates when the most recent revision was made. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.</p>
          ),
        },
        {
          title: '12. Contact',
          content: (
            <>
              <p>For any privacy-related questions or to exercise your rights:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Email: <a href="mailto:privacy@matchmyjob.io" className="text-[#1B4FFF] hover:underline">privacy@matchmyjob.io</a></li>
                <li>Address: MatchMyJob, Kinshasa, Democratic Republic of Congo</li>
              </ul>
            </>
          ),
        },
      ]}
    />
  )
}
