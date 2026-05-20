import Link from "next/link";
import { Check, Info } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    attempts: "4 attempts · lifetime",
    highlight: false,
    featured: false,
    borderColor: "#E2E8F0",
    badge: null,
    features: [
      "4 lifetime AI attempts",
      "5 CVs stored",
      "CV Optimizer",
      "Job Analyzer",
      "Cover Letter Generator",
      "Job Search",
    ],
    cta: "Start for free",
    ctaStyle: "ghost" as const,
  },
  {
    name: "Starter",
    price: "$2",
    period: "/ month",
    attempts: "25 attempts / month",
    highlight: false,
    featured: false,
    borderColor: "#1B4FFF",
    badge: null,
    features: [
      "25 AI attempts / month",
      "Unlimited CVs stored",
      "CV Optimizer",
      "Job Analyzer",
      "Cover Letter Generator",
      "Job Search",
    ],
    cta: "Get started",
    ctaStyle: "outline-blue" as const,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/ month",
    attempts: "60 attempts / month",
    highlight: true,
    featured: true,
    borderColor: "#1B4FFF",
    badge: "Most popular",
    features: [
      "60 AI attempts / month",
      "Unlimited CVs stored",
      "CV Optimizer",
      "Job Analyzer",
      "Cover Letter Generator",
      "Job Search",
      "Priority support",
    ],
    cta: "Get Pro",
    ctaStyle: "blue" as const,
  },
  {
    name: "Expert",
    price: "$10",
    period: "/ month",
    attempts: "130 attempts / month",
    highlight: false,
    featured: false,
    borderColor: "#7C3AED",
    badge: null,
    features: [
      "130 AI attempts / month",
      "Unlimited CVs stored",
      "CV Optimizer",
      "Job Analyzer",
      "Cover Letter Generator",
      "Job Search",
      "Priority support",
      "API access",
    ],
    cta: "Get Expert",
    ctaStyle: "outline-violet" as const,
  },
];

type CtaStyle = "ghost" | "outline-blue" | "blue" | "outline-violet";

function CtaButton({ style, label }: { style: CtaStyle; label: string }) {
  const base =
    "w-full inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-semibold rounded-lg transition-colors";
  const styles: Record<CtaStyle, string> = {
    ghost:
      "border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]",
    "outline-blue":
      "border border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#EEF2FF]",
    blue: "bg-[#1B4FFF] text-white hover:bg-[#1240D6]",
    "outline-violet":
      "border border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3EEFF]",
  };
  return (
    <Link href="/signup" className={`${base} ${styles[style]}`}>
      {label}
    </Link>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-white py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1B4FFF] mb-4 font-mono">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            Simple, transparent{" "}
            <span
              className="italic font-semibold text-[#1B4FFF]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              pricing
            </span>
          </h2>
          <p className="mt-4 text-[17px] text-[#64748B] max-w-md mx-auto">
            Start free, upgrade when you need more. No surprises, no auto-renewal without your confirmation.
          </p>
        </div>

        {/* Cards — horizontal scroll on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl p-6 border-2 transition-shadow"
              style={{
                borderColor: plan.borderColor,
                background: plan.featured ? "#1B4FFF" : "white",
                boxShadow: plan.featured
                  ? "0 20px 40px rgba(27,79,255,0.25)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 bg-[#0F172A] text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className={`text-[13px] font-semibold uppercase tracking-widest mb-3 font-mono ${
                  plan.featured ? "text-blue-200" : "text-[#94A3B8]"
                }`}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className={`text-4xl font-extrabold font-mono ${
                    plan.featured ? "text-white" : "text-[#0F172A]"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-[14px] font-medium ${
                    plan.featured ? "text-blue-200" : "text-[#64748B]"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              {/* Attempts */}
              <p
                className={`text-[13px] font-medium mb-5 pb-5 border-b ${
                  plan.featured
                    ? "text-blue-100 border-white/10"
                    : "text-[#64748B] border-[#E2E8F0]"
                }`}
              >
                {plan.attempts}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.featured ? "text-blue-100" : "text-[#00C97A]"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`text-[13px] ${
                        plan.featured ? "text-blue-50" : "text-[#0F172A]"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.featured ? (
                <Link
                  href="/signup"
                  className="w-full inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-semibold rounded-lg bg-white text-[#1B4FFF] hover:bg-blue-50 transition-colors"
                >
                  {plan.cta}
                </Link>
              ) : (
                <CtaButton style={plan.ctaStyle} label={plan.cta} />
              )}
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div className="mt-8 flex items-start gap-2 max-w-2xl mx-auto">
          <Info className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#94A3B8] leading-relaxed">
            <strong className="text-[#64748B]">1 attempt = 1 AI feature use.</strong> Unused
            attempts don&apos;t roll over to the next month. No subscription auto-renews without
            your explicit confirmation — you get a reminder 3 days before.
          </p>
        </div>
      </div>
    </section>
  );
}
