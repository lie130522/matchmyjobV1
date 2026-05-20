import { LegalLayout } from '@/components/marketing/LegalLayout'

export const metadata = {
  title: 'Terms of Service — MatchMyJob',
  description: 'Terms of Service for MatchMyJob, the AI-powered job search optimization platform.',
}

export default function LegalPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using MatchMyJob."
      lastUpdated="May 16, 2026"
      sections={[
        {
          title: '1. Acceptance of Terms',
          content: (
            <>
              <p>By creating an account or using MatchMyJob (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
              <p>MatchMyJob is operated by an individual operator based in Kinshasa, Democratic Republic of Congo (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;). The Service is available worldwide and complies with applicable data protection laws including GDPR.</p>
            </>
          ),
        },
        {
          title: '2. Description of Service',
          content: (
            <>
              <p>MatchMyJob provides AI-powered tools to help job seekers optimize their job search, including:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>CV Optimizer</strong> — ATS scoring and CV optimization against job offers</li>
                <li><strong>Job Analyzer</strong> — Analysis of job postings for skills, level, and red flags</li>
                <li><strong>Cover Letter Generator</strong> — Automated and guided cover letter creation</li>
                <li><strong>Job Search Hub</strong> — Aggregated job listings from multiple sources</li>
              </ul>
              <p className="mt-3">AI features are powered by Claude (Anthropic). Job listings are sourced via JSearch (RapidAPI). We do not guarantee the accuracy or completeness of AI-generated content — always review outputs before use.</p>
            </>
          ),
        },
        {
          title: '3. Account Registration',
          content: (
            <>
              <p>You must create an account to use any feature of the Service. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Keep your password secure and not share access with others</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 16 years of age (or the minimum age required in your jurisdiction)</li>
              </ul>
              <p className="mt-3">Each account is for individual use only. Creating multiple accounts to circumvent attempt limits is prohibited and may result in account termination.</p>
            </>
          ),
        },
        {
          title: '4. Attempt-Based Usage System',
          content: (
            <>
              <p>The Service uses an &quot;attempt&quot; system to meter AI feature usage:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>1 attempt = 1 use</strong> of any AI feature (CV Optimizer, Job Analyzer, Cover Letter, or Job Search analysis)</li>
                <li>Free accounts receive <strong>4 attempts</strong> valid for the lifetime of the account</li>
                <li>Paid plan attempts are valid for the current billing period only</li>
                <li><strong>Unused attempts do not roll over</strong> to the next period</li>
                <li>If an AI request fails due to a technical error on our side, the attempt is automatically refunded</li>
                <li>Saving job listings costs 0 attempts</li>
              </ul>
            </>
          ),
        },
        {
          title: '5. Payments and Subscriptions',
          content: (
            <>
              <p>Paid plans are billed monthly as a one-time payment per period. Payments are processed securely by Stripe.</p>
              <p className="mt-2"><strong>No automatic renewal:</strong> Your subscription will NOT auto-renew without your explicit confirmation. Three days before your plan expires, you will receive an email and in-app notification with options to confirm or cancel renewal.</p>
              <p className="mt-2">If you do not confirm renewal, your plan expires and your account is downgraded to the Free plan (0 attempts). Expired attempts are not refunded.</p>
              <p className="mt-2">Current pricing:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Free</strong> — $0, 4 attempts lifetime, 5 CV uploads</li>
                <li><strong>Starter</strong> — $2/month, 25 attempts, unlimited CV storage</li>
                <li><strong>Pro</strong> — $5/month, 60 attempts, unlimited CV storage, priority support</li>
                <li><strong>Expert</strong> — $10/month, 130 attempts, unlimited CV storage, priority support + API access</li>
              </ul>
              <p className="mt-3">We reserve the right to modify pricing with 30 days&apos; notice.</p>
            </>
          ),
        },
        {
          title: '6. Refund Policy',
          content: (
            <>
              <p>Payments are generally non-refundable given the digital nature of the Service. Exceptions may be made at our discretion for:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Extended service outages (&gt;24 hours) preventing access to features</li>
                <li>Billing errors (duplicate charges, incorrect amounts)</li>
              </ul>
              <p className="mt-3">To request a refund, contact us at <a href="mailto:support@matchmyjob.io" className="text-[#1B4FFF] hover:underline">support@matchmyjob.io</a> within 7 days of the charge.</p>
            </>
          ),
        },
        {
          title: '7. Acceptable Use',
          content: (
            <>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Generate false, misleading, or fraudulent CV or application content</li>
                <li>Attempt to reverse-engineer, scrape, or automate access to the Service</li>
                <li>Circumvent rate limits or attempt to access another user&apos;s data</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Upload files containing malware, macros, or malicious content</li>
              </ul>
              <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </>
          ),
        },
        {
          title: '8. Intellectual Property',
          content: (
            <>
              <p>You retain ownership of all content you upload (CVs, cover letters, etc.). By uploading content, you grant us a limited license to process it solely to provide the Service.</p>
              <p className="mt-2">AI-generated outputs (optimized CVs, cover letters, analyses) are provided to you for personal use. We make no claim of ownership over these outputs.</p>
              <p className="mt-2">The MatchMyJob name, logo, and platform design are our intellectual property and may not be used without permission.</p>
            </>
          ),
        },
        {
          title: '9. Disclaimers and Limitation of Liability',
          content: (
            <>
              <p>The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>That AI-generated content is accurate, complete, or suitable for any particular job application</li>
                <li>That using the Service will result in job interviews or employment</li>
                <li>Uninterrupted availability of the Service</li>
              </ul>
              <p className="mt-3">To the maximum extent permitted by law, our total liability to you for any claims arising from use of the Service shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
            </>
          ),
        },
        {
          title: '10. Termination',
          content: (
            <>
              <p>You may delete your account at any time from Settings. Upon deletion, all your data (CVs, cover letters, usage logs) will be permanently purged within 30 days.</p>
              <p className="mt-2">We may suspend or terminate your account for material breach of these Terms, with or without prior notice depending on the severity of the breach.</p>
            </>
          ),
        },
        {
          title: '11. Governing Law',
          content: (
            <p>These Terms are governed by the laws of the Democratic Republic of Congo. For users in the European Union, mandatory consumer protection laws of your country of residence also apply. Disputes shall be resolved through good-faith negotiation before any formal proceedings.</p>
          ),
        },
        {
          title: '12. Contact',
          content: (
            <p>For questions about these Terms, contact us at <a href="mailto:legal@matchmyjob.io" className="text-[#1B4FFF] hover:underline">legal@matchmyjob.io</a> or write to: MatchMyJob, Kinshasa, Democratic Republic of Congo.</p>
          ),
        },
      ]}
    />
  )
}
