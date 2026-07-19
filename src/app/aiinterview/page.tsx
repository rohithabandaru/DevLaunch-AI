"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bot,
  CheckCircle,
  ArrowRight,
  Mic,
  MicOff,
  FileText,
  Upload,
  AlertTriangle,
  Award,
} from "lucide-react";

type Question = {
  id: string;
  category: string;
  questionText: string;
  suggestedStrongPoints: string;
  suggestedImprovements: string;
  starEvaluation: string;
  grammarCorrection?: { original: string; corrected: string };
  fillersCount: number;
  confidenceScore: number;
  score: number;
};

const mockQuestions: Record<string, Question[]> = {
  Technical: [
    {
      id: "t1",
      category: "Technical",
      questionText: "What is the difference between Virtual DOM and Shadow DOM?",
      suggestedStrongPoints: "Accurately distinguished Virtual DOM as a React reconciliation concept and Shadow DOM as a native web component encapsulation tool.",
      suggestedImprovements: "Give an example of how styling isolation works inside the Shadow DOM boundary.",
      starEvaluation: "Situation: Discussed rendering performance. Task: Explain React vs Web standards. Action: Described how both optimize/isolate. Result: Cleared up common confusion.",
      grammarCorrection: { original: "React use virtual dom for speed up rendering", corrected: "React uses the Virtual DOM to speed up rendering." },
      fillersCount: 2,
      confidenceScore: 85,
      score: 8,
    },
    {
      id: "t2",
      category: "Technical",
      questionText: "How does React\u2019s useEffect hook dependency array work under the hood?",
      suggestedStrongPoints: "Nicely explained shallow comparisons (Object.is) and triggers on render loops.",
      suggestedImprovements: "Explain how closure values can become stale when missing from the dependency array.",
      starEvaluation: "Situation: Managing component side-effects. Task: Sync variables correctly. Action: Explained the shallow comparisons trigger. Result: Described prevention of stale states.",
      grammarCorrection: { original: "It trigger when array values has changes", corrected: "It triggers when array values have changed." },
      fillersCount: 1,
      confidenceScore: 90,
      score: 9,
    },
    {
      id: "t3",
      category: "Technical",
      questionText: "Explain the event loop in JavaScript and how it handles asynchronous operations.",
      suggestedStrongPoints: "Clearly described the call stack, task queue, microtask queue, and the role of the event loop in non-blocking I/O.",
      suggestedImprovements: "Mention how requestAnimationFrame fits into the event loop cycle and how it differs from setTimeout.",
      starEvaluation: "Situation: Debugging async race conditions. Task: Explain JS concurrency model. Action: Walked through call stack, Web APIs, and queue priorities. Result: Demonstrated deep runtime understanding.",
      grammarCorrection: { original: "The event loop check if call stack is empty then run callbacks", corrected: "The event loop checks if the call stack is empty, then runs the callbacks." },
      fillersCount: 3,
      confidenceScore: 82,
      score: 8,
    },
    {
      id: "t4",
      category: "Technical",
      questionText: "What are closures in JavaScript? Can you provide a practical use case?",
      suggestedStrongPoints: "Explained lexical scoping clearly and gave a real-world example with data privacy patterns.",
      suggestedImprovements: "Discuss memory leak risks when closures unintentionally retain large objects.",
      starEvaluation: "Situation: Building a counter module. Task: Encapsulate internal state. Action: Used IIFE with closure to expose only increment/decrement. Result: Achieved data privacy without classes.",
      grammarCorrection: { original: "Closure is when function remember its outer scope variables", corrected: "A closure is when a function remembers its outer scope variables." },
      fillersCount: 1,
      confidenceScore: 91,
      score: 9,
    },
    {
      id: "t5",
      category: "Technical",
      questionText: "Compare REST and GraphQL. When would you choose one over the other?",
      suggestedStrongPoints: "Highlighted over-fetching/under-fetching trade-offs and explained how GraphQL resolvers work.",
      suggestedImprovements: "Mention caching strategies (HTTP caching for REST vs Apollo cache for GraphQL) and N+1 query concerns.",
      starEvaluation: "Situation: Designing a mobile-first API. Task: Minimize payload for slow networks. Action: Proposed GraphQL for flexible queries. Result: Reduced API calls by 40%.",
      grammarCorrection: { original: "REST is more simpler but GraphQL give more flexibility", corrected: "REST is simpler, but GraphQL gives more flexibility." },
      fillersCount: 2,
      confidenceScore: 87,
      score: 8,
    },
  ],
  Behavioral: [
    {
      id: "b1",
      category: "Behavioral",
      questionText: "Tell me about a time when you had a conflict with a team member and how you resolved it.",
      suggestedStrongPoints: "Shared a specific scenario, described active listening, and focused on team-centric project milestones.",
      suggestedImprovements: "Add quantitative outcomes, such as how resolving this quickly saved deployment timelines.",
      starEvaluation: "Situation: Disagreed on architecture deadlines. Task: Align tech stacks. Action: Hosted feedback session and compromised on features. Result: Delivered on schedule.",
      grammarCorrection: { original: "We was not agreeing on same features", corrected: "We did not agree on the same features." },
      fillersCount: 4,
      confidenceScore: 78,
      score: 8,
    },
    {
      id: "b2",
      category: "Behavioral",
      questionText: "Describe a situation where you had to learn a new technology quickly to deliver a project.",
      suggestedStrongPoints: "Demonstrated resourcefulness by outlining a structured learning plan with documentation, tutorials, and pair programming.",
      suggestedImprovements: "Quantify how quickly you ramped up and the impact on the project timeline.",
      starEvaluation: "Situation: New project required Kubernetes expertise. Task: Deploy microservices within 2 weeks. Action: Took online crash course, paired with DevOps lead, built staging cluster. Result: Deployed on time with zero rollback.",
      grammarCorrection: { original: "I was needing to learn Kubernetes very fast for the project", corrected: "I needed to learn Kubernetes very quickly for the project." },
      fillersCount: 3,
      confidenceScore: 80,
      score: 8,
    },
    {
      id: "b3",
      category: "Behavioral",
      questionText: "Tell me about a time you failed at something. What did you learn from it?",
      suggestedStrongPoints: "Showed genuine self-reflection and clearly articulated the lesson learned and changes made afterward.",
      suggestedImprovements: "Emphasize the systemic changes you introduced to prevent recurrence, not just personal takeaways.",
      starEvaluation: "Situation: Pushed a breaking change to production. Task: Fix and prevent recurrence. Action: Implemented mandatory PR reviews and added CI gate tests. Result: Zero production incidents for the next 6 months.",
      grammarCorrection: { original: "I have learned that testing is very much important", corrected: "I learned that testing is extremely important." },
      fillersCount: 5,
      confidenceScore: 72,
      score: 7,
    },
    {
      id: "b4",
      category: "Behavioral",
      questionText: "Give an example of when you took initiative beyond your assigned responsibilities.",
      suggestedStrongPoints: "Clearly described proactive behavior and its positive impact on team productivity.",
      suggestedImprovements: "Connect the initiative back to measurable business outcomes like revenue or time saved.",
      starEvaluation: "Situation: Noticed repetitive manual QA process. Task: Reduce testing bottleneck. Action: Built a Cypress E2E test suite on weekends. Result: Cut QA cycle from 3 days to 4 hours.",
      fillersCount: 2,
      confidenceScore: 85,
      score: 9,
    },
    {
      id: "b5",
      category: "Behavioral",
      questionText: "Describe a time when you had to manage competing priorities under a tight deadline.",
      suggestedStrongPoints: "Demonstrated clear prioritization frameworks (urgency vs. importance) and effective stakeholder communication.",
      suggestedImprovements: "Mention how you delegated tasks and kept stakeholders informed throughout the process.",
      starEvaluation: "Situation: Two critical features due same sprint. Task: Deliver both without quality loss. Action: Broke tasks into smaller slices, parallelized work, and communicated trade-offs to PM. Result: Both shipped with 95% test coverage.",
      grammarCorrection: { original: "I was having too much tasks at same time", corrected: "I had too many tasks at the same time." },
      fillersCount: 3,
      confidenceScore: 81,
      score: 8,
    },
  ],
  HR: [
    {
      id: "h1",
      category: "HR",
      questionText: "Why do you want to join this company, and where do you see yourself in five years?",
      suggestedStrongPoints: "Aligned company mission with personal growth goals and demonstrated clear long-term career drive.",
      suggestedImprovements: "Research specific recent projects of the company and mention how you would fit into those team scopes.",
      starEvaluation: "Situation: Explaining professional aspirations. Task: Align personal skills with business goals. Action: Expressed interest in technical leadership. Result: Outlined clear progression pathway.",
      fillersCount: 3,
      confidenceScore: 82,
      score: 8,
    },
    {
      id: "h2",
      category: "HR",
      questionText: "What is your greatest strength and how has it helped you professionally?",
      suggestedStrongPoints: "Gave a specific, evidence-backed strength rather than a generic answer.",
      suggestedImprovements: "Tie the strength directly to a measurable outcome at a previous role.",
      starEvaluation: "Situation: Leading a frontend migration. Task: Demonstrate technical leadership. Action: Leveraged deep React expertise to mentor 3 juniors. Result: Migration completed 2 weeks ahead of schedule.",
      fillersCount: 2,
      confidenceScore: 86,
      score: 8,
    },
    {
      id: "h3",
      category: "HR",
      questionText: "How do you handle criticism or negative feedback from your manager?",
      suggestedStrongPoints: "Showed maturity by describing feedback as a growth opportunity rather than a personal attack.",
      suggestedImprovements: "Provide a concrete example of feedback you received and the specific behavioral change that resulted.",
      starEvaluation: "Situation: Manager flagged code review thoroughness. Task: Improve review quality. Action: Created a personal checklist and scheduled dedicated review blocks. Result: PR rejection rate dropped by 60%.",
      grammarCorrection: { original: "I always take feedback in positive way and try to improve", corrected: "I always take feedback positively and try to improve." },
      fillersCount: 4,
      confidenceScore: 75,
      score: 7,
    },
    {
      id: "h4",
      category: "HR",
      questionText: "What motivates you to do your best work every day?",
      suggestedStrongPoints: "Connected intrinsic motivation to tangible outputs and team impact.",
      suggestedImprovements: "Avoid generic answers. Tie motivation to the specific role or industry you are interviewing for.",
      starEvaluation: "Situation: Working on a health-tech product. Task: Maintain high engagement. Action: Connected daily code to real patient outcomes. Result: Shipped accessibility features ahead of compliance deadlines.",
      fillersCount: 1,
      confidenceScore: 88,
      score: 9,
    },
    {
      id: "h5",
      category: "HR",
      questionText: "Describe your ideal work environment and team culture.",
      suggestedStrongPoints: "Described a collaborative, feedback-driven culture and connected it to personal productivity.",
      suggestedImprovements: "Mention how you contribute to building that culture, not just what you expect from it.",
      starEvaluation: "Situation: Joining a new startup. Task: Adapt to fast-moving culture. Action: Initiated weekly knowledge-sharing sessions and async standups. Result: Team velocity increased by 25%.",
      fillersCount: 2,
      confidenceScore: 84,
      score: 8,
    },
  ],
  "System Design": [
    {
      id: "s1",
      category: "System Design",
      questionText: "How would you design a scalable notification system?",
      suggestedStrongPoints: "Laid out message queues (Kafka), database replication, and rate limiter gateways well.",
      suggestedImprovements: "Explain retry policies with exponential backoff and handling duplicate message deliveries.",
      starEvaluation: "Situation: Processing millions of alerts. Task: High availability design. Action: Modularized workers and introduced message queuing. Result: System handles spikes without bottlenecking.",
      grammarCorrection: { original: "Using queue make the alerts reliable", corrected: "Using a queue makes the alerts reliable." },
      fillersCount: 2,
      confidenceScore: 88,
      score: 9,
    },
    {
      id: "s2",
      category: "System Design",
      questionText: "Design a URL shortening service like TinyURL.",
      suggestedStrongPoints: "Covered hashing strategies, base62 encoding, database sharding, and read-heavy caching well.",
      suggestedImprovements: "Discuss analytics tracking (click counts, geo-data) and how to handle expired or abusive URLs.",
      starEvaluation: "Situation: Need to handle 100M short URLs. Task: Design for low-latency redirects. Action: Used consistent hashing with Redis cache layer and PostgreSQL for persistence. Result: P99 latency under 10ms.",
      grammarCorrection: { original: "We can use hash function for generate short URL", corrected: "We can use a hash function to generate a short URL." },
      fillersCount: 1,
      confidenceScore: 90,
      score: 9,
    },
    {
      id: "s3",
      category: "System Design",
      questionText: "How would you design a real-time chat application like WhatsApp?",
      suggestedStrongPoints: "Explained WebSocket connections, presence indicators, message queuing, and end-to-end encryption concepts.",
      suggestedImprovements: "Address message ordering guarantees, offline message delivery, and group chat fan-out strategies.",
      starEvaluation: "Situation: Building chat for 10M concurrent users. Task: Real-time delivery with minimal latency. Action: WebSocket gateway with Redis Pub/Sub and Cassandra for message storage. Result: Sub-100ms message delivery.",
      grammarCorrection: { original: "Websocket is better then HTTP for real time chat", corrected: "WebSocket is better than HTTP for real-time chat." },
      fillersCount: 3,
      confidenceScore: 84,
      score: 8,
    },
    {
      id: "s4",
      category: "System Design",
      questionText: "Design a distributed rate limiter for an API gateway.",
      suggestedStrongPoints: "Compared token bucket vs sliding window algorithms and discussed Redis-based distributed counters.",
      suggestedImprovements: "Explain how to handle clock skew across distributed nodes and graceful degradation under extreme load.",
      starEvaluation: "Situation: API abuse causing service degradation. Task: Enforce fair usage limits globally. Action: Implemented sliding window with Redis Lua scripts and fallback local counters. Result: Blocked 99.5% of abusive traffic.",
      fillersCount: 2,
      confidenceScore: 86,
      score: 8,
    },
    {
      id: "s5",
      category: "System Design",
      questionText: "How would you design a content delivery network (CDN)?",
      suggestedStrongPoints: "Explained edge caching, origin pull vs push models, cache invalidation, and DNS-based routing.",
      suggestedImprovements: "Discuss cache consistency strategies, TTL tuning, and handling cache stampedes during invalidation.",
      starEvaluation: "Situation: Global user base with high latency complaints. Task: Reduce TTFB to under 50ms globally. Action: Designed multi-tier cache with edge PoPs, origin shields, and consistent hashing. Result: 70% reduction in origin load.",
      grammarCorrection: { original: "CDN cache the content at edge locations for faster deliver", corrected: "A CDN caches the content at edge locations for faster delivery." },
      fillersCount: 1,
      confidenceScore: 89,
      score: 9,
    },
  ],
};

export default function AIInterviewPage() {
  // Configuration State
  const [selectedCategory, setSelectedCategory] = useState<string>("Technical");
  const [selectedMode, setSelectedMode] = useState<"Text" | "Voice">("Text");
  const [resumeText, setResumeText] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  // Active Session State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    score: number;
    strong: string;
    improve: string;
    star: string;
    grammar?: { original: string; corrected: string };
    fillers: number;
    confidence: number;
  } | null>(null);

  const activeQuestions = mockQuestions[selectedCategory] || [];
  const currentQuestion = activeQuestions[currentQuestionIndex];

  // Simulated Voice Transcript logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        const phrases = [
          "Well, I believe the best approach is to first evaluate constraints...",
          " and then analyze the components before writing code.",
          " In React, this allows the virtual representation to diff changes cleanly.",
        ];
        setUserAnswer((prev) => prev + (phrases[Math.floor(Math.random() * phrases.length)] || ""));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const handleStartInterview = () => {
    if (resumeText.trim()) {
      alert("Resume parsed successfully! Questions have been generated based on your profile.");
    }
    setIsConfigured(true);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setUserAnswer("");
    }
    setIsListening(!isListening);
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      alert("Please enter or record your answer first.");
      return;
    }
    setIsListening(false);
    setSubmitting(true);

    setTimeout(() => {
      setFeedback({
        show: true,
        score: currentQuestion.score,
        strong: currentQuestion.suggestedStrongPoints,
        improve: currentQuestion.suggestedImprovements,
        star: currentQuestion.starEvaluation,
        grammar: currentQuestion.grammarCorrection,
        fillers: currentQuestion.fillersCount,
        confidence: currentQuestion.confidenceScore,
      });
      setSubmitting(false);
    }, 1500);
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer("");
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handleReset = () => {
    setIsConfigured(false);
    setFeedback(null);
    setUserAnswer("");
    setCurrentQuestionIndex(0);
    setResumeText("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-indigo-600 hover:opacity-90 transition-opacity"
          >
            DevLaunch AI
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 flex items-center gap-2">
              <span className="text-lg">←</span> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Mock Simulator</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            AI Interview Coach
          </h1>
          <p className="mt-2 text-slate-600">
            Simulate realistic interviews, practice structures (STAR model), and review grammar feedback.
          </p>
        </div>

        {/* 1. Configuration Panel */}
        {!isConfigured ? (
          <div className="mt-10 grid gap-8 md:grid-cols-12 items-start">
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Configure Session</h2>

              {/* Category selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Interview Profile / Category</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.keys(mockQuestions).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-3 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                        selectedCategory === cat
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Practice Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("Text")}
                    className={`py-4 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedMode === "Text"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <FileText className="h-4 w-4" /> Text Responses
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode("Voice")}
                    className={`py-4 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedMode === "Voice"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Mic className="h-4 w-4" /> Voice Simulation
                  </button>
                </div>
              </div>

              {/* Start Trigger */}
              <Button
                onClick={handleStartInterview}
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 py-6 text-sm font-semibold"
              >
                Launch Simulator
              </Button>
            </div>

            {/* Resume Upload / Right Side */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Upload className="h-4 w-4" /> Resume-Based Questions
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste your developer resume details below, and the AI Interview Coach will generate tailor-made technical and behavioral questions matching your experiences.
              </p>
              <textarea
                placeholder="Paste resume skills, jobs, projects..."
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs transition-colors focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* 2. Active Session Panel */
          <div className="mt-10 grid gap-8 lg:grid-cols-12 items-start">
            {/* Sidebar Controls */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 shrink-0">
              <div className="space-y-1">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Active Profile</span>
                <p className="text-sm font-extrabold text-slate-900">{selectedCategory} Interview</p>
              </div>
              <div className="space-y-1">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Input Mode</span>
                <p className="text-sm font-extrabold text-indigo-600">{selectedMode} Mode</p>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-4">
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
                <p className="text-sm font-extrabold text-slate-700">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full text-slate-600 border-slate-200"
              >
                Quit Simulator
              </Button>
            </div>

            {/* Main Interactive Screen */}
            <div className="lg:col-span-9 space-y-6">
              {/* Interviewer Question Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 animate-fade-in">
                <div className="flex gap-4 items-start">
                  <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl shrink-0">
                    <Bot className="h-6 w-6 animate-float" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1">
                      AI Coach <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="mt-2 text-slate-800 font-extrabold text-lg leading-relaxed">
                      {currentQuestion?.questionText || "Loading questions..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form / Response Workspace */}
              {!feedback ? (
                <div className="space-y-6">
                  {selectedMode === "Text" ? (
                    /* Text input mode */
                    <form onSubmit={handleSubmitAnswer} className="space-y-4 animate-fade-in">
                      <textarea
                        rows={6}
                        placeholder="Write your explanation or STAR-based response..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 p-4 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        disabled={submitting}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={submitting || !userAnswer.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                        >
                          {submitting ? "Analyzing Details..." : "Submit Answer"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Voice simulator mode */
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center space-y-6 animate-fade-in">
                      {isListening ? (
                        <div className="flex items-center gap-1.5 h-10 py-2">
                          <div className="h-6 w-1 bg-indigo-500 rounded animate-pulse" />
                          <div className="h-10 w-1 bg-indigo-600 rounded animate-pulse" />
                          <div className="h-8 w-1 bg-indigo-500 rounded animate-pulse" />
                          <div className="h-4 w-1 bg-indigo-600 rounded animate-pulse" />
                          <div className="h-10 w-1 bg-indigo-600 rounded animate-pulse" />
                          <div className="h-6 w-1 bg-indigo-500 rounded animate-pulse" />
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm font-medium">Click mic below to start recording</div>
                      )}

                      {/* Transcribed text live view */}
                      {userAnswer && (
                        <div className="w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-sm text-slate-600 italic text-center max-w-xl">
                          &ldquo;{userAnswer}&rdquo;
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={handleVoiceToggle}
                          className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                            isListening
                              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                      </div>

                      {isListening && (
                        <Button
                          onClick={handleSubmitAnswer}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Stop & Submit response
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* 3. Deep AI Feedback Section */
                <div className="space-y-6 animate-fade-in">
                  {/* Performance analysis score board */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <h3 className="font-extrabold text-slate-900 text-lg">AI Performance Review</h3>
                      </div>
                      <div className="text-center">
                        <span className="text-4xl font-extrabold text-indigo-600">{feedback.score}</span>
                        <span className="text-slate-400 font-semibold text-sm">/10</span>
                      </div>
                    </div>

                    {/* Scores Radar/Dial mock summary */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Score</span>
                        <p className="text-xl font-black text-indigo-600 mt-1">{feedback.confidence}%</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Filler Words count</span>
                        <p className="text-xl font-black text-indigo-600 mt-1">{feedback.fillers} words</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Evaluation Method</span>
                        <p className="text-sm font-extrabold text-indigo-600 mt-1.5">STAR Framework</p>
                      </div>
                    </div>

                    {/* STAR method analysis */}
                    <div className="border-t border-slate-100 pt-6 space-y-2">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <Award className="h-4 w-4 text-indigo-600" /> STAR Method Evaluation
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{feedback.star}</p>
                    </div>

                    {/* Grammar analysis */}
                    {feedback.grammar && (
                      <div className="border-t border-slate-100 pt-6 space-y-3">
                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> Grammar Check & Corrections
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100">
                            <span className="font-semibold block mb-1">Your response:</span>
                            &ldquo;{feedback.grammar.original}&rdquo;
                          </div>
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100">
                            <span className="font-semibold block mb-1">AI suggestion:</span>
                            &ldquo;{feedback.grammar.corrected}&rdquo;
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pro/Con summary */}
                    <div className="grid gap-6 md:grid-cols-2 border-t border-slate-100 pt-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Strong Points
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{feedback.strong}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" /> Suggested Improvements
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{feedback.improve}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                      <Button variant="outline" onClick={handleReset}>
                        Configure Again
                      </Button>
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                      >
                        Next Question <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
