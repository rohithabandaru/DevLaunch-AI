import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevLaunch AI — Build Resumes, Portfolios & Ace Interviews",
  description:
    "Build ATS-friendly resumes, generate stunning portfolios, track job applications, and practice interviews with AI — all in one platform.",
  keywords: [
    "resume builder",
    "job tracker",
    "AI interview",
    "portfolio builder",
    "ATS resume",
    "career tools",
  ],
  authors: [{ name: "DevLaunch AI" }],
  openGraph: {
    title: "DevLaunch AI — Build Resumes, Portfolios & Ace Interviews",
    description:
      "Build ATS-friendly resumes, generate stunning portfolios, track job applications, and practice interviews with AI.",
    url: "https://devlaunch.ai",
    siteName: "DevLaunch AI",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevLaunch AI — Build Resumes, Portfolios & Ace Interviews",
    description:
      "Build ATS-friendly resumes, generate stunning portfolios, track job applications, and practice interviews with AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
