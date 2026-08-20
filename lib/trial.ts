export const TRIAL_LIMITS = {
  credits: 50
};

export const TRIAL_DURATION_DAYS = 3;

export function getTrialState(user: { createdAt: Date; subscriptionStatus?: string | null }, settings?: { trialStartedAt?: Date | null, aiCredits?: number }) {
  const isSubscribed = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';

  // Trial ends exactly 3 days after user settings were created (trial started)
  const trialStart = settings?.trialStartedAt ? new Date(settings.trialStartedAt) : new Date(user.createdAt);
  const trialEnd = new Date(trialStart.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const isTrialTimeActive = Date.now() < trialEnd.getTime();

  // If they have no credits left, trial limits are reached
  const isTrialLimitsReached = (settings?.aiCredits ?? 0) <= 0;

  const isTrialExpired = !isSubscribed && (!isTrialTimeActive || isTrialLimitsReached);
  const isTrialActive = !isSubscribed && isTrialTimeActive && !isTrialLimitsReached;

  return {
    isSubscribed,
    isTrialActive,
    isTrialExpired,
    trialEnd
  };
}
