import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = {
  title: 'Sign Up — DevLaunch AI',
  description: 'Create a free DevLaunch AI account to build ATS-optimized resumes, portfolios, and cover letters.',
};

export default function SignupPage() {
  return <AuthShell initialMode="signup" />;
}
