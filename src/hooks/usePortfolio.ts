"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ANALYTICS_STORAGE_KEY,
  PUBLISHED_STORAGE_KEY,
  STORAGE_KEY,
  createSamplePortfolio,
  emptyPortfolio,
  getAiSuggestions,
  getPortfolioCompletion,
  normalizePortfolio,
  slugify,
} from "@/lib/portfolio";
import type { PortfolioAnalytics, PortfolioData } from "@/types/portfolio";

function loadAnalytics(slug: string): PortfolioAnalytics | null {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, PortfolioAnalytics>;
    return map[slug] ?? null;
  } catch {
    return null;
  }
}

export function saveAnalyticsLocal(
  slug: string,
  analytics: PortfolioAnalytics
) {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const map = raw
      ? (JSON.parse(raw) as Record<string, PortfolioAnalytics>)
      : {};
    map[slugify(slug) || "portfolio"] = analytics;
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData>(emptyPortfolio);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const normalized = normalizePortfolio(
          JSON.parse(raw) as Partial<PortfolioData>
        );
        const localAnalytics = loadAnalytics(normalized.slug);
        if (localAnalytics) {
          normalized.analytics = {
            ...normalized.analytics,
            ...localAnalytics,
          };
        }
        setData(normalized);
      } else {
        setData(createSamplePortfolio());
      }
    } catch {
      setData(createSamplePortfolio());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      const next = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setLastSavedAt(next.updatedAt);
    }, 400);
    return () => clearTimeout(timer);
  }, [data, hydrated]);

  const patchData = useCallback((patch: Partial<PortfolioData>) => {
    setData((prev) => ({
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const replaceData = useCallback((next: PortfolioData) => {
    setData({ ...next, updatedAt: new Date().toISOString() });
  }, []);

  const handleManualSave = useCallback(() => {
    const next = { ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
    setLastSavedAt(next.updatedAt);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  }, [data]);

  const handleReset = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset portfolio to empty template? This cannot be undone."
      )
    ) {
      return;
    }
    setData(emptyPortfolio);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleLoadSample = useCallback(() => {
    setData(createSamplePortfolio());
  }, []);

  const publishLocal = useCallback(() => {
    const next: PortfolioData = {
      ...data,
      published: true,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug: slugify(data.slug || data.fullName || "portfolio"),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(next));
    setData(next);
    return next;
  }, [data]);

  const completion = useMemo(() => getPortfolioCompletion(data), [data]);
  const suggestions = useMemo(() => getAiSuggestions(data), [data]);

  return {
    data,
    setData,
    hydrated,
    savedFlash,
    lastSavedAt,
    patchData,
    replaceData,
    handleManualSave,
    handleReset,
    handleLoadSample,
    publishLocal,
    completion,
    suggestions,
  };
}
