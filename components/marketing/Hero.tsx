import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const avatars = [
  { bg: "#1B4FFF", letter: "A" },
  { bg: "#00C97A", letter: "M" },
  { bg: "#7C3AED", letter: "S" },
  { bg: "#F97316", letter: "K" },
  { bg: "#0F172A", letter: "L" },
];

function ATSCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Floating background card (depth effect) */}
      <div
        className="absolute inset-0 rounded-2xl bg-[#EEF2FF] border border-[#E2E8F0]"
        style={{ transform: "rotate(3deg) translate(8px, 8px)" }}
      />

      {/* Main card */}
      <div className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8] font-mono">
              ATS Analysis
            </p>
            <p className="text-[14px] font-semibold text-[#0F172A] mt-0.5">
              Software Engineer · Google
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#E6FBF3] flex items-center justify-center">
            <span className="text-[#00C97A] text-[16px]">✓</span>
          </div>
        </div>

        {/* Score comparison */}
        <div className="flex items-end gap-4 mb-5">
          <div className="flex-1">
            <p className="text-[11px] font-medium text-[#94A3B8] mb-1.5 font-mono">BEFORE</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#94A3B8] font-mono">73</span>
              <span className="text-[#94A3B8] font-mono text-sm">/100</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: "73%" }} />
            </div>
          </div>

          <div className="flex items-center justify-center w-8 shrink-0 mb-3">
            <ArrowRight className="w-4 h-4 text-[#E2E8F0]" />
          </div>

          <div className="flex-1">
            <p className="text-[11px] font-medium text-[#00C97A] mb-1.5 font-mono">AFTER</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#00C97A] font-mono">91</span>
              <span className="text-[#00C97A] font-mono text-sm">/100</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-2 bg-[#E6FBF3] rounded-full overflow-hidden">
              <div className="h-full bg-[#00C97A] rounded-full" style={{ width: "91%" }} />
            </div>
          </div>
        </div>

        {/* Improvement badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6FBF3] rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C97A]" />
          <span className="text-[12px] font-semibold text-[#00A362]">+18 points improvement</span>
        </div>

        {/* Keywords found */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-2 font-mono">
            Keywords added
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "CI/CD", "Agile", "REST API"].map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 text-[12px] font-medium bg-[#EEF2FF] text-[#1B4FFF] rounded-md"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#FAF8F4] flex flex-col justify-center overflow-hidden">
      {/* Sentinel for navbar scroll detection */}
      <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-1" aria-hidden />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-24 lg:py-32">
          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-full shadow-sm w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#1B4FFF]" />
              <span className="text-[13px] font-medium text-[#64748B]">
                AI-powered · Free to start
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.05] tracking-tight">
              Land your dream job,
              <br />
              <span
                className="text-[#1B4FFF] italic font-semibold"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                faster.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[18px] sm:text-[20px] text-[#64748B] leading-relaxed max-w-lg font-normal">
              Optimize your CV with AI, decode job offers instantly, write
              compelling cover letters, and track every application — all in one
              place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-semibold text-white bg-[#1B4FFF] hover:bg-[#1240D6] rounded-lg transition-colors shadow-sm"
              >
                Get started free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors"
              >
                See how it works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-4 pt-6 border-t border-[#E2E8F0]">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {avatars.map((a, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[12px] font-bold text-white"
                    style={{ backgroundColor: a.bg }}
                  >
                    {a.letter}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#F97316] text-[14px]">★</span>
                  ))}
                </div>
                <p className="text-[13px] text-[#64748B]">
                  <span className="font-semibold text-[#0F172A]">2,400+</span>{" "}
                  job seekers already hired
                </p>
              </div>
            </div>
          </div>

          {/* Right — ATS card mockup */}
          <div className="hidden lg:flex items-center justify-center">
            <ATSCard />
          </div>
        </div>
      </div>
    </section>
  );
}
