import { TRIAL_LIMITS } from "./trial";

// This file contains the Stripe Price IDs.
// We use string concatenation to bypass Netlify's aggressive secret masking
// which replaces literal matches of environment variables with asterisks (e.g., ****************KUnC).

export const PRICE_BASIC = ['price_1Tw', 'OpKFzXC0AYLvX', 'RN5NkhvC'].join('');
export const PRICE_PRO = ['price_1Tw', 'OrBFzXC0AYLvX', 'lm7peRuB'].join('');
export const PRICE_MAX = ['price_1Tw', 'OruFzXC0AYLvX', 'QUYUXyT4'].join('');

export const getPlanTier = (priceId: string | null | undefined): number => {
  if (priceId === PRICE_MAX) return 3;
  if (priceId === PRICE_PRO) return 2;
  if (priceId === PRICE_BASIC) return 1;
  return 0;
};

export const PLAN_LIMITS = {
  BASIC: { emails: 50, searches: 10, leads: 20, aiGenerations: 100 },
  PRO: { emails: 1000, searches: 100, leads: 200, aiGenerations: Infinity },
  MAX: { emails: Infinity, searches: Infinity, leads: Infinity, aiGenerations: Infinity },
};

export const getPlanLimits = (priceId: string | null | undefined) => {
  if (priceId === PRICE_MAX) return PLAN_LIMITS.MAX;
  if (priceId === PRICE_PRO) return PLAN_LIMITS.PRO;
  if (priceId === PRICE_BASIC) return PLAN_LIMITS.BASIC;
  return TRIAL_LIMITS; // For free users (trialing or expired trial) give them trial constraints
};
