"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const faqs = [
  {
    question: "Is DevLaunch AI free?",
    answer:
      "Yes! You can start with our feature-rich Free plan to build resumes, portfolios, and practice basic interviews. Upgrade to Pro anytime for unlimited storage, complete AI features, and cover letters.",
  },
  {
    question: "Can I download my resume as a PDF?",
    answer:
      "Absolutely! All resumes generated can be downloaded as professional, single-page, ATS-friendly PDFs optimized for recruiter screening tools.",
  },
  {
    question: "Do you provide real-time feedback for AI interviews?",
    answer:
      "Yes. Our AI Interview Coach evaluates your spoken or text responses against standard STAR methodology parameters and gives structural, tone, and confidence feedback.",
  },
  {
    question: "Can I host a portfolio on a custom domain?",
    answer:
      "By default, portfolios are hosted on a devlaunch.ai subdomain (e.g. yourname.devlaunch.ai). Custom domain mapping support is coming soon to the Pro plan.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isInView } = useInView();

  function toggleFAQ(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section id="faq" className="bg-white py-24">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            FAQ
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about DevLaunch AI.
          </p>
        </div>

        {/* FAQ list */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const delays = ["delay-100", "delay-200", "delay-300", "delay-400"];

            return (
              <div
                key={index}
                className={`rounded-xl border border-slate-200/80 transition-all duration-300 ${
                  isOpen ? "bg-indigo-50/20 border-indigo-200 shadow-sm" : "bg-white hover:bg-slate-50/50"
                } ${delays[index]} ${
                  isInView ? "animate-fade-in-up" : "opacity-0"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-800 text-base md:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-indigo-500" : ""
                    }`}
                  />
                </button>

                {/* Smooth grid accordion */}
                <div
                  className={`accordion-content ${isOpen ? "open" : ""}`}
                >
                  <div className="accordion-inner">
                    <p className="px-6 pb-6 text-sm md:text-base text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
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