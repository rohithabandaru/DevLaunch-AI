"use client";

import { Star } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    initials: "RS",
    color: "bg-indigo-100 text-indigo-700 ring-indigo-200/50",
    shadowColor: "hover:shadow-indigo-100/80 hover:ring-indigo-300/30",
    review:
      "DevLaunch AI helped me create an ATS-friendly resume and I landed my first job within a month.",
  },
  {
    name: "Priya Reddy",
    role: "Frontend Developer",
    initials: "PR",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-200/50",
    shadowColor: "hover:shadow-emerald-100/80 hover:ring-emerald-300/30",
    review:
      "The portfolio builder saved me hours of work. It looks modern, responsive, and extremely professional.",
  },
  {
    name: "Arjun Kumar",
    role: "Full Stack Developer",
    initials: "AK",
    color: "bg-violet-100 text-violet-700 ring-violet-200/50",
    shadowColor: "hover:shadow-violet-100/80 hover:ring-violet-300/30",
    review:
      "The AI interview practice gave me massive confidence before my technical and system design rounds.",
  },
  {
    name: "Sneha Patel",
    role: "Data Scientist",
    initials: "SP",
    color: "bg-amber-100 text-amber-700 ring-amber-200/50",
    shadowColor: "hover:shadow-amber-100/80 hover:ring-amber-300/30",
    review:
      "The resume suggestions helped me optimize my keywords for ATS and I started getting multiple callbacks.",
  },
];

export default function Testimonials() {
  const { ref, isInView } = useInView();

  return (
    <section id="testimonials" className="bg-slate-50 py-24 pattern-section">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            Testimonials
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Loved by Developers
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Thousands of students and professionals trust DevLaunch AI.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((user, index) => {
            const delays = ["delay-100", "delay-200", "delay-300", "delay-400"];

            return (
              <div
                key={user.name}
                className={`relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:ring-2 ${user.shadowColor} ${delays[index]} ${
                  isInView ? "animate-fade-in-up" : "opacity-0"
                }`}
              >
                {/* Large decorative quote mark */}
                <span className="absolute top-4 right-6 text-7xl font-serif text-slate-100 select-none pointer-events-none">
                  &ldquo;
                </span>

                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4.5 w-4.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  &ldquo;{user.review}&rdquo;
                </p>

                {/* Author info */}
                <div className="mt-8 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ring-2 ${user.color}`}
                  >
                    {user.initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      {user.name}
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-200/50">
                        Verified
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">{user.role}</p>
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
