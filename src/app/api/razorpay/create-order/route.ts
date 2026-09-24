import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planName, billingCycle } = await request.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('...') || keySecret.includes('...')) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency: currency || 'INR',
      receipt: `devlaunch_${Date.now()}`,
      notes: {
        plan: planName || 'Pro',
        billing_cycle: billingCycle || 'annual',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation failed:', error);
    const errObj = error as { error?: { description?: string }; message?: string } | null;
    return NextResponse.json(
      { error: errObj?.error?.description || errObj?.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
