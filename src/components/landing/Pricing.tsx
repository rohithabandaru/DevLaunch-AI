"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import {
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  FileText,
  Palette,
  Code2,
  MessageSquare,
  Briefcase,
  Bot,
  Download,
  Headphones,
  ChevronDown,
  ArrowRight,
  Shield,
  Star,
  Rocket,
  Brain,
  BarChart3,
  Mic,
  Target,
  Search,
  Map,
  Clock,
  Lock,
  Users,
  TrendingUp,
  Gauge,
  Lightbulb,
  FileDown,
  FolderArchive,
  Globe,
  FlaskConical,
  Cpu,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────

interface PlanFeature {
  text: string;
  icon: React.ReactNode;
}

interface FeatureCategory {
  name: string;
  icon: React.ReactNode;
  features: PlanFeature[];
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  period: string;
  featured: boolean;
  badge?: string;
  categories: FeatureCategory[];
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
}

// ─── Plan Data ──────────────────────────────────────────

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: "forever",
    featured: false,
    categories: [
      {
        name: "Resume Builder",
        icon: <FileText className="h-4 w-4" />,
        features: [
          { text: "Create up to 3 resumes", icon: <FileText className="h-3.5 w-3.5" /> },
          { text: "Basic ATS Resume", icon: <Target className="h-3.5 w-3.5" /> },
          { text: "Basic PDF Export", icon: <FileDown className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Portfolio Builder",
        icon: <Palette className="h-4 w-4" />,
        features: [
          { text: "Create 1 portfolio", icon: <Palette className="h-3.5 w-3.5" /> },
          { text: "Basic Templates", icon: <Globe className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Coding Practice",
        icon: <Code2 className="h-4 w-4" />,
        features: [
          { text: "Access 50 coding questions", icon: <Code2 className="h-3.5 w-3.5" /> },
          { text: "Easy level only", icon: <Gauge className="h-3.5 w-3.5" /> },
          { text: "View solutions", icon: <Lightbulb className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Interview Preparation",
        icon: <MessageSquare className="h-4 w-4" />,
        features: [
          { text: "Access 30 interview questions", icon: <MessageSquare className="h-3.5 w-3.5" /> },
          { text: "HR Questions", icon: <Users className="h-3.5 w-3.5" /> },
          { text: "Basic Technical Questions", icon: <Cpu className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Job Tracker",
        icon: <Briefcase className="h-4 w-4" />,
        features: [
          { text: "Track up to 20 applications", icon: <Briefcase className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "AI Features",
        icon: <Bot className="h-4 w-4" />,
        features: [
          { text: "10 AI requests/day", icon: <Bot className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Support",
        icon: <Headphones className="h-4 w-4" />,
        features: [
          { text: "Community Support", icon: <Users className="h-3.5 w-3.5" /> },
        ],
      },
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
  },
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    tagline: "Everything you need to land your dream job",
    monthlyPrice: 499,
    yearlyPrice: 499,
    period: "/month",
    featured: true,
    badge: "Most Popular",
    categories: [
      {
        name: "Resume Builder",
        icon: <FileText className="h-4 w-4" />,
        features: [
          { text: "Unlimited resumes", icon: <FileText className="h-3.5 w-3.5" /> },
          { text: "ATS Score", icon: <Target className="h-3.5 w-3.5" /> },
          { text: "AI Resume Rewrite", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "AI Resume Suggestions", icon: <Lightbulb className="h-3.5 w-3.5" /> },
          { text: "Premium Templates", icon: <Crown className="h-3.5 w-3.5" /> },
          { text: "DOCX Export", icon: <FileDown className="h-3.5 w-3.5" /> },
          { text: "Multiple Resume Versions", icon: <FileText className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Portfolio Builder",
        icon: <Palette className="h-4 w-4" />,
        features: [
          { text: "Unlimited Portfolios", icon: <Palette className="h-3.5 w-3.5" /> },
          { text: "Premium Portfolio Themes", icon: <Crown className="h-3.5 w-3.5" /> },
          { text: "AI Portfolio Generator", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "Custom Sections", icon: <Sparkles className="h-3.5 w-3.5" /> },
          { text: "Resume Integration", icon: <FileText className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Coding Practice",
        icon: <Code2 className="h-4 w-4" />,
        features: [
          { text: "Unlimited Coding Questions", icon: <Code2 className="h-3.5 w-3.5" /> },
          { text: "Easy, Medium, Hard", icon: <Gauge className="h-3.5 w-3.5" /> },
          { text: "Company-wise Questions", icon: <Briefcase className="h-3.5 w-3.5" /> },
          { text: "Topic-wise Questions", icon: <Search className="h-3.5 w-3.5" /> },
          { text: "Daily Challenges", icon: <Zap className="h-3.5 w-3.5" /> },
          { text: "AI Code Review", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "AI Hints", icon: <Lightbulb className="h-3.5 w-3.5" /> },
          { text: "Coding Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
          { text: "Performance Graphs", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Interview Preparation",
        icon: <MessageSquare className="h-4 w-4" />,
        features: [
          { text: "Unlimited Interview Questions", icon: <MessageSquare className="h-3.5 w-3.5" /> },
          { text: "HR Interviews", icon: <Users className="h-3.5 w-3.5" /> },
          { text: "Technical Interviews", icon: <Cpu className="h-3.5 w-3.5" /> },
          { text: "System Design", icon: <Globe className="h-3.5 w-3.5" /> },
          { text: "Behavioral Questions", icon: <Brain className="h-3.5 w-3.5" /> },
          { text: "Mock Interviews", icon: <Mic className="h-3.5 w-3.5" /> },
          { text: "AI Interview Evaluation", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "AI Feedback", icon: <Star className="h-3.5 w-3.5" /> },
          { text: "AI Answer Suggestions", icon: <Lightbulb className="h-3.5 w-3.5" /> },
          { text: "Voice Interview Simulation", icon: <Mic className="h-3.5 w-3.5" /> },
          { text: "Interview Progress Dashboard", icon: <BarChart3 className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Job Tracker",
        icon: <Briefcase className="h-4 w-4" />,
        features: [
          { text: "Unlimited Applications", icon: <Briefcase className="h-3.5 w-3.5" /> },
          { text: "Analytics Dashboard", icon: <BarChart3 className="h-3.5 w-3.5" /> },
          { text: "Interview Tracking", icon: <Clock className="h-3.5 w-3.5" /> },
          { text: "Offer Tracking", icon: <Target className="h-3.5 w-3.5" /> },
          { text: "AI Job Match", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "AI Resume Match", icon: <FileText className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "AI Career Tools",
        icon: <Brain className="h-4 w-4" />,
        features: [
          { text: "Cover Letter Generator", icon: <FileText className="h-3.5 w-3.5" /> },
          { text: "ATS Optimization", icon: <Target className="h-3.5 w-3.5" /> },
          { text: "Resume Keyword Analysis", icon: <Search className="h-3.5 w-3.5" /> },
          { text: "AI Career Coach", icon: <Bot className="h-3.5 w-3.5" /> },
          { text: "AI Learning Roadmap", icon: <Map className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Export",
        icon: <Download className="h-4 w-4" />,
        features: [
          { text: "PDF", icon: <FileDown className="h-3.5 w-3.5" /> },
          { text: "DOCX", icon: <FileDown className="h-3.5 w-3.5" /> },
          { text: "Portfolio ZIP Export", icon: <FolderArchive className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Support",
        icon: <Headphones className="h-4 w-4" />,
        features: [
          { text: "Priority Support", icon: <Headphones className="h-3.5 w-3.5" /> },
        ],
      },
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    tagline: "Best value — save 16%",
    monthlyPrice: 4999,
    yearlyPrice: 4999,
    period: "/year",
    featured: false,
    badge: "Best Value",
    categories: [
      {
        name: "Everything in Pro Monthly",
        icon: <Check className="h-4 w-4" />,
        features: [
          { text: "All Pro Monthly features included", icon: <Check className="h-3.5 w-3.5" /> },
        ],
      },
      {
        name: "Yearly Exclusive Perks",
        icon: <Crown className="h-4 w-4" />,
        features: [
          { text: "Save 16%", icon: <TrendingUp className="h-3.5 w-3.5" /> },
          { text: "Early Access Features", icon: <Rocket className="h-3.5 w-3.5" /> },
          { text: "Premium Templates", icon: <Crown className="h-3.5 w-3.5" /> },
          { text: "Premium AI Models", icon: <Brain className="h-3.5 w-3.5" /> },
          { text: "Faster AI Responses", icon: <Zap className="h-3.5 w-3.5" /> },
          { text: "Advanced Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
          { text: "Beta Features", icon: <FlaskConical className="h-3.5 w-3.5" /> },
          { text: "Custom Domains (Coming Soon)", icon: <Globe className="h-3.5 w-3.5" /> },
        ],
      },
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
];

// ─── FAQ Data ───────────────────────────────────────────

const pricingFaqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, absolutely! You can cancel your subscription at any time from your dashboard. Your Pro features will remain active until the end of your current billing period. No questions asked.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Of course! You can start with the Free plan and upgrade to Pro whenever you're ready. All your existing data — resumes, portfolios, tracked jobs — will carry over seamlessly.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "100%. We use Stripe for payment processing, the same platform trusted by millions of businesses worldwide. Your card details are never stored on our servers — everything is encrypted and PCI-compliant.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with Pro within the first 7 days, contact us and we'll process a full refund — no questions asked.",
  },
  {
    question: "Do I lose my data if I downgrade?",
    answer:
      "No, your data is never deleted. If you downgrade to Free, your existing resumes, portfolios, and tracked jobs remain intact. You'll just lose access to Pro-exclusive features until you upgrade again.",
  },
];

// ─── Helper: Checkout Handler ───────────────────────────

async function handleCheckout(planId: string) {
  const planType = planId.includes("yearly") ? "yearly" : "monthly";
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });

    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      // Fallback if Stripe is not configured or user is in demo mode / not logged in
      alert("Stripe integration coming soon.");
    }
  } catch (error) {
    alert("Stripe integration coming soon.");
  }
}

// ─── Animated Price Display ─────────────────────────────

function AnimatedPrice({
  price,
  period,
  animKey,
}: {
  price: number;
  period: string;
  animKey: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        key={animKey}
        className="text-5xl font-black text-slate-900 tabular-nums animate-price-flip"
      >
        ₹{price.toLocaleString("en-IN")}
      </span>
      <span className="text-base font-medium text-slate-500">{period}</span>
    </div>
  );
}

// ─── Feature Category Accordion ─────────────────────────

function FeatureCategorySection({
  category,
  isPro,
  defaultOpen,
}: {
  category: FeatureCategory;
  isPro: boolean;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-left group transition-colors hover:bg-slate-50/50 px-1 rounded-lg"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isPro
                ? "bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {category.icon}
          </div>
          <span className="text-sm font-bold text-slate-800">
            {category.name}
          </span>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
            {category.features.length}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className={`accordion-content ${isOpen ? "open" : ""}`}>
        <div className="accordion-inner">
          <ul className="space-y-2.5 pb-3 pl-1">
            {category.features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-2.5">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    isPro
                      ? "bg-gradient-to-br from-indigo-400 to-violet-500 shadow-sm shadow-indigo-200/50"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-500"
                  }`}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-[13px] text-slate-600">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Card ───────────────────────────────────────

function PricingCard({
  plan,
  isYearly,
  animDelay,
  isVisible,
}: {
  plan: Plan;
  isYearly: boolean;
  animDelay: string;
  isVisible: boolean;
}) {
  const currentPrice =
    plan.id === "free"
      ? 0
      : plan.id === "pro-yearly"
        ? plan.yearlyPrice
        : isYearly
          ? plan.yearlyPrice
          : plan.monthlyPrice;

  const isPro = plan.id !== "free";

  const handleClick = useCallback(() => {
    if (plan.id === "free") {
      // If not logged in → /register, if logged in → /dashboard
      // For now, default to /register (auth-aware routing handled by Link)
      return;
    }
    handleCheckout(plan.id);
  }, [plan.id]);

  const isFeatured =
    (plan.id === "pro-monthly" && !isYearly) ||
    (plan.id === "pro-yearly" && isYearly);

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-[1px] transition-all duration-500 hover:-translate-y-2 ${animDelay} ${
        isVisible ? "animate-fade-in-up" : "opacity-0"
      } ${
        isFeatured
          ? plan.id === "pro-yearly"
            ? "bg-gradient-to-b from-amber-400 via-orange-400 to-rose-500 shadow-2xl shadow-orange-300/40 lg:scale-[1.04] z-10"
            : "bg-gradient-to-b from-indigo-500 via-violet-500 to-purple-600 shadow-2xl shadow-indigo-300/40 lg:scale-[1.04] z-10"
          : "opacity-95 hover:opacity-100"
      }`}
    >
      {/* Card inner */}
      <div
        className={`relative flex flex-1 flex-col rounded-[calc(1rem-1px)] p-7 ${
          plan.featured || plan.id === "pro-yearly"
            ? "bg-white"
            : "bg-white shadow-lg ring-1 ring-slate-200/80 hover:shadow-xl hover:ring-slate-300/80"
        }`}
      >
        {/* Badge */}
        {plan.badge && (
          <div
            className={`absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg whitespace-nowrap ${
              plan.id === "pro-yearly"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-200/50"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200/50"
            }`}
          >
            {plan.id === "pro-yearly" ? (
              <Crown className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {plan.badge}
          </div>
        )}

        {/* Plan name & tagline */}
        <div className="mt-2">
          <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mt-5">
          <AnimatedPrice
            price={currentPrice}
            period={plan.id === "free" ? "forever" : plan.id === "pro-yearly" ? "/year" : "/month"}
            animKey={`${plan.id}-${isYearly ? "yearly" : "monthly"}`}
          />
          {plan.id === "pro-yearly" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5">
                Save 16%
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹5,988/year
              </span>
            </div>
          )}
          {plan.id === "pro-monthly" && isYearly && (
            <div className="mt-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5">
                Billed yearly — save 16%
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* "Everything in Free +" label for Pro */}
        {isPro && plan.id === "pro-monthly" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50/80 px-3 py-2">
            <Zap className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-600">
              Everything in Free +
            </span>
          </div>
        )}

        {/* Feature categories */}
        <div className="flex-1">
          {plan.categories.map((category, idx) => (
            <FeatureCategorySection
              key={category.name}
              category={category}
              isPro={isPro}
              defaultOpen={idx === 0}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          {plan.id === "free" ? (
            <Link href="/register" className="block">
              <Button
                className="w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md text-sm font-bold h-11"
                variant="outline"
              >
                {plan.buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleClick}
              className={`w-full transition-all duration-300 hover:-translate-y-0.5 text-sm font-bold h-11 ${
                plan.id === "pro-yearly"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-200/50 hover:shadow-xl"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl"
              }`}
            >
              {plan.buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Guarantee note */}
        {isPro && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="h-3 w-3" />
            7-day money-back guarantee
          </p>
        )}
      </div>
    </div>
  );
}

// ─── FAQ Item ───────────────────────────────────────────

function FAQItem({
  faq,
  isOpen,
  onToggle,
  delay,
  isVisible,
}: {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
  delay: string;
  isVisible: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${delay} ${
        isVisible ? "animate-fade-in-up" : "opacity-0"
      } ${
        isOpen
          ? "border-indigo-200 bg-indigo-50/30 shadow-sm"
          : "border-slate-200/80 bg-white hover:bg-slate-50/50 hover:border-slate-300/60"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
      >
        <span className="font-bold text-slate-800 text-sm md:text-base pr-4">
          {faq.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>
      <div className={`accordion-content ${isOpen ? "open" : ""}`}>
        <div className="accordion-inner">
          <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Comparison Table ───────────────────────────

const comparisonCategories = [
  {
    name: "Resume Builder",
    features: [
      { name: "Number of Resumes", free: "3", pro: "Unlimited" },
      { name: "ATS Score", free: false, pro: true },
      { name: "AI Resume Rewrite", free: false, pro: true },
      { name: "AI Resume Suggestions", free: false, pro: true },
      { name: "Premium Templates", free: false, pro: true },
      { name: "DOCX Export", free: false, pro: true },
    ],
  },
  {
    name: "Portfolio Builder",
    features: [
      { name: "Number of Portfolios", free: "1", pro: "Unlimited" },
      { name: "Premium Themes", free: false, pro: true },
      { name: "AI Portfolio Generator", free: false, pro: true },
      { name: "Custom Sections", free: false, pro: true },
    ],
  },
  {
    name: "Coding Practice",
    features: [
      { name: "Coding Questions", free: "50", pro: "Unlimited" },
      { name: "Difficulty Levels", free: "Easy", pro: "All" },
      { name: "AI Code Review", free: false, pro: true },
      { name: "Daily Challenges", free: false, pro: true },
      { name: "Coding Analytics", free: false, pro: true },
    ],
  },
  {
    name: "Interview Preparation",
    features: [
      { name: "Interview Questions", free: "30", pro: "Unlimited" },
      { name: "Mock Interviews", free: false, pro: true },
      { name: "AI Evaluation", free: false, pro: true },
      { name: "Voice Simulation", free: false, pro: true },
    ],
  },
  {
    name: "Job Tracker",
    features: [
      { name: "Applications", free: "20", pro: "Unlimited" },
      { name: "Analytics Dashboard", free: false, pro: true },
      { name: "AI Job Match", free: false, pro: true },
    ],
  },
  {
    name: "AI Career Tools",
    features: [
      { name: "AI Requests", free: "10/day", pro: "Unlimited" },
      { name: "Cover Letter Generator", free: false, pro: true },
      { name: "AI Career Coach", free: false, pro: true },
      { name: "AI Learning Roadmap", free: false, pro: true },
    ],
  },
];

function ComparisonTable({ isVisible }: { isVisible: boolean }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div
      className={`mt-20 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Feature Comparison
        </h3>
        <p className="mt-2 text-slate-500 text-sm">
          See exactly what you get in each plan
        </p>
      </div>

      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/60">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 text-sm font-bold text-slate-600">
          <div>Feature</div>
          <div className="text-center">Free</div>
          <div className="text-center text-indigo-600">Pro</div>
        </div>

        {/* Categories */}
        {comparisonCategories.map((category) => {
          const isExpanded = expandedCategory === category.name;

          return (
            <div key={category.name} className="border-t border-slate-100">
              {/* Category header */}
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : category.name)
                }
                className="flex w-full items-center justify-between px-6 py-3.5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-800">
                  {category.name}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Feature rows */}
              <div
                className={`accordion-content ${isExpanded ? "open" : ""}`}
              >
                <div className="accordion-inner">
                  {category.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="grid grid-cols-3 gap-4 px-6 py-3 text-sm border-t border-slate-50 hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="text-slate-600">{feature.name}</div>
                      <div className="flex justify-center">
                        {typeof feature.free === "boolean" ? (
                          feature.free ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <X className="h-4 w-4 text-slate-300" />
                          )
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {feature.free}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500">
                              <Check
                                className="h-3 w-3 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          ) : (
                            <X className="h-4 w-4 text-slate-300" />
                          )
                        ) : (
                          <span className="text-indigo-600 font-bold">
                            {feature.pro}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Pricing Component ─────────────────────────────

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { ref, isInView } = useInView();
  const { ref: faqRef, isInView: isFaqInView } = useInView();
  const { ref: ctaRef, isInView: isCtaInView } = useInView();



  return (
    <section id="pricing" className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-white py-24">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-50/50 blur-3xl" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6">
        {/* ── Header ── */}
        <div
          className={`text-center transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200/50">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 md:text-5xl lg:text-6xl">
            Choose Your{" "}
            <span className="gradient-text">Perfect Plan</span>
          </h2>

          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Start free and upgrade whenever you&apos;re ready. No credit card
            required.
          </p>
        </div>

        {/* ── Monthly / Yearly Toggle ── */}
        <div
          className={`mt-10 flex items-center justify-center gap-4 transition-all duration-700 delay-100 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span
            className={`text-sm font-semibold transition-colors ${
              !isYearly ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Monthly
          </span>

          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-8 w-[56px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              isYearly
                ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                : "bg-slate-200"
            }`}
            role="switch"
            aria-checked={isYearly}
            aria-label="Toggle yearly billing"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                isYearly ? "translate-x-[30px]" : "translate-x-[2px]"
              }`}
            />
          </button>

          <span
            className={`text-sm font-semibold transition-colors ${
              isYearly ? "text-slate-900" : "text-slate-400"
            }`}
          >
            Yearly
          </span>

          {isYearly && (
            <span className="animate-fade-in-scale inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200/60">
              <TrendingUp className="h-3 w-3" />
              Save 16%
            </span>
          )}
        </div>

        {/* ── Pricing Cards ── */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3 items-start max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const delays = ["delay-100", "delay-200", "delay-300"];
            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
                animDelay={delays[index]}
                isVisible={isInView}
              />
            );
          })}
        </div>

        {/* ── Feature Comparison ── */}
        <ComparisonTable isVisible={isInView} />
      </div>

      {/* ── Pricing FAQ ── */}
      <div ref={faqRef} className="relative mx-auto mt-24 max-w-3xl px-6">
        <div
          className={`text-center transition-all duration-700 ${
            isFaqInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h3>
          <p className="mt-2 text-slate-500 text-sm">
            Everything you need to know about our pricing
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {pricingFaqs.map((faq, index) => {
            const delays = [
              "delay-100",
              "delay-200",
              "delay-300",
              "delay-400",
              "delay-500",
            ];
            return (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openFaqIndex === index}
                onToggle={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
                delay={delays[index]}
                isVisible={isFaqInView}
              />
            );
          })}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div
        ref={ctaRef}
        className={`relative mx-auto mt-24 max-w-4xl px-6 transition-all duration-700 ${
          isCtaInView
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 px-8 py-16 text-center text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-20 -left-20 h-[200px] w-[200px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-[200px] w-[200px] rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute top-6 right-[20%] h-8 w-8 rounded-lg bg-white/5 border border-white/10 rotate-12 animate-float hidden md:block" />
          <div className="absolute bottom-6 left-[20%] h-10 w-10 rounded-full bg-white/5 border border-white/10 animate-float-slow hidden md:block" />

          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to Land Your{" "}
              <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-white bg-clip-text text-transparent">
                Dream Job?
              </span>
            </h3>

            <p className="mt-4 text-indigo-100/90 text-base md:text-lg max-w-xl mx-auto">
              Join thousands of developers using DevLaunch AI to supercharge
              their career journey.
            </p>

            <div className="mt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-slate-50 shadow-2xl shadow-indigo-950/40 hover:shadow-indigo-950/60 transition-all duration-300 hover:-translate-y-0.5 px-8 text-base font-bold"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-indigo-200/60">
              No credit card required · Free tier forever
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}