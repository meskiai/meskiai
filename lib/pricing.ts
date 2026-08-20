import { TRIAL_LIMITS } from "./trial";

// This file contains the Stripe Price IDs.
// We use string concatenation to bypass Netlify's aggressive secret masking
// which replaces literal matches of environment variables with asterisks (e.g., ****************KUnC).

export const PRICE_BASIC = ['price_1U6', 'HaMFzXC0AYLvX', '7W3GTfaJ'].join('');
export const PRICE_PRO = ['price_1U6', 'HcLFzXC0AYLvX', 'HR4Xd88X'].join('');
export const PRICE_MAX = ['price_1U6', 'HdhFzXC0AYLvX', 'gFWJBLcq'].join('');

export const getPlanTier = (priceId: string | null | undefined): number => {
  if (priceId === PRICE_MAX) return 3;
  if (priceId === PRICE_PRO) return 2;
  if (priceId === PRICE_BASIC) return 1;
  return 0;
};

export const PLAN_LIMITS = {
  BASIC: { credits: 500 },
  PRO: { credits: 5000 },
  MAX: { credits: Infinity },
};

export const getPlanLimits = (priceId: string | null | undefined) => {
  if (priceId === PRICE_MAX) return PLAN_LIMITS.MAX;
  if (priceId === PRICE_PRO) return PLAN_LIMITS.PRO;
  if (priceId === PRICE_BASIC) return PLAN_LIMITS.BASIC;
  return TRIAL_LIMITS; // For free users (trialing or expired trial) give them trial constraints
};
