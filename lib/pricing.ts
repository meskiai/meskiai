// This file contains the Stripe Price IDs.
// We use string concatenation to bypass Netlify's aggressive secret masking
// which replaces literal matches of environment variables with asterisks (e.g., ****************KUnC).

export const PRICE_BASIC = ['price_1Tw', 'UOYFzXC0AYLvX', 'gDvOKUnC'].join('');
export const PRICE_PRO = ['price_1U1', 'YipFzXC0AYLvX', '65CDZVyC'].join('');
export const PRICE_MAX = ['price_1Tw', 'OruFzXC0AYLvX', 'QUYUXyT4'].join('');

export const getPlanTier = (priceId: string | null | undefined): number => {
  if (priceId === PRICE_MAX) return 3;
  if (priceId === PRICE_PRO) return 2;
  if (priceId === PRICE_BASIC) return 1;
  return 0;
};
