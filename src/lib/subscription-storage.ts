import { readStorage, writeStorage } from './storage';
import type { UserSubscription, SubscriptionTier, InvoiceRecord } from '@/types/subscription-types';

const SUBSCRIPTION_STORAGE_KEY = 'devlaunch_user_subscription';
const INVOICES_STORAGE_KEY = 'devlaunch_user_invoices';

export const DEFAULT_FREE_SUBSCRIPTION: UserSubscription = {
  tier: 'FREE',
  status: 'active',
  planId: 'free',
  billingCycle: 'monthly',
  currentPeriodEnd: '2099-12-31T23:59:59.000Z',
  autoRenew: false,
  currency: 'USD',
  amountPaid: 0,
};

export function getActiveSubscription(): UserSubscription {
  if (typeof window === 'undefined') return DEFAULT_FREE_SUBSCRIPTION;
  const saved = readStorage<UserSubscription>(SUBSCRIPTION_STORAGE_KEY, DEFAULT_FREE_SUBSCRIPTION);
  return saved || DEFAULT_FREE_SUBSCRIPTION;
}

export function activateSubscription(
  tier: SubscriptionTier,
  billingCycle: 'monthly' | 'annual',
  currency: 'USD' | 'INR',
  amountPaid: number,
  paymentProvider: string = 'stripe'
): UserSubscription {
  const endDate = new Date();
  if (billingCycle === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const newSub: UserSubscription = {
    tier,
    status: 'active',
    planId: tier.toLowerCase(),
    billingCycle,
    currentPeriodEnd: endDate.toISOString(),
    paymentMethod: paymentProvider.toUpperCase(),
    autoRenew: true,
    currency,
    amountPaid,
  };

  writeStorage(SUBSCRIPTION_STORAGE_KEY, newSub);

  // Record invoice
  const invoices = getInvoices();
  const newInvoice: InvoiceRecord = {
    id: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    planName: `DevLaunch AI ${tier} (${billingCycle})`,
    amount: `${currency === 'INR' ? '₹' : '$'}${amountPaid}`,
    currency,
    status: 'Paid',
    paymentProvider: paymentProvider.toUpperCase(),
  };

  writeStorage(INVOICES_STORAGE_KEY, [newInvoice, ...invoices]);

  // Dispatch custom window event so all components react immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('devlaunch_subscription_updated', { detail: newSub }));
  }

  return newSub;
}

export function cancelSubscription(): UserSubscription {
  const current = getActiveSubscription();
  const updated: UserSubscription = {
    ...current,
    status: 'canceled',
    autoRenew: false,
  };
  writeStorage(SUBSCRIPTION_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('devlaunch_subscription_updated', { detail: updated }));
  }
  return updated;
}

export function getInvoices(): InvoiceRecord[] {
  if (typeof window === 'undefined') return [];
  return readStorage<InvoiceRecord[]>(INVOICES_STORAGE_KEY, []);
}

export function isProMember(): boolean {
  const sub = getActiveSubscription();
  return sub.tier === 'PRO' || sub.tier === 'ENTERPRISE';
}

/** Check if the user's subscription/trial period has expired */
export function isSubscriptionExpired(): boolean {
  const sub = getActiveSubscription();
  // Default free users who never started a trial — treat as needing a trial
  if (sub.tier === 'FREE' && sub.status === 'active' && sub.planId === 'free') {
    return false; // Not expired yet, but SubscriptionGate will auto-start trial
  }
  // If status is already canceled and period has ended
  if (sub.status === 'canceled') {
    return new Date(sub.currentPeriodEnd) < new Date();
  }
  // For free-tier users with a real trial end date
  if (sub.tier === 'FREE' && sub.status === 'trialing') {
    return new Date(sub.currentPeriodEnd) < new Date();
  }
  // Active paid subscriptions that have expired
  if (sub.tier !== 'FREE' && new Date(sub.currentPeriodEnd) < new Date()) {
    return true;
  }
  return false;
}

/** Check if the user has a valid (non-expired) subscription that grants dashboard access */
export function isSubscriptionValid(): boolean {
  const sub = getActiveSubscription();
  // Paid users with active subscription
  if ((sub.tier === 'PRO' || sub.tier === 'ENTERPRISE') && sub.status === 'active') {
    return new Date(sub.currentPeriodEnd) >= new Date();
  }
  // Free trial users still within trial window
  if (sub.tier === 'FREE' && sub.status === 'trialing') {
    return new Date(sub.currentPeriodEnd) >= new Date();
  }
  // NO perpetual free access — trial must be active or user must pay
  return false;
}

/** Start a 7-day free trial for a new user */
export function startFreeTrial(): UserSubscription {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const trialSub: UserSubscription = {
    tier: 'FREE',
    status: 'trialing',
    planId: 'free-trial',
    billingCycle: 'monthly',
    currentPeriodEnd: trialEnd.toISOString(),
    autoRenew: false,
    currency: 'INR',
    amountPaid: 0,
  };

  writeStorage(SUBSCRIPTION_STORAGE_KEY, trialSub);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('devlaunch_subscription_updated', { detail: trialSub }));
  }

  return trialSub;
}

/** Get remaining trial/subscription days */
export function getRemainingDays(): number {
  const sub = getActiveSubscription();
  const end = new Date(sub.currentPeriodEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
