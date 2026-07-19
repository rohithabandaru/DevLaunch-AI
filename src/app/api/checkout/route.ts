import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireApiUser, jsonError } from "@/lib/api-auth";
import { checkoutBodySchema } from "@/lib/validation";
import { getAppUrl } from "@/lib/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia" as any,
    })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured in this environment." },
        { status: 500 }
      );
    }

    const auth = await requireApiUser();
    if (!auth.ok) return auth.response;

    if (auth.user.isDemo) {
      return jsonError(
        "Checkout is unavailable in demo mode. Configure Supabase + Stripe for real billing.",
        400,
        { code: "DEMO_MODE" }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = checkoutBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid checkout request", 400, {
        details: parsed.error.flatten(),
      });
    }

    const { planType } = parsed.data;
    const isYearly = planType === "yearly";
    const amount = isYearly ? 499900 : 49900; // paise
    const name = isYearly
      ? "DevLaunch AI Pro - Yearly"
      : "DevLaunch AI Pro - Monthly";

    const origin =
      req.headers.get("origin") || getAppUrl().replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: auth.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name,
              description: "Unlimited AI tools for your job search.",
            },
            unit_amount: amount,
            recurring: {
              interval: isYearly ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.user.id,
      },
      client_reference_id: auth.user.id,
      success_url: `${origin}/jobtracker/ai?success=true`,
      cancel_url: `${origin}/jobtracker/ai?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: message },
      { status: 500 }
    );
  }
}
