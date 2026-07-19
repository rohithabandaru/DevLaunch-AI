"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  Search,
  Bookmark,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

type Question = {
  id: string;
  title: string;
  category: "Coding" | "System Design" | "Behavioral" | "HR";
  difficulty: "Easy" | "Medium" | "Hard";
  companies: string[];
  completed: boolean;
  bookmarked: boolean;
  revision: boolean;
};

const initialQuestions: Question[] = [
  {
    id: "q1",
    title: "Two Sum",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Meta", "Microsoft"],
    completed: true,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q2",
    title: "Design a Scalable Chat Application",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Meta", "Netflix", "Google"],
    completed: false,
    bookmarked: true,
    revision: true,
  },
  {
    id: "q3",
    title: "Explain a time you faced team conflicts.",
    category: "Behavioral",
    difficulty: "Easy",
    companies: ["Microsoft", "TCS", "Accenture", "Google"],
    completed: true,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q4",
    title: "LRU Cache Implementation",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Netflix"],
    completed: false,
    bookmarked: true,
    revision: false,
  },
  {
    id: "q5",
    title: "What are your core strengths and weaknesses?",
    category: "HR",
    difficulty: "Easy",
    companies: ["Infosys", "TCS", "Accenture", "Microsoft"],
    completed: true,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q6",
    title: "Design a URL Shortening Service (TinyURL)",
    category: "System Design",
    difficulty: "Medium",
    companies: ["Amazon", "Microsoft", "Google"],
    completed: false,
    bookmarked: false,
    revision: true,
  },
  {
    id: "q7",
    title: "Binary Tree Maximum Path Sum",
    category: "Coding",
    difficulty: "Hard",
    companies: ["Meta", "Google", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q8",
    title: "Explain Event Delegation in JS.",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Amazon", "Meta", "Accenture"],
    completed: true,
    bookmarked: false,
    revision: false,
  },
    // ===== ADD THESE AFTER LINE 106, BEFORE THE ]; =====

  // ---------- MORE CODING QUESTIONS ----------
  {
    id: "q9",
    title: "Valid Parentheses",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Meta", "Bloomberg"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q10",
    title: "Reverse Linked List",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Microsoft", "Amazon", "Apple"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q11",
    title: "Maximum Subarray (Kadane's Algorithm)",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Google", "Amazon", "Meta", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q12",
    title: "Merge Two Sorted Lists",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Amazon", "Microsoft", "Apple", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q13",
    title: "Climbing Stairs",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Adobe"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q14",
    title: "Longest Substring Without Repeating Characters",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Bloomberg", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q15",
    title: "Container With Most Water",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q16",
    title: "3Sum",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Meta", "Amazon", "Google", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q17",
    title: "Group Anagrams",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Meta", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q18",
    title: "Number of Islands",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q19",
    title: "Coin Change",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Apple"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q20",
    title: "Trapping Rain Water",
    category: "Coding",
    difficulty: "Hard",
    companies: ["Google", "Amazon", "Meta", "Goldman Sachs"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q21",
    title: "Word Search",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q22",
    title: "Product of Array Except Self",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Meta", "Apple", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q23",
    title: "Merge Intervals",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Google", "Meta", "Amazon", "Bloomberg"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q24",
    title: "Search in Rotated Sorted Array",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Meta", "Amazon", "Microsoft", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q25",
    title: "Min Stack",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Bloomberg"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q26",
    title: "House Robber",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Google", "Amazon", "Cisco"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q27",
    title: "Decode Ways",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Meta", "Google", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q28",
    title: "Palindrome Linked List",
    category: "Coding",
    difficulty: "Easy",
    companies: ["Amazon", "Microsoft", "Meta"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q29",
    title: "Spiral Matrix",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Microsoft", "Apple"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q30",
    title: "Rotate Image",
    category: "Coding",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Apple"],
    completed: false,
    bookmarked: false,
    revision: false,
  },

  // ---------- MORE SYSTEM DESIGN QUESTIONS ----------
  {
    id: "q31",
    title: "Design a Rate Limiter",
    category: "System Design",
    difficulty: "Medium",
    companies: ["Google", "Amazon", "Stripe"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q32",
    title: "Design Twitter / News Feed",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Meta", "Twitter", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q33",
    title: "Design an E-Commerce Platform",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Amazon", "Flipkart", "Walmart"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q34",
    title: "Design a Video Streaming Service (Netflix)",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Netflix", "Amazon", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q35",
    title: "Design a Payment Gateway",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Stripe", "Razorpay", "PayPal", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q36",
    title: "Design a Notification System",
    category: "System Design",
    difficulty: "Medium",
    companies: ["Amazon", "Meta", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q37",
    title: "Design Search Autocomplete System",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Google", "Microsoft", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q38",
    title: "Design Google Drive / File Storage",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Google", "Dropbox", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q39",
    title: "Design Uber / Ride-Sharing Platform",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Uber", "Ola", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q40",
    title: "Design Instagram Stories",
    category: "System Design",
    difficulty: "Medium",
    companies: ["Meta", "Google", "Snapchat"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q41",
    title: "Design Real-Time Collaboration (Google Docs)",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Google", "Microsoft", "Notion"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q42",
    title: "Design a CDN (Content Delivery Network)",
    category: "System Design",
    difficulty: "Hard",
    companies: ["Cloudflare", "Amazon", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q43",
    title: "Design a CI/CD Pipeline",
    category: "System Design",
    difficulty: "Medium",
    companies: ["Google", "Microsoft", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },

  // ---------- MORE BEHAVIORAL QUESTIONS ----------
  {
    id: "q44",
    title: "Describe a time you showed leadership.",
    category: "Behavioral",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q45",
    title: "Tell me about a project that failed. What did you learn?",
    category: "Behavioral",
    difficulty: "Medium",
    companies: ["Google", "Meta", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q46",
    title: "How do you manage your time and prioritize tasks?",
    category: "Behavioral",
    difficulty: "Easy",
    companies: ["Microsoft", "TCS", "Infosys", "Accenture"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q47",
    title: "Describe when you mentored or helped a teammate.",
    category: "Behavioral",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Meta"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q48",
    title: "Tell me about a time you disagreed with your manager.",
    category: "Behavioral",
    difficulty: "Hard",
    companies: ["Amazon", "Google", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q49",
    title: "How do you handle working under pressure?",
    category: "Behavioral",
    difficulty: "Easy",
    companies: ["TCS", "Infosys", "Accenture", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q50",
    title: "Describe an innovative solution you implemented.",
    category: "Behavioral",
    difficulty: "Medium",
    companies: ["Google", "Meta", "Apple"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q51",
    title: "Tell me about cross-team collaboration experience.",
    category: "Behavioral",
    difficulty: "Medium",
    companies: ["Microsoft", "Amazon", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q52",
    title: "Describe a time you took ownership beyond your role.",
    category: "Behavioral",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Netflix"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q53",
    title: "How do you adapt to sudden changes in requirements?",
    category: "Behavioral",
    difficulty: "Easy",
    companies: ["TCS", "Accenture", "Microsoft", "Google"],
    completed: false,
    bookmarked: false,
    revision: false,
  },

  // ---------- MORE HR QUESTIONS ----------
  {
    id: "q54",
    title: "Why do you want to work at this company?",
    category: "HR",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Microsoft", "Meta", "TCS"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q55",
    title: "Where do you see yourself in 5 years?",
    category: "HR",
    difficulty: "Easy",
    companies: ["Infosys", "TCS", "Accenture", "Microsoft"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q56",
    title: "What are your salary expectations?",
    category: "HR",
    difficulty: "Medium",
    companies: ["TCS", "Infosys", "Wipro", "Accenture"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q57",
    title: "Are you comfortable with remote or hybrid work?",
    category: "HR",
    difficulty: "Easy",
    companies: ["Google", "Microsoft", "Amazon", "Meta"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q58",
    title: "Why are you switching from your current company?",
    category: "HR",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "TCS", "Infosys"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q59",
    title: "How do you maintain work-life balance?",
    category: "HR",
    difficulty: "Easy",
    companies: ["Google", "Microsoft", "Meta"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q60",
    title: "Describe your ideal team and work environment.",
    category: "HR",
    difficulty: "Easy",
    companies: ["Google", "Amazon", "Microsoft", "Accenture"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q61",
    title: "Explain the gap in your resume.",
    category: "HR",
    difficulty: "Medium",
    companies: ["TCS", "Infosys", "Amazon"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
  {
    id: "q62",
    title: "Why should we hire you over other candidates?",
    category: "HR",
    difficulty: "Medium",
    companies: ["Amazon", "Google", "Microsoft", "Meta", "TCS"],
    completed: false,
    bookmarked: false,
    revision: false,
  },
];

const companiesList = ["All", "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Apple", "Bloomberg", "Stripe", "Uber", "Adobe", "Goldman Sachs", "Flipkart", "Walmart", "Infosys", "TCS", "Accenture", "Wipro"];
export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [filterRevision, setFilterRevision] = useState(false);

  const toggleComplete = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, completed: !q.completed } : q))
    );
  };

  const toggleBookmark = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, bookmarked: !q.bookmarked } : q))
    );
  };

  const toggleRevision = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, revision: !q.revision } : q))
    );
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    const matchesCompany = selectedCompany === "All" || q.companies.includes(selectedCompany);
    const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
    const matchesBookmark = !filterBookmarked || q.bookmarked;
    const matchesRevision = !filterRevision || q.revision;
    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesCompany &&
      matchesCategory &&
      matchesBookmark &&
      matchesRevision
    );
  });

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
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/questionbank" className="text-sm font-semibold text-indigo-600">
              Question Bank
            </Link>
            <Link href="/reports" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Performance Reports
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Explore</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Company-Wise Question Bank
          </h1>
          <p className="mt-2 text-slate-600">
            Browse real developer questions asked at top companies. Filter by difficulty, category, or profile.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Top search & dropdown filters */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category selection */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white text-sm transition-colors focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Coding">Coding Challenges</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="HR">HR / Fit</option>
              </select>
            </div>

            {/* Difficulty selection */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white text-sm transition-colors focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Company selection */}
            <div>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white text-sm transition-colors focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Companies</option>
                {companiesList.slice(1).map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick status checkboxes */}
          <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
              <input
                type="checkbox"
                checked={filterBookmarked}
                onChange={(e) => setFilterBookmarked(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Bookmarked Only
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
              <input
                type="checkbox"
                checked={filterRevision}
                onChange={(e) => setFilterRevision(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Revision List
            </label>
            <div className="ml-auto text-2xs text-slate-400 font-medium">
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>
          </div>
        </div>

        {/* Questions Grid Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">Status</th>
                  <th className="px-6 py-4">Question Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Asked by Companies</th>
                  <th className="px-6 py-4 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* completed checkbox column */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleComplete(q.id)}
                          className={`focus:outline-none p-1 rounded-full ${
                            q.completed ? "text-emerald-500" : "text-slate-300 hover:text-slate-400"
                          }`}
                          title={q.completed ? "Mark Uncompleted" : "Mark Completed"}
                        >
                          <CheckCircle className="h-5 w-5 fill-current bg-white" />
                        </button>
                      </td>

                      {/* Title & Bookmark */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(q.id)}
                            className={`focus:outline-none ${
                              q.bookmarked ? "text-amber-500" : "text-slate-300 hover:text-slate-400"
                            }`}
                            title={q.bookmarked ? "Unbookmark" : "Bookmark"}
                          >
                            <Bookmark className={`h-4.5 w-4.5 ${q.bookmarked ? "fill-current" : ""}`} />
                          </button>
                          <span className="font-extrabold text-slate-900 leading-snug">{q.title}</span>
                          
                          {/* revision badge */}
                          {q.revision && (
                            <span
                              onClick={() => toggleRevision(q.id)}
                              className="cursor-pointer inline-flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-3xs font-bold uppercase tracking-wider"
                              title="Click to remove from revision"
                            >
                              <RefreshCw className="h-2 w-2" /> Revise
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {q.category}
                      </td>

                      {/* Difficulty */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-2xs font-extrabold uppercase tracking-wider ${
                            q.difficulty === "Easy"
                              ? "bg-emerald-50 text-emerald-600"
                              : q.difficulty === "Medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>

                      {/* Company Tags */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {q.companies.map((comp) => (
                            <span
                              key={comp}
                              className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-3xs font-semibold"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Solve Link Actions */}
                      <td className="px-6 py-4 text-center">
                        <Link href={q.category === "Coding" ? "/coding" : "/aiinterview"}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 mx-auto"
                          >
                            Solve <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                      <HelpCircle className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="mt-4 font-bold">No questions found matching selected filter criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting the difficulty or search filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
