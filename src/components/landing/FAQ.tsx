'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How does DevLaunch AI optimize resumes for ATS compatibility?',
    answer:
      'Our platform uses an ATS parsing engine modeled after leading enterprise applicant tracking software (Greenhouse, Lever, Workday). We ensure clean single-column/two-column hierarchy, standard headings, vector fonts, and optimal keyword density derived directly from job descriptions.',
  },
  {
    question: 'What is included in the Free Plan vs Pro Plan?',
    answer:
      'The Free plan includes 1 ATS resume, 1 live developer portfolio, 3 AI cover letters per month, and 5 job tracker entries. Pro ($12/mo) unlocks unlimited resumes, unlimited portfolios, custom domain hosting, advanced ATS keyword analysis, unlimited AI job match scoring, and AI interview prep briefing.',
  },
  {
    question: 'How does the AI Job Tracker & Match Score work?',
    answer:
      'The Job Tracker lets you organize applications in Kanban and Table views. The built-in AI Match Score analyzes job description requirements against your profile skills, returning a 0-100% compatibility score, skill gaps, keyword recommendations, and tailored interview prep questions.',
  },
  {
    question: 'Can I publish my portfolio to a custom domain?',
    answer:
      'Yes! Pro subscribers can connect custom domains (for example alexdev.com or alex.dev) with automatic SSL certificates. Free users can host instantly on fast subdomains such as yourname.devlaunch.app.',
  },
  {
    question: 'How does the AI improve my resume bullet points?',
    answer:
      'Our fine-tuned LLM analyzes your input and rewrites action verbs using top tech industry standards (e.g., Google’s X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]"). It automatically injects missing technical keywords and quantifiable impact metrics.',
  },
  {
    question: 'Is my data secure and private?',
    answer:
      'Absolutely. We encrypt all personal details, work history, and uploaded files in transit (TLS 1.3) and at rest (AES-256). We never sell your data or train public LLMs on private candidate information.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative bg-[#0B1020]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="gradient-text-indigo">Questions</span>
          </h2>
          <p className="text-gray-400 text-base">
            Everything you need to know about DevLaunch AI resumes, portfolios, and the builder experience.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-start sm:items-center justify-between gap-3 sm:gap-4 font-semibold text-sm sm:text-base md:text-lg text-white hover:text-indigo-300 transition-colors focus:outline-none min-h-[56px] touch-manipulation"
                >
                  <span className="pr-1 leading-snug">{faq.question}</span>
                  <div
                    className={`w-8 h-8 min-w-[32px] rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-200 mt-0.5 sm:mt-0 ${
                      isOpen ? 'rotate-180 bg-indigo-500/20 text-indigo-400' : 'text-gray-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
