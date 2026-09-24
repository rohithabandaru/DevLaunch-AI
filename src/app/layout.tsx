import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-provider';
import { FloatingContact } from '@/components/layout/floating-contact';

import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevLaunch AI - Build Your Resume & Portfolio with AI',
  description:
    'Create ATS-friendly resumes, beautiful developer portfolios, and launch your career faster with AI-powered tools.',
  keywords: [
    'AI Resume Builder',
    'Developer Portfolio Generator',
    'ATS Resume Checker',
    'Software Engineer Resume',
    'DevLaunch AI',
  ],
  authors: [{ name: 'DevLaunch AI Team' }],
  openGraph: {
    title: 'DevLaunch AI - Build Your Resume & Portfolio with AI',
    description:
      'Create ATS-friendly resumes, beautiful developer portfolios, and launch your career faster with AI-powered tools.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dev-launch-ai-d7sq.vercel.app',
    siteName: 'DevLaunch AI',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-[#0B1020] text-white antialiased selection:bg-[#6366F1] selection:text-white">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <AppProviders>
          {children}
          <FloatingContact />
        </AppProviders>
      </body>
    </html>
  );
}
