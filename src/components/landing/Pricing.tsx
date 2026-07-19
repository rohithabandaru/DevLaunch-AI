"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const plans = [
  {
    name: "Free Tier",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started.",
    features: [
      "Up to 50 Jobs on Kanban",
      "Store up to 3 Resumes",
      "Basic Analytics",
      "Community Support",
    ],
    featured: false,
  },
  {
    name: "Pro Monthly",
    price: "₹499",
    period: "/month",
    description: "Most Popular",
    features: [
      "Unlimited Job Tracking",
      "Unlimited Resumes",
      "Full AI Tool Access",
      "Resume ATS Scoring",
      "AI Cover Letters",
    ],
    featured: true,
  },
  {
    name: "Pro Yearly",
    price: "₹4999",
    period: "/year",
    description: "Save ~16% annually.",
    features: [
      "Everything in Pro Monthly",
      "Early access to new features",
      "Priority 24/7 Support",
      "Custom domains (Soon)",
    ],
    featured: false,
  },
];

export default function Pricing() {
  const { ref, isInView } = useInView();

  return (
    <section id="pricing" className="bg-white py-24">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            Pricing
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Choose Your Plan
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Start free and upgrade whenever you&apos;re ready.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 items-start">
          {plans.map((plan, index) => {
            const delays = ["delay-100", "delay-200", "delay-300"];

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${delays[index]} ${
                  isInView ? "animate-fade-in-up" : "opacity-0"
                } ${
                  plan.featured
                    ? "bg-gradient-to-b from-indigo-50/80 to-white shadow-2xl ring-2 ring-indigo-500/30 lg:scale-105 z-10"
                    : "bg-white shadow-lg ring-1 ring-slate-200/80 hover:shadow-xl hover:ring-slate-300/80"
                }`}
              >
                {/* Featured badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-1.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 whitespace-nowrap">
                    ✨ Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-extrabold text-slate-900">
                  {plan.name}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          plan.featured
                            ? "bg-gradient-to-br from-indigo-400 to-indigo-500"
                            : "bg-gradient-to-br from-emerald-400 to-emerald-500"
                        }`}
                      >
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block mt-10">
                  <Button
                    className={`w-full transition-all duration-300 hover:-translate-y-0.5 ${
                      plan.featured
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 hover:shadow-xl"
                        : "hover:bg-slate-50"
                    }`}
                    variant={plan.featured ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}