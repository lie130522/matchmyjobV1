import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Header minimal */}
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B4FFF] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[#0F172A] text-[15px] tracking-tight">
            MatchMyJob
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer minimal */}
      <footer className="px-6 py-4 text-center">
        <p className="text-[12px] text-[#94A3B8]">
          © 2026 MatchMyJob · Kinshasa, RDC ·{' '}
          <Link href="/privacy" className="hover:text-[#64748B] transition-colors">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link href="/legal" className="hover:text-[#64748B] transition-colors">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  )
}
