import { FileText, Search, PenLine, Globe } from "lucide-react";

const features = [
  {
    icon: FileText,
    accent: "#1B4FFF",
    accentBg: "rgba(27,79,255,0.12)",
    tag: "CV Optimizer",
    title: "ATS Score Optimizer",
    description:
      "Upload your PDF or DOCX (up to 10 MB) alongside any job posting. Get an ATS compatibility score, a list of missing keywords ranked by importance, and a visual diff between your original and optimized CV — downloadable in your original format.",
    stats: [
      { label: "Avg. score gain", value: "+18pts" },
      { label: "Format support", value: "PDF & DOCX" },
    ],
  },
  {
    icon: Search,
    accent: "#00C97A",
    accentBg: "rgba(0,201,122,0.12)",
    tag: "Job Analyzer",
    title: "Job Offer Analyzer",
    description:
      "Paste a URL or raw text from any job posting. Claude extracts the title, company, salary range, required vs. desired skills, seniority level, red flags, and a match score against your stored CV — in seconds.",
    stats: [
      { label: "Data extracted", value: "12+ fields" },
      { label: "Input type", value: "URL or text" },
    ],
  },
  {
    icon: PenLine,
    accent: "#7C3AED",
    accentBg: "rgba(124,58,237,0.12)",
    tag: "Cover Letter",
    title: "Cover Letter Generator",
    description:
      "Two modes: Auto (Claude reads your CV + job offer + company website and writes a 300–400 word letter with a tone adapted to the sector) or Guided (Claude asks questions and coaches you section by section).",
    stats: [
      { label: "Word count", value: "300–400" },
      { label: "Modes", value: "Auto & Guided" },
    ],
  },
  {
    icon: Globe,
    accent: "#F97316",
    accentBg: "rgba(249,115,22,0.12)",
    tag: "Job Search",
    title: "Job Search Hub",
    description:
      "One search across Indeed, LinkedIn, Glassdoor, and ZipRecruiter via JSearch. Filter by keyword, sector, contract, seniority, salary, and remote options. Save any listing for free, or use 1 attempt to analyze or optimize your CV for it.",
    stats: [
      { label: "Job boards", value: "4 sources" },
      { label: "Save listings", value: "Free" },
    ],
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative bg-[#0F172A] py-24 lg:py-32 overflow-hidden"
    >
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #1B4FFF 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-8 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#3D68FF] mb-4 font-mono">
            4 AI-powered tools · 1 attempt each
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Everything you need to{" "}
            <span
              className="italic font-semibold text-[#3D68FF]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              get hired
            </span>
          </h2>
          <p className="mt-4 text-[17px] text-[#64748B] max-w-xl mx-auto">
            Four specialized AI tools, each using 1 attempt. Built for serious
            job seekers who want results, not guesswork.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.tag}
                className="group relative rounded-2xl p-6 border transition-colors"
                style={{
                  background: "#111827",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                {/* Subtle hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${f.accent}08 0%, transparent 60%)`,
                  }}
                  aria-hidden
                />

                <div className="relative">
                  {/* Icon + tag */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: f.accentBg }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: f.accent }}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest font-mono"
                      style={{ color: f.accent }}
                    >
                      {f.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[20px] font-bold text-white mb-2 leading-snug">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-[#64748B] leading-relaxed mb-5">
                    {f.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    {f.stats.map((s) => (
                      <div key={s.label}>
                        <p
                          className="text-[15px] font-bold font-mono"
                          style={{ color: f.accent }}
                        >
                          {s.value}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
