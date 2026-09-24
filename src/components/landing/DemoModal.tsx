'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, Cpu, ArrowRight } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [demoStep, setDemoStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const runAISimulation = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setDemoStep((prev) => (prev % 3) + 1);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-card border border-indigo-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-left space-y-5 sm:space-y-6 my-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center touch-manipulation z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">DevLaunch AI Interactive Demo</h3>
            <p className="text-xs text-gray-400">Experience how our real-time LLM engine optimizes developer resumes</p>
          </div>
        </div>

        {/* Simulator Frame */}
        <div className="bg-[#0B1020] rounded-2xl border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-300">Live Simulation Mode</span>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
              Step {demoStep} of 3
            </span>
          </div>

          {demoStep === 1 && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">INPUT BULLET POINT</div>
              <div className="p-4 bg-[#1F2937]/80 rounded-xl border border-white/5 text-sm text-gray-300 font-mono">
                &quot;Built frontend interface using React for our company dashboard.&quot;
              </div>
              <div className="flex justify-stretch sm:justify-end">
                <button
                  onClick={runAISimulation}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 touch-manipulation disabled:opacity-80"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-200 shrink-0" />
                      <span className="truncate">Analyzing ATS Keywords...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Run AI Optimization</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {demoStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> AI ENHANCED OUTPUT (98% MATCH SCORE)
              </div>
              <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-sm text-emerald-200 font-sans leading-relaxed">
                &quot;Architected responsive React 19 micro-frontend dashboard serving 150K+ daily active users, improving page load speed by 38% and boosting user engagement.&quot;
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                <span className="text-xs text-gray-400 order-2 sm:order-1">Added: React 19, Micro-frontend, Impact Metrics, Perf boost</span>
                <button
                  onClick={() => setDemoStep(3)}
                  className="w-full sm:w-auto min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 order-1 sm:order-2 touch-manipulation"
                >
                  <span>Preview Portfolio Sync</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {demoStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> 1-CLICK PORTFOLIO GENERATION
              </div>
              <div className="p-5 bg-gradient-to-r from-purple-950/40 to-[#1F2937] rounded-xl border border-purple-500/30 text-xs text-gray-300 space-y-2">
                <div className="font-bold text-white text-sm">Your website is live! 🚀</div>
                <div className="text-indigo-400 font-mono">https://alexdev.devlaunch.app</div>
                <p className="text-gray-400">Includes interactive project filters, dark mode glassmorphism, and live GitHub commit stats.</p>
              </div>
              <div className="flex justify-stretch sm:justify-end pt-2">
                <button
                  onClick={() => setDemoStep(1)}
                  className="w-full sm:w-auto min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 touch-manipulation"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" /> Replay Demo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-white/5">
          <div className="text-xs text-gray-400 text-center sm:text-left">Ready to build your own ATS resume & portfolio?</div>
          <a
            href="#get-started"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center shadow-lg shadow-indigo-500/30 inline-flex items-center justify-center touch-manipulation"
          >
            Start Building Now
          </a>
        </div>
      </div>
    </div>
  );
}
