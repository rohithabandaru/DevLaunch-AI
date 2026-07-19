import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — DevLaunch AI",
  description: "Terms of service for the DevLaunch AI platform.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: July 14, 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing or using DevLaunch AI (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree to
              these terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. Description of Service
            </h2>
            <p className="mt-3">
              DevLaunch AI is a career management platform that provides tools
              for building resumes, creating portfolios, tracking job
              applications, preparing for interviews, and leveraging AI-powered
              career assistance. The Service is offered in a free tier and a paid
              &quot;Pro&quot; tier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. User Accounts
            </h2>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>
                You must provide accurate and complete information when creating
                an account.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                You must be at least 16 years old to use the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Pro Subscription & Payments
            </h2>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>
                Pro subscriptions are billed monthly (₹499/month) or yearly
                (₹4999/year) via Stripe.
              </li>
              <li>
                Subscriptions auto-renew unless cancelled before the end of the
                billing period.
              </li>
              <li>
                You may cancel your subscription at any time. Access to Pro
                features will continue until the end of the current billing
                period.
              </li>
              <li>
                We reserve the right to change pricing with at least 30 days
                notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Refund Policy
            </h2>
            <p className="mt-3">
              If you are unsatisfied with the Pro subscription, you may request a
              full refund within 7 days of your initial purchase. After 7 days,
              refunds are not available, but you may cancel future renewals at
              any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>Use the Service for any unlawful or fraudulent purpose.</li>
              <li>
                Attempt to gain unauthorized access to any part of the Service.
              </li>
              <li>
                Upload malicious content, viruses, or harmful code.
              </li>
              <li>
                Resell, redistribute, or sublicense access to the Service.
              </li>
              <li>
                Abuse the AI features by submitting excessive or automated
                requests.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Intellectual Property
            </h2>
            <p className="mt-3">
              All content you create using DevLaunch AI (resumes, cover letters,
              portfolios) belongs to you. DevLaunch AI retains ownership of the
              platform, its design, code, and branding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              8. Limitation of Liability
            </h2>
            <p className="mt-3">
              DevLaunch AI is provided &quot;as is&quot; without warranties of
              any kind. We are not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service. Our
              total liability shall not exceed the amount you have paid us in the
              12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              9. Termination
            </h2>
            <p className="mt-3">
              We reserve the right to suspend or terminate your account if you
              violate these Terms. Upon termination, your right to use the
              Service will immediately cease. You may request export of your data
              before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              10. Changes to These Terms
            </h2>
            <p className="mt-3">
              We may update these Terms from time to time. We will notify
              registered users of significant changes via email. Continued use
              of the Service after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              11. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about these Terms of Service, please
              contact us at{" "}
              <a
                href="mailto:support@devlaunch.ai"
                className="text-indigo-600 hover:underline"
              >
                support@devlaunch.ai
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
