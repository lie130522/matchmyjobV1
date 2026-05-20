"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "FR">("EN");

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white border-b border-[#E2E8F0] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1B4FFF] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[#0F172A] text-[15px] tracking-tight">
              MatchMyJob
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* EN/FR toggle */}
            <button
              onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors font-mono"
            >
              {lang === "EN" ? (
                <>EN <span className="text-[#94A3B8]">/</span> FR</>
              ) : (
                <>EN <span className="text-[#94A3B8]">/</span> FR</>
              )}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 text-[14px] font-semibold text-white bg-[#1B4FFF] hover:bg-[#1240D6] rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
