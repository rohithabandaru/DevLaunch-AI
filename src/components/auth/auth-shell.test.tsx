import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthShell } from './auth-shell';

const searchParamsMock = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => searchParamsMock(),
}));

const useAuthMock = vi.fn();
vi.mock('@/components/providers/app-provider', () => ({
  useAuth: () => useAuthMock(),
}));

function renderShell(initialMode: 'login' | 'signup' | 'forgot' = 'login') {
  return render(<AuthShell initialMode={initialMode} />);
}

describe('AuthShell', () => {
  beforeEach(() => {
    searchParamsMock.mockReturnValue(new URLSearchParams());
    useAuthMock.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      forgotPassword: vi.fn(),
      verifySignupOtp: vi.fn(),
    });
  });

  // Regression: deriving the URL notice with a setState call during render
  // re-rendered forever, so every page without ?verified/?error showed
  // "Too many re-renders".
  it('renders without looping when there are no URL params', () => {
    expect(() => renderShell()).not.toThrow();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders the signup mode without looping', () => {
    expect(() => renderShell('signup')).not.toThrow();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it('shows the success notice and returns to login when ?verified=true', () => {
    searchParamsMock.mockReturnValue(new URLSearchParams('verified=true'));
    renderShell('signup');
    expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('shows the failure notice when verification failed', () => {
    searchParamsMock.mockReturnValue(new URLSearchParams('error=verification_failed'));
    renderShell('signup');
    expect(screen.getByText(/email verification failed/i)).toBeInTheDocument();
  });
});
