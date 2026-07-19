"use client";

import { useInView } from "@/hooks/useInView";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "TCS",
  "Infosys",
  "Wipro",
  "Adobe",
  "Flipkart",
];

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center px-8 md:px-12">
      <span className="text-lg md:text-xl font-bold text-slate-400 hover:text-indigo-500 transition-colors duration-300 whitespace-nowrap select-none tracking-tight">
        {name}
      </span>
    </div>
  );
}

export default function TrustedBy() {
  const { ref, isInView } = useInView();

  return (
    <section
      ref={ref}
      id="trusted"
      className="relative bg-white py-14 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p
          className={`mb-8 text-center text-sm font-semibold uppercase tracking-widest text-slate-400 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Students from top companies trust DevLaunch AI
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-marquee w-max">
          {/* Duplicate the logos for seamless loop */}
          {[...companies, ...companies].map((company, i) => (
            <LogoItem key={`${company}-${i}`} name={company} />
          ))}
        </div>
      </div>
    </section>
  );
}