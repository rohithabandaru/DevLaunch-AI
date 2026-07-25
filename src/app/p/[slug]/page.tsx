"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PortfolioSite from "@/components/portfolio/preview/PortfolioSite";
import {
  STORAGE_KEY,
  createSamplePortfolio,
  normalizePortfolio,
} from "@/lib/portfolio";
import type { PortfolioData } from "@/types/portfolio";

export default function PublishedPortfolioPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "preview";
  const [data, setData] = useState<PortfolioData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const published = localStorage.getItem("devlaunch-portfolio-published");
      if (published) {
        const parsed = normalizePortfolio(
          JSON.parse(published) as Partial<PortfolioData>
        );
        if (!parsed.slug || parsed.slug === slug || slug === "preview") {
          setData(parsed);
          return;
        }
      }

      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = normalizePortfolio(
          JSON.parse(draft) as Partial<PortfolioData>
        );
        if (!parsed.slug || parsed.slug === slug || slug === "preview") {
          setData(parsed);
          return;
        }
      }

      // Fallback demo so the route never feels broken
      const sample = createSamplePortfolio();
      if (slug === "preview" || slug === sample.slug) {
        setData(sample);
      } else {
        setMissing(true);
        setData(sample);
      }
    } catch {
      setData(createSamplePortfolio());
    }
  }, [slug]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading portfolio…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-2 text-xs text-slate-500 backdrop-blur print:hidden">
        <span>
          {missing
            ? `No published draft for “${slug}” — showing sample. Publish from the builder.`
            : `Preview · /p/${slug}`}
        </span>
        <Link
          href="/portfolio"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Open builder
        </Link>
      </div>
      <PortfolioSite data={data} />
    </div>
  );
}
