import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api-auth";
import { normalizePortfolio } from "@/lib/portfolio";
import type { PortfolioData } from "@/types/portfolio";

type Params = { params: Promise<{ slug: string }> };

/** Public fetch of a published portfolio by slug. */
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug) return jsonError("Missing slug", 400);

  const supabase = (await createClient()) ?? createAdminClient();
  if (!supabase) {
    return NextResponse.json({ portfolio: null, demo: true });
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("id, slug, title, theme, is_published, published_at, updated_at, data")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) {
    return NextResponse.json({ portfolio: null }, { status: 404 });
  }

  const portfolio = normalizePortfolio(data.data as Partial<PortfolioData>);

  // Optional analytics
  const { data: analytics } = await supabase
    .from("portfolio_analytics")
    .select(
      "views, unique_visitors, resume_downloads, contact_submissions, github_clicks, linkedin_clicks"
    )
    .eq("portfolio_id", data.id)
    .maybeSingle();

  if (analytics) {
    portfolio.analytics = {
      views: Number(analytics.views) || 0,
      uniqueVisitors: Number(analytics.unique_visitors) || 0,
      resumeDownloads: Number(analytics.resume_downloads) || 0,
      contactSubmissions: Number(analytics.contact_submissions) || 0,
      githubClicks: Number(analytics.github_clicks) || 0,
      linkedinClicks: Number(analytics.linkedin_clicks) || 0,
    };
  }

  return NextResponse.json({
    portfolio: {
      ...portfolio,
      id: data.id,
      slug: data.slug,
      published: true,
      publishedAt: data.published_at ?? "",
      updatedAt: data.updated_at ?? "",
    },
  });
}
