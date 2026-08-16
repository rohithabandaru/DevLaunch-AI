'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500';
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
