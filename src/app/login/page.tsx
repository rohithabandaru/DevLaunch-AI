import { AuthShell } from '@/components/auth/auth-shell';

export const metadata = {
  title: 'Login — DevLaunch AI',
  description: 'Sign in to your DevLaunch AI dashboard to build resumes, portfolios, and more.',
};

export default function LoginPage() {
  return <AuthShell initialMode="login" />;
}
