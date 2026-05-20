import Link from 'next/link'

interface Section {
  title: string
  content: React.ReactNode
}

interface Props {
  title: string
  subtitle: string
  lastUpdated: string
  sections: Section[]
}

export function LegalLayout({ title, subtitle, lastUpdated, sections }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#1B4FFF] flex items-center justify-center">
              <span className="text-white font-bold text-[13px]">M</span>
            </div>
            <span className="font-bold text-[15px] text-[#0F172A]">MatchMyJob</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px] text-[#64748B]">
            <Link href="/legal" className="hover:text-[#0F172A] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#0F172A] transition-colors">Privacy</Link>
            <Link href="/login" className="px-3 py-1.5 bg-[#1B4FFF] text-white rounded-lg font-medium hover:bg-[#1240D6] transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{title}</h1>
          <p className="text-[#64748B]">{subtitle}</p>
          <p className="text-[12px] text-[#94A3B8] mt-2">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-8">
          {sections.map((section, i) => (
            <section key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8">
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-4">{section.title}</h2>
              <div className="text-[14px] text-[#64748B] leading-relaxed space-y-3">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#94A3B8]">
          <span>© 2026 MatchMyJob · Kinshasa, RDC</span>
          <div className="flex gap-4">
            <Link href="/legal" className="hover:text-[#64748B] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#64748B] transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#64748B] transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
