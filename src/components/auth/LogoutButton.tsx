"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

type Props = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  variant?: "outline" | "ghost" | "default" | "secondary" | "destructive" | "link";
};

export default function LogoutButton({
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const { signOut, loading } = useAuth();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className ?? "border-slate-300"}
      disabled={loading}
      onClick={() => void signOut()}
    >
      Logout
    </Button>
  );
}
