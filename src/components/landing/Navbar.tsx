"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "border-slate-200/80 bg-white/80 backdrop-blur-lg shadow-sm"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span>DevLaunch AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            Pricing
          </a>
          <a
            href="#testimonials"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            Testimonials
          </a>
          <a
            href="#faq"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            FAQ
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 pb-6 pt-4 md:hidden animate-slide-in-right absolute top-16 left-0 right-0 shadow-lg">
          <nav className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600"
            >
              FAQ
            </a>
            <hr className="border-slate-200" />
            <div className="flex gap-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button variant="outline" className="w-full border-slate-300 font-semibold">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}