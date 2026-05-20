"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useState } from "react";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/legal" },
  ],
  Support: [
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "mailto:hello@matchmyjob.io" },
  ],
};

export default function Footer() {
  const [lang, setLang] = useState<"EN" | "FR">("EN");

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 pb-12 border-b border-white/8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-[#1B4FFF] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-white text-[15px] tracking-tight">
                MatchMyJob
              </span>
            </Link>
            <p className="text-[14px] text-[#64748B] leading-relaxed max-w-xs">
              Land your dream job, faster. AI-powered CV optimization, job
              analysis, cover letters, and job search — all in one platform.
            </p>

            {/* Powered by Claude */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
              <span className="text-[12px] text-[#64748B]">Powered by</span>
              <span className="text-[12px] font-semibold text-white">Claude AI</span>
              <span className="text-[12px] text-[#64748B]">by Anthropic</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-4 font-mono">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-[13px] text-[#64748B]">
            © 2026 MatchMyJob · Kinshasa, RDC
          </p>

          {/* EN/FR toggle */}
          <button
            onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 text-[12px] font-medium text-[#64748B] hover:text-white hover:border-white/20 transition-colors font-mono"
          >
            <span className={lang === "EN" ? "text-white" : "text-[#64748B]"}>EN</span>
            <span className="text-[#334155]">/</span>
            <span className={lang === "FR" ? "text-white" : "text-[#64748B]"}>FR</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
