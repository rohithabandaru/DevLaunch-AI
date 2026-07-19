export type UserTier = "free" | "pro";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_role: string | null;
  experience_level: string | null;
  tier: UserTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  tier: UserTier;
  isDemo: boolean;
};
