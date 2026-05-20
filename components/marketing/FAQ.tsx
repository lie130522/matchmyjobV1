"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is an attempt?",
    answer:
      "1 attempt = 1 use of any AI feature (CV Optimizer, Job Analyzer, Cover Letter Generator, or Job Search analysis). Each time you run an AI feature, one attempt is deducted from your balance. Saving a job listing is always free and never costs an attempt.",
  },
  {
    question: "What happens when I run out of attempts?",
    answer:
      "When your attempt balance hits 0, a blocking modal appears preventing access to AI features. You can upgrade your plan directly from that modal to instantly restore your attempts — or close the app and come back after your next billing cycle.",
  },
  {
    question: "Does my subscription auto-renew?",
    answer:
      "No. MatchMyJob never renews your subscription without your explicit confirmation. 3 days before your renewal date, you'll receive an email and an in-app notification with two buttons: Confirm or Cancel. If you don't respond, your plan expires and you return to the free tier.",
  },
  {
    question: "What file formats does CV Optimizer support?",
    answer:
      "CV Optimizer accepts PDF and DOCX files up to 10 MB. Your optimized CV is delivered in the same format as your original — PDF in, PDF out; DOCX in, DOCX out. DOCX files containing macros are flagged automatically with an ATS warning.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. All data is stored in Supabase with Row Level Security (RLS) enabled — meaning your data is only accessible to your authenticated account. API keys (Anthropic, Stripe, Resend) are exclusively server-side and never exposed to the client. MatchMyJob is GDPR compliant and complies with Congolese law n°20/017.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. Go to Settings → Subscription → Cancel plan. Cancellation is immediate — you keep your remaining attempts until the end of your current billing period, then return to the free tier. Your data is retained for 30 days after account deletion.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[#E2E8F0] last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-[16px] font-semibold text-[#0F172A] group-hover:text-[#1B4FFF] transition-colors leading-snug">
          {question}
        </span>
        <span className="shrink-0 w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center">
          {isOpen ? (
            <Minus className="w-3.5 h-3.5 text-[#0F172A]" strokeWidth={2.5} />
          ) : (
            <Plus className="w-3.5 h-3.5 text-[#0F172A]" strokeWidth={2.5} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="pb-5">
          <p className="text-[15px] text-[#64748B] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#FAF8F4] py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1B4FFF] mb-4 font-mono">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            Frequently asked{" "}
            <span
              className="italic font-semibold text-[#1B4FFF]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              questions
            </span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <p className="text-center text-[14px] text-[#64748B] mt-8">
          Still have questions?{" "}
          <a
            href="mailto:hello@matchmyjob.io"
            className="text-[#1B4FFF] font-medium hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </section>
  );
}
