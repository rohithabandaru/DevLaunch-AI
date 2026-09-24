export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export type PaymentProvider = 'stripe' | 'razorpay' | 'upi' | 'card' | 'test';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  description: string;
  monthlyPriceUSD: number;
  annualPriceUSD: number;
  monthlyPriceINR: number;
  annualPriceINR: number;
  badge?: string | null;
  features: string[];
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  planId: string;
  billingCycle: 'monthly' | 'annual';
  currentPeriodEnd: string;
  paymentMethod?: string;
  autoRenew: boolean;
  currency: 'USD' | 'INR';
  amountPaid: number;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  planName: string;
  amount: string;
  currency: string;
  status: 'Paid' | 'Pending' | 'Failed';
  paymentProvider: string;
  receiptUrl?: string;
}
