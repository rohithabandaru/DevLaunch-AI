import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { jsonError, requireApiUser } from "@/lib/api-auth";

const eventSchema = z.object({
  slug: z.string().min(1),
  event: z.enum([
    "view",
    "unique_view",
    "resume_download",
    "contact_submit",
    "github_click",
    "linkedin_click",
  ]),
  visitorHash: z.string().optional(),
});

const COUNTER_MAP: Record<string, string> = {
  view: "views",
  unique_view: "unique_visitors",
  resume_download: "resume_downloads",
  contact_submit: "contact_submissions",
  github_click: "github_clicks",
  linkedin_click: "linkedin_clicks",
};

/** Record an analytics event for a published portfolio. */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request", 400, {
      details: parsed.error.flatten(),
    });
  }

  const { slug, event, visitorHash } = parsed.data;
  const supabase = (await createClient()) ?? createAdminClient();

  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!portfolio) {
    // Local / unpublished — accept silently for client-side analytics
    return NextResponse.json({ ok: true, local: true });
  }

  await supabase.from("portfolio_events").insert({
    portfolio_id: portfolio.id,
    event_type: event,
    visitor_hash: visitorHash ?? null,
    metadata: {},
  });

  // Ensure analytics row
  await supabase.from("portfolio_analytics").upsert(
    { portfolio_id: portfolio.id },
    { onConflict: "portfolio_id", ignoreDuplicates: true }
  );

  const column = COUNTER_MAP[event];
  if (column) {
    // Read-modify-write (simple; fine at low volume)
    const { data: row } = await supabase
      .from("portfolio_analytics")
      .select(column)
      .eq("portfolio_id", portfolio.id)
      .maybeSingle();

    const current = Number((row as Record<string, number> | null)?.[column] ?? 0);
    await supabase
      .from("portfolio_analytics")
      .update({
        [column]: current + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("portfolio_id", portfolio.id);
  }

  return NextResponse.json({ ok: true });
}

/** Owner fetch of analytics for a portfolio by slug. */
export async function GET(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return jsonError("Missing slug", 400);

  if (auth.user.isDemo) {
    return NextResponse.json({
      analytics: {
        views: 0,
        uniqueVisitors: 0,
        resumeDownloads: 0,
        contactSubmissions: 0,
        githubClicks: 0,
        linkedinClicks: 0,
      },
      demo: true,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ analytics: null, demo: true });
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("slug", slug)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!portfolio) {
    return NextResponse.json({ analytics: null }, { status: 404 });
  }

  const { data } = await supabase
    .from("portfolio_analytics")
    .select(
      "views, unique_visitors, resume_downloads, contact_submissions, github_clicks, linkedin_clicks"
    )
    .eq("portfolio_id", portfolio.id)
    .maybeSingle();

  return NextResponse.json({
    analytics: {
      views: Number(data?.views) || 0,
      uniqueVisitors: Number(data?.unique_visitors) || 0,
      resumeDownloads: Number(data?.resume_downloads) || 0,
      contactSubmissions: Number(data?.contact_submissions) || 0,
      githubClicks: Number(data?.github_clicks) || 0,
      linkedinClicks: Number(data?.linkedin_clicks) || 0,
    },
  });
}
