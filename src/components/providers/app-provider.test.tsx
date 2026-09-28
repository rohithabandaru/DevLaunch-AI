import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AppProviders, useAuth, useTheme } from './app-provider';
import { writeStorage, readStorage } from '@/lib/storage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/authorization', () => ({
  getAuthoritativeRole: vi.fn(),
}));

function AuthProbe() {
  const { user, isAuthenticated } = useAuth();
  return <span data-testid="auth">{isAuthenticated ? (user?.email ?? 'yes') : 'anonymous'}</span>;
}

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} data-testid="theme">
      {theme}
    </button>
  );
}

function renderWithProviders(ui: React.ReactNode) {
  return render(<AppProviders>{ui}</AppProviders>);
}

describe('AppProviders session + theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('treats a fresh visitor as anonymous', async () => {
    renderWithProviders(<AuthProbe />);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('anonymous'));
  });

  it('restores a persisted session from localStorage', async () => {
    writeStorage('user_auth_session', { email: 'stored@example.com' });
    renderWithProviders(<AuthProbe />);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('stored@example.com'));
  });

  it('ignores a persisted session that was cleared', async () => {
    writeStorage('user_auth_session', { email: 'gone@example.com' });
    window.localStorage.clear();
    renderWithProviders(<AuthProbe />);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('anonymous'));
  });

  it('defaults the theme to dark when nothing is stored', async () => {
    renderWithProviders(<ThemeProbe />);
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'));
  });

  it('restores a persisted light theme and applies it to the document', async () => {
    writeStorage('theme', 'light');
    renderWithProviders(<ThemeProbe />);
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists a theme toggle', async () => {
    renderWithProviders(<ThemeProbe />);
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'));
    await act(async () => {
      screen.getByTestId('theme').click();
    });
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'));
    expect(readStorage('theme', 'dark')).toBe('light');
  });
});
