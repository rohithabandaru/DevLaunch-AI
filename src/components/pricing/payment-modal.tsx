'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { activateSubscription } from '@/lib/subscription-storage';
import type { SubscriptionTier } from '@/types/subscription-types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  tier: SubscriptionTier;
  initialMonthlyUSD?: number;
  initialAnnualUSD?: number;
  initialMonthlyINR?: number;
  initialAnnualINR?: number;
  onSuccess?: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayFailedResponse {
  error: {
    description?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: RazorpayFailedResponse) => void) => void;
}

interface RazorpayConstructor {
  new(options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

// Dynamically load Razorpay Checkout SDK Script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentModal({
  isOpen,
  onClose,
  planName = 'Pro',
  tier = 'PRO',
  initialMonthlyUSD = 4,
  initialAnnualUSD = 3,
  initialMonthlyINR = 299,
  initialAnnualINR = 199,
  onSuccess,
}: PaymentModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');

  // Processing, Error, & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Pre-load the Razorpay SDK as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Price
  const monthlyPrice = currency === 'INR' ? initialMonthlyINR : initialMonthlyUSD;
  const annualPrice = currency === 'INR' ? initialAnnualINR : initialAnnualUSD;
  const unitPrice = billingCycle === 'annual' ? annualPrice : monthlyPrice;
  const totalAmount = billingCycle === 'annual' ? unitPrice * 12 : unitPrice;
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    // Step 1: Load Razorpay SDK if not already loaded
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded || typeof window === 'undefined' || !window.Razorpay) {
      setIsProcessing(false);
      setErrorMessage('Failed to load Razorpay Payment Gateway. Please check your internet connection or try refreshing the page.');
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey.includes('rzp_test_...') || razorpayKey.includes('...')) {
      setIsProcessing(false);
      setErrorMessage('Razorpay Key ID missing: Please configure your Razorpay Key ID in .env.local.');
      return;
    }

    try {
      // Step 2: Create order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          planName: planName,
          billingCycle: billingCycle,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setIsProcessing(false);
        setErrorMessage(`Order creation failed: ${orderData.error || 'Server error'}`);
        return;
      }

      // Step 3: Open Razorpay Checkout with order_id
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DevLaunch AI',
        description: `${planName} Plan Subscription (${billingCycle})`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        handler: function (response: RazorpayResponse) {
          const payId = response.razorpay_payment_id || `PAY-${Date.now()}`;
          setTransactionId(payId);

          activateSubscription(
            tier,
            billingCycle,
            currency,
            totalAmount,
            'Razorpay'
          );

          setIsProcessing(false);
          setIsSuccess(true);
          if (onSuccess) onSuccess();
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayFailedResponse) {
        setIsProcessing(false);
        setErrorMessage(`Payment Failed: ${response.error?.description || 'Transaction cancelled'}`);
      });
      rzp.open();
    } catch (err: unknown) {
      setIsProcessing(false);
      const gatewayErr = err as { message?: string } | null;
      setErrorMessage(`Gateway Error: ${gatewayErr?.message || 'Could not launch payment window'}`);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Fixed Top Header */}
        <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
            Back
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Lock className="h-4 w-4 text-emerald-400" /> Secure Checkout
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Payment Successful!
                </span>
                <h2 className="text-3xl font-extrabold text-white">Welcome to {planName}!</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your account has been upgraded. You now have access to all premium features.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-white">{transactionId}</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Plan & Duration:</span>
                  <span className="font-bold text-violet-300">{planName} ({billingCycle})</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-400">{currencySymbol}{totalAmount}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col gap-4 text-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white mt-1">Order Summary</h2>
                  <p className="text-sm text-slate-400 mt-1">Review your plan details to continue</p>
                </div>
              </div>

              {/* Plan Details Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Selected Plan</div>
                    <div className="text-xl font-bold text-white">{planName}</div>
                  </div>
                  <div className="flex rounded-lg border border-white/10 bg-slate-900 p-1">
                    <button
                      type="button"
                      onClick={() => setCurrency('INR')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${currency === 'INR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      INR (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10" />

                {/* Billing Cycle Selector */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Cycle</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`rounded-xl border p-4 text-left transition relative ${billingCycle === 'annual'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                        : 'border-white/10 bg-slate-900/50 text-slate-400 hover:bg-slate-900 hover:border-white/20'
                        }`}
                    >
                      <div className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SAVE 25%
                      </div>
                      <div className="text-sm font-bold text-white">Annually</div>
                      <div className="mt-1 text-xs text-slate-400">{currencySymbol}{annualPrice}/mo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`rounded-xl border p-4 text-left transition ${billingCycle === 'monthly'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                        : 'border-white/10 bg-slate-900/50 text-slate-400 hover:bg-slate-900 hover:border-white/20'
                        }`}
                    >
                      <div className="text-sm font-bold text-white">Monthly</div>
                      <div className="mt-1 text-xs text-slate-400">{currencySymbol}{monthlyPrice}/mo</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-200 animate-in fade-in">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Total Summary & Checkout Button */}
              <div className="space-y-4">
                <div className="flex items-end justify-between px-2">
                  <span className="text-sm font-medium text-slate-300">Total Due Today</span>
                  <div className="text-3xl font-extrabold text-white">
                    {currencySymbol}{totalAmount}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:opacity-70 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Initializing Secure Checkout...
                    </>
                  ) : (
                    <>
                      Proceed to Pay
                      <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  Payments securely processed by Razorpay
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
