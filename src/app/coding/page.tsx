"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { Play, Send, CheckCircle2, XCircle, Code, Clock, Terminal } from "lucide-react";

type CodeTemplates = Record<string, { code: string; defaultArg: string }>;

const templates: CodeTemplates = {
  javascript: {
    code: `// Two Sum challenge\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
    defaultArg: "twoSum([2, 7, 11, 15], 9)",
  },
  python: {
    code: `# Two Sum challenge\ndef twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
    defaultArg: "twoSum([2, 7, 11, 15], 9)",
  },
  java: {
    code: `// Two Sum challenge\nimport java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}`,
    defaultArg: "Solution.twoSum([2, 7, 11, 15], 9)",
  },
  sql: {
    code: `-- Two Sum database index queries\nSELECT t1.id AS index1, t2.id AS index2\nFROM numbers t1\nJOIN numbers t2 ON t1.value + t2.value = 9\nWHERE t1.id < t2.id\nLIMIT 1;`,
    defaultArg: "SELECT * FROM numbers;",
  },
};

type TestCase = {
  id: number;
  input: string;
  expected: string;
  status: "pending" | "passed" | "failed";
};

const defaultTestCases: TestCase[] = [
  { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", status: "pending" },
  { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", status: "pending" },
  { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", status: "pending" },
];

export default function CodingRound() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [codeValue, setCodeValue] = useState<string>(templates.javascript.code);
  const [activeTab, setActiveTab] = useState<"description" | "testcases" | "history">("description");
  
  // Execution state
  const [testCases, setTestCases] = useState(defaultTestCases);
  const [running, setRunning] = useState(false);
  const [submissions, setSubmissions] = useState<{ date: string; lang: string; status: string; runtime: string }[]>([
    { date: "2026-07-10", lang: "Python", status: "Accepted", runtime: "48ms" },
    { date: "2026-07-12", lang: "JavaScript", status: "Runtime Error", runtime: "\u2014" },
  ]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (templates[lang]) {
      setCodeValue(templates[lang].code);
    }
  };

  const handleRunCode = () => {
    setRunning(true);
    // Reset test case statuses
    setTestCases(testCases.map(tc => ({ ...tc, status: "pending" })));

    setTimeout(() => {
      // Simple mock logic: if the code contains main keywords, pass the test cases
      const isIncorrect = codeValue.includes("throw") || codeValue.includes("error") || codeValue.length < 50;
      setTestCases(
        testCases.map(tc => ({
          ...tc,
          status: isIncorrect ? "failed" : "passed",
        }))
      );
      setRunning(false);
    }, 1500);
  };

  const handleSubmitCode = () => {
    setRunning(true);
    setTimeout(() => {
      const isIncorrect = codeValue.includes("throw") || codeValue.includes("error") || codeValue.length < 50;
      const statusText = isIncorrect ? "Wrong Answer" : "Accepted";
      const runtimeVal = isIncorrect ? "—" : `${Math.floor(Math.random() * 40) + 15}ms`;
      
      setSubmissions([
        {
          date: new Date().toISOString().split("T")[0],
          lang: selectedLanguage.toUpperCase(),
          status: statusText,
          runtime: runtimeVal,
        },
        ...submissions,
      ]);
      setRunning(false);
      setActiveTab("history");
      alert(statusText === "Accepted" ? "Code verified successfully against all test cases!" : "Submission failed. One or more test cases did not return expected outputs.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 px-6 shrink-0 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-bold tracking-tight text-indigo-500">
            DevLaunch AI
          </Link>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">IDE v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-indigo-400 flex items-center gap-2">
              <span>←</span> Exit Playground
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Workspace split screen */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Section: Description, Test Cases, History */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden bg-slate-950">
          {/* Header tabs */}
          <div className="flex border-b border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 font-bold border-b-2 tracking-wide uppercase transition-colors ${
                activeTab === "description" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => setActiveTab("testcases")}
              className={`px-6 py-4 font-bold border-b-2 tracking-wide uppercase transition-colors ${
                activeTab === "testcases" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 font-bold border-b-2 tracking-wide uppercase transition-colors ${
                activeTab === "history" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Submission History
            </button>
          </div>

          {/* Left Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "description" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-2xs font-semibold uppercase tracking-wider">
                    Easy
                  </span>
                  <h1 className="text-2xl font-black mt-2 text-white">1. Two Sum</h1>
                  
                  {/* Companies asked list */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Asked By:</span>
                    {["Google", "Amazon", "Meta", "Microsoft"].map(comp => (
                      <span key={comp} className="text-3xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-slate-300 text-sm leading-relaxed border-t border-slate-900 pt-4">
                  <p>
                    Given an array of integers <code className="text-indigo-400 font-mono bg-slate-900 px-1 rounded">nums</code> and an integer <code className="text-indigo-400 font-mono bg-slate-900 px-1 rounded">target</code>, return <em>indices of the two numbers such that they add up to <code className="text-indigo-400 font-mono bg-slate-900 px-1 rounded">target</code></em>.
                  </p>
                  <p>
                    You may assume that each input would have <strong><em>exactly one solution</em></strong>, and you may not use the <em>same</em> element twice.
                  </p>
                  <p>You can return the answer in any order.</p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm">Example 1:</h3>
                  <pre className="bg-slate-900/60 rounded-xl p-4 text-xs font-mono text-slate-300 border border-slate-800">
                    <strong>Input:</strong> nums = [2,7,11,15], target = 9{"\n"}
                    <strong>Output:</strong> [0,1]{"\n"}
                    <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
                  </pre>

                  <h3 className="font-bold text-white text-sm">Example 2:</h3>
                  <pre className="bg-slate-900/60 rounded-xl p-4 text-xs font-mono text-slate-300 border border-slate-800">
                    <strong>Input:</strong> nums = [3,2,4], target = 6{"\n"}
                    <strong>Output:</strong> [1,2]
                  </pre>
                </div>

                {/* Constraints */}
                <div className="space-y-2 border-t border-slate-900 pt-4 text-xs text-slate-400">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider">Constraints:</h4>
                  <ul className="list-disc pl-4 space-y-1 font-mono">
                    <li>2 &lt;= nums.length &lt;= 10⁴</li>
                    <li>-10⁹ &lt;= nums[i] &lt;= 10⁹</li>
                    <li>-10⁹ &lt;= target &lt;= 10⁹</li>
                    <li>Only one valid answer exists.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "testcases" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-white">Sample Verification Tests</h2>
                <div className="space-y-4">
                  {testCases.map((tc, idx) => (
                    <div key={tc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400">Test Case #{idx + 1}</span>
                        {tc.status === "passed" && (
                          <span className="flex items-center gap-1 text-2xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Passed
                          </span>
                        )}
                        {tc.status === "failed" && (
                          <span className="flex items-center gap-1 text-2xs font-bold text-rose-400">
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                        {tc.status === "pending" && (
                          <span className="text-2xs font-semibold text-slate-500">Not Evaluated</span>
                        )}
                      </div>
                      <div className="grid gap-2 text-xs font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500">Inputs:</span> {tc.input}
                        </div>
                        <div>
                          <span className="text-slate-500">Expected Output:</span> {tc.expected}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-white">Your Submissions</h2>
                <div className="space-y-3">
                  {submissions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <span
                          className={`font-extrabold ${
                            sub.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {sub.status}
                        </span>
                        <p className="text-slate-500 text-3xs">{sub.date} • {sub.lang}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        {sub.runtime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Code Workspace */}
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-slate-950">
          {/* Language Selector / Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <Code className="h-4 w-4 text-indigo-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 outline-none focus:border-indigo-500 font-mono"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1.5 text-2xs text-slate-500 font-mono">
              <Terminal className="h-3 w-3" />
              <span>Theme: Monokai Dark</span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden relative min-h-[300px]">
            <Editor
              height="100%"
              language={selectedLanguage === "javascript" ? "javascript" : selectedLanguage === "python" ? "python" : selectedLanguage === "java" ? "java" : "sql"}
              value={codeValue}
              onChange={(val) => setCodeValue(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineHeight: 22,
                fontFamily: "var(--font-geist-mono), monospace",
                automaticLayout: true,
              }}
            />
          </div>

          {/* Execution footer actions */}
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
            <Button
              onClick={handleRunCode}
              disabled={running}
              variant="outline"
              className="border-slate-800 text-slate-300 hover:bg-slate-900 flex items-center gap-2 text-xs"
            >
              <Play className="h-3.5 w-3.5 fill-slate-300" />
              {running ? "Executing..." : "Run Code"}
            </Button>

            <Button
              onClick={handleSubmitCode}
              disabled={running}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs shadow-lg shadow-indigo-950/20"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
