import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser, jsonError } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { normalizePortfolio, slugify } from "@/lib/portfolio";
import type { PortfolioData } from "@/types/portfolio";

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(64).optional(),
  title: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  theme: z.string().optional(),
  publish: z.boolean().optional(),
});

/** List the current user's portfolios. */
export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  if (auth.user.isDemo) {
    return NextResponse.json({ portfolios: [], demo: true });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ portfolios: [], demo: true });
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("id, slug, title, theme, is_published, published_at, updated_at, created_at")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ portfolios: data ?? [] });
}

/** Create or update a portfolio draft (optionally publish). */
export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, {
      details: parsed.error.flatten(),
    });
  }

  const portfolio = normalizePortfolio(
    parsed.data.data as Partial<PortfolioData>
  );
  const slug = slugify(parsed.data.slug || portfolio.slug || portfolio.fullName || "portfolio");
  const title =
    parsed.data.title ||
    portfolio.seoTitle ||
    portfolio.fullName ||
    "Untitled portfolio";
  const theme = parsed.data.theme || portfolio.template || "modern";
  const publish = Boolean(parsed.data.publish);

  const payloadData: PortfolioData = {
    ...portfolio,
    slug,
    published: publish || portfolio.published,
    publishedAt: publish
      ? new Date().toISOString()
      : portfolio.publishedAt,
    updatedAt: new Date().toISOString(),
  };

  if (auth.user.isDemo) {
    return NextResponse.json({
      portfolio: {
        id: parsed.data.id || "demo-portfolio",
        slug,
        title,
        theme,
        is_published: publish,
        data: payloadData,
      },
      demo: true,
      publicPath: `/p/${slug}`,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({
      portfolio: {
        id: parsed.data.id || "local-portfolio",
        slug,
        data: payloadData,
        is_published: publish,
      },
      demo: true,
      publicPath: `/p/${slug}`,
    });
  }

  const row = {
    user_id: auth.user.id,
    slug,
    title,
    theme,
    data: payloadData,
    is_published: publish,
    published_at: publish ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (parsed.data.id) {
    result = await supabase
      .from("portfolios")
      .update(row)
      .eq("id", parsed.data.id)
      .eq("user_id", auth.user.id)
      .select("id, slug, title, theme, is_published, published_at, updated_at, data")
      .single();
  } else {
    // Upsert by user + slug
    const existing = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("slug", slug)
      .maybeSingle();

    if (existing.data?.id) {
      result = await supabase
        .from("portfolios")
        .update(row)
        .eq("id", existing.data.id)
        .select("id, slug, title, theme, is_published, published_at, updated_at, data")
        .single();
    } else {
      result = await supabase
        .from("portfolios")
        .insert(row)
        .select("id, slug, title, theme, is_published, published_at, updated_at, data")
        .single();
    }
  }

  if (result.error) {
    return jsonError(result.error.message, 500);
  }

  // Ensure analytics row exists
  if (result.data?.id) {
    await supabase.from("portfolio_analytics").upsert(
      { portfolio_id: result.data.id },
      { onConflict: "portfolio_id", ignoreDuplicates: true }
    );
  }

  return NextResponse.json({
    portfolio: result.data,
    publicPath: `/p/${slug}`,
  });
}
