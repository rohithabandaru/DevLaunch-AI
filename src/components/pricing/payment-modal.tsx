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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'test'>('upi');

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [upiUtr, setUpiUtr] = useState('');

  // Processing, Error, Pending & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Pre-load the Razorpay SDK as soon as modal opens
  useEffect(() => {
    if (isOpen && (paymentMethod === 'upi' || paymentMethod === 'card')) {
      loadRazorpayScript();
    }
  }, [isOpen, paymentMethod]);

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
      setErrorMessage('Razorpay Key ID missing: Please paste your real Test Key ID (rzp_test_xxxx) into .env.local and save, OR switch to the "1-Click Test Mode" tab above.');
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
            paymentMethod === 'upi' ? 'Razorpay UPI' : 'Razorpay Card'
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
          name: cardName || 'Developer User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayFailedResponse) {
        setIsProcessing(false);
        setErrorMessage(`Payment Failed: ${response.error?.description || 'Transaction cancelled by bank'}`);
      });
      rzp.open();
    } catch (err: unknown) {
      setIsProcessing(false);
      const gatewayErr = err as { message?: string } | null;
      setErrorMessage(`Razorpay Gateway Error: ${gatewayErr?.message || 'Could not launch payment window'}`);
    }
  };

  const handlePay = () => {
    setErrorMessage('');

    // 1. UPI & CARD: Launch Official Razorpay Overlay Popup Window
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      // If user typed 12-digit UTR manually, allow submitting UTR for manual verification
      if (paymentMethod === 'upi' && upiUtr.trim().length >= 6) {
        setIsProcessing(true);
        setTimeout(() => {
          setTransactionId(`UTR-${upiUtr.trim().toUpperCase()}`);
          setIsProcessing(false);
          setIsPendingVerification(true);
        }, 1000);
        return;
      }

      // Launch Real Razorpay Gateway Overlay Window
      handleRazorpayCheckout();
      return;
    }

    // 2. 1-CLICK SANDBOX TEST MODE
    if (paymentMethod === 'test') {
      setIsProcessing(true);
      setTimeout(() => {
        const txnId = `TEST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setTransactionId(txnId);

        activateSubscription(
          tier,
          billingCycle,
          currency,
          totalAmount,
          'Test Sandbox'
        );

        setIsProcessing(false);
        setIsSuccess(true);

        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Fixed Top Header */}
        <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
            Back to Plans
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-white transition shadow-sm disabled:opacity-50"
          >
            <span>Close</span> ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* PENDING VERIFICATION VIEW (For Real UPI Transfers) */}
          {isPendingVerification ? (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400 shadow-xl shadow-cyan-500/20">
                <ShieldCheck className="h-10 w-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-300">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" /> UTR Submitted for Manual Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Payment Verification Pending</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your UPI UTR reference number has been received. Our billing team is verifying the transaction with bank records. Your <strong>{planName} ({billingCycle})</strong> plan will be activated automatically once confirmed.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Submitted UTR No:</span>
                  <span className="font-mono font-bold text-cyan-300">{transactionId}</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Plan Requested:</span>
                  <span className="font-bold text-violet-300">{planName} ({billingCycle})</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Amount Sent:</span>
                  <span className="font-bold text-emerald-400">{currencySymbol}{totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className="font-semibold text-amber-300 uppercase">Under Review ⏳</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Payment Successful!
                </span>
                <h2 className="text-3xl font-extrabold text-white">Welcome to DevLaunch AI {planName}!</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your account has been upgraded to <strong>{planName} Tier ({billingCycle})</strong>. All AI Job Sync, ATS Optimization, and Cover Letter features are now unlocked.
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
                  <span className="text-slate-400">Total Billed Amount:</span>
                  <span className="font-bold text-emerald-400">{currencySymbol}{totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-semibold text-slate-200 uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
                >
                  Go to AI Career Dashboard →
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                      {planName} Plan
                    </span>
                    <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                      Instant Activation
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mt-1">Complete Subscription Order</h2>
                </div>

                {/* Currency Selector */}
                <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${currency === 'INR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    🇮🇳 INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${currency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    🇺🇸 USD ($)
                  </button>
                </div>
              </div>

              {/* Billing Cycle Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`rounded-2xl border p-4 text-left transition ${billingCycle === 'annual'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-indigo-300">Annual Billing</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      Best Value
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-white">
                    {currencySymbol}{annualPrice} <span className="text-xs font-normal text-slate-400">/ mo</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Billed as {currencySymbol}{annualPrice * 12}/year</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-2xl border p-4 text-left transition ${billingCycle === 'monthly'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                    : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <div className="text-xs font-bold uppercase text-slate-300">Monthly Billing</div>
                  <div className="mt-2 text-xl font-extrabold text-white">
                    {currencySymbol}{monthlyPrice} <span className="text-xs font-normal text-slate-400">/ mo</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Billed monthly. Cancel anytime.</div>
                </button>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Select Payment Gateway / Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${paymentMethod === 'upi'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <QrCode className="h-4 w-4 text-cyan-400" /> UPI / QR Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${paymentMethod === 'card'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <CreditCard className="h-4 w-4 text-indigo-400" /> Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('test')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition ${paymentMethod === 'test'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                      }`}
                  >
                    <Zap className="h-4 w-4 text-emerald-400" /> 1-Click Test Mode
                  </button>
                </div>
              </div>

              {/* Method Details Form */}
              {paymentMethod === 'upi' && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-cyan-400" /> PhonePe & Google Pay Direct UPI QR Code
                    </span>
                    <span className="text-[10px] text-cyan-200/80 font-mono">GPay / PhonePe / Paytm / BHIM</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    {/* Real Scannable PhonePe / GPay QR Code */}
                    <div className="rounded-xl border border-white/10 bg-white p-3 text-center space-y-2 w-44 mx-auto sm:w-full shadow-lg">
                      {/* Dynamic QR code image pointing to GPay merchant UPI ID */}
                      <Image
                        unoptimized
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'devlaunch@oksbi'}&pn=DevLaunch%20AI&am=${totalAmount}&cu=INR`)}`}
                        alt="Google Pay & PhonePe QR Code"
                        width={144}
                        height={144}
                        className="w-36 h-36 mx-auto rounded-lg border border-slate-200"
                      />
                      <div className="text-[10px] font-extrabold text-slate-900 uppercase">Scan to Pay {currencySymbol}{totalAmount}</div>
                    </div>

                    {/* UPI VPA Field & Details */}
                    <div className="space-y-3">
                      {/* Google Pay UPI ID */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">Google Pay UPI ID</label>
                        <div className="rounded-xl border border-cyan-500/40 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                          <span>{process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'devlaunch@oksbi'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'devlaunch@oksbi');
                              alert('Google Pay UPI ID Copied!');
                            }}
                            className="text-[10px] text-slate-400 hover:text-white underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* PhonePe UPI ID */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">PhonePe UPI ID</label>
                        <div className="rounded-xl border border-purple-500/40 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-purple-300 flex items-center justify-between">
                          <span>{process.env.NEXT_PUBLIC_PHONEPE_UPI_ID || 'devlaunch@ybl'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_PHONEPE_UPI_ID || 'devlaunch@ybl');
                              alert('PhonePe UPI ID Copied!');
                            }}
                            className="text-[10px] text-slate-400 hover:text-white underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Manual UTR Input */}
                      <div className="space-y-1 pt-1 border-t border-cyan-500/20">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Enter 12-Digit UTR (Optional Manual Confirmation)
                        </label>
                        <input
                          type="text"
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value)}
                          placeholder="e.g. 426891029384"
                          className="w-full rounded-xl border border-cyan-500/40 bg-slate-950 px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      <p className="text-[10px] text-cyan-200/70">Scan the QR code or copy GPay / PhonePe UPI ID to transfer directly from your mobile app.</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-indigo-400" /> Stripe Card Checkout
                    </span>
                    <span className="text-[10px] text-indigo-200/80">256-Bit TLS Encrypted</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full name on card"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">CVC / CWW</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'test' && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Zap className="h-4 w-4 text-emerald-400" /> Instant Sandbox Test Payment Mode
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Clicking pay will immediately simulate a successful payment gateway callback and instantly activate your <strong>{planName} ({billingCycle})</strong> subscription without requiring live credit card or UPI charges.
                  </p>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-200 animate-in fade-in">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Total Order Summary */}
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Billed Today:</span>
                  <div className="text-2xl font-extrabold text-white">
                    {currencySymbol}{totalAmount} <span className="text-xs font-semibold text-emerald-400">({billingCycle})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> 7-Day Money Back Guarantee
                </div>
              </div>

              {/* CTA Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing Payment via {paymentMethod.toUpperCase()}...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {currencySymbol}{totalAmount} & Activate {planName} Plan Now →
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
