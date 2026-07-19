import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DevLaunch AI",
  description: "Privacy policy for DevLaunch AI platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: July 14, 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              When you create an account on DevLaunch AI, we collect the
              following information:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>
                <strong>Account Information:</strong> Your name, email address,
                and password (stored securely via Supabase Auth).
              </li>
              <li>
                <strong>Profile Data:</strong> Job preferences, target role, and
                experience level you provide.
              </li>
              <li>
                <strong>Usage Data:</strong> Job applications, interview details,
                documents, and notes you enter into the platform.
              </li>
              <li>
                <strong>Payment Data:</strong> If you subscribe to a Pro plan,
                payment is processed securely by Stripe. We do not store your
                credit card information directly.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              2. How We Use Your Information
            </h2>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>To provide and maintain the DevLaunch AI platform.</li>
              <li>
                To personalize your experience (e.g., AI resume suggestions,
                interview prep).
              </li>
              <li>To process payments and manage your subscription.</li>
              <li>
                To communicate important updates about the platform via email.
              </li>
              <li>To improve our services based on aggregated, anonymized usage data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              3. Data Storage & Security
            </h2>
            <p className="mt-3">
              Your data is stored securely in Supabase (powered by PostgreSQL)
              with Row Level Security (RLS) enabled. This means only you can
              access your own data. All connections are encrypted with TLS/SSL.
              Payment processing is handled entirely by Stripe, a PCI DSS Level
              1 certified provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              4. Third-Party Services
            </h2>
            <p className="mt-3">We use the following third-party services:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>
                <strong>Supabase:</strong> Authentication and database hosting.
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing.
              </li>
              <li>
                <strong>OpenAI:</strong> AI-powered features (resume analysis,
                cover letter generation, interview prep). Your data sent to
                OpenAI is not used to train their models.
              </li>
              <li>
                <strong>Vercel:</strong> Application hosting and deployment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              5. Your Rights
            </h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-slate-600">
              <li>Access and download your personal data at any time.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Update or correct your personal information.</li>
              <li>Cancel your subscription at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              6. Cookies
            </h2>
            <p className="mt-3">
              DevLaunch AI uses essential cookies only, required for
              authentication and session management. We do not use tracking or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">
              7. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, please
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
