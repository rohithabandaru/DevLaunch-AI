import Link from "next/link";

export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — gradient brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 lg:flex">
        <Link href="/" className="text-2xl font-bold text-white">
          DevLaunch AI
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Everything You Need To
            <br />
            Land Your Dream Job.
          </h2>
          <p className="mt-4 max-w-md text-indigo-200 leading-relaxed">
            Build ATS-friendly resumes, generate portfolios, track applications,
            and practice interviews with AI.
          </p>
        </div>

        <p className="text-sm text-indigo-300">
          © 2026 DevLaunch AI. All rights reserved.
        </p>
      </div>

      {/* Right Panel — form */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link
            href="/"
            className="mb-8 block text-center text-2xl font-bold text-indigo-600 lg:hidden"
          >
            DevLaunch AI
          </Link>

          <h1 className="mb-8 text-center text-3xl font-bold text-slate-900">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}