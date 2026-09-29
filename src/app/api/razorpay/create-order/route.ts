import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSessionUser } from '@/lib/auth-server';
import { jsonError, readJsonBody } from '@/lib/http';
import { isPlanCurrency, resolvePlan, toMajorUnits } from '@/lib/plans';
import { getRazorpayCredentials } from '@/lib/razorpay-config';

/**
 * Creates a Razorpay order for the signed-in caller.
 *
 * The client sends only `tier` and `billingCycle`. The amount is derived
 * server-side from the plan catalog: the previous version accepted an `amount`
 * straight off the request body, so anyone could POST
 * `{tier:"ENTERPRISE", amount:1}` and buy the top tier for one paise.
 *
 * The caller's user id is written into the order notes. `verify-signature`
 * reads it back from Razorpay to prove the payment belongs to whoever is
 * claiming it — without it, user A's payment could be redeemed by user B.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, 'Sign in to purchase a subscription.');
  }

  const body = await request.text();
  const parsed = await readJsonBody(body);
  if (!parsed.ok) {
    return jsonError(parsed.status, parsed.message);
  }
  const input = parsed.data as { tier?: unknown; billingCycle?: unknown; currency?: unknown };

  const resolved = resolvePlan(input.tier, input.billingCycle);
  if (!resolved) {
    return jsonError(400, 'Unknown plan or billing cycle.');
  }

  // Razorpay settles in INR only. USD pricing is marketing copy until a USD
  // processor is configured; failing loudly beats silently charging INR for a
  // plan advertised in dollars.
  if (input.currency !== undefined && !isPlanCurrency(input.currency)) {
    return jsonError(400, 'Unsupported currency.');
  }
  if (input.currency === 'USD') {
    return jsonError(400, 'USD checkout is not available yet. Please pay in INR.');
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return jsonError(500, 'Payments are not configured. Please try again later.');
  }

  try {
    const razorpay = new Razorpay(credentials);
    const order = await razorpay.orders.create({
      amount: resolved.amountMinor,
      currency: 'INR',
      receipt: `devlaunch_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: resolved.plan.tier.toLowerCase(),
        plan_name: resolved.plan.name,
        billing_cycle: resolved.cycle,
        amount_minor: String(resolved.amountMinor),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      // Razorpay Checkout wants minor units, exactly as sent.
      amount: order.amount,
      currency: order.currency,
      planName: resolved.plan.name,
      tier: resolved.plan.tier,
      billingCycle: resolved.cycle,
      amountMajor: toMajorUnits(resolved.amountMinor),
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation failed:', error);
    const errObj = error as { error?: { description?: string }; message?: string } | null;
    return jsonError(500, errObj?.error?.description || errObj?.message || 'Could not start the payment.');
  }
}
