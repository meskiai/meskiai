export const TRIAL_LIMITS = {
  emails: 5,
  leads: 5,
  searches: 1,
  aiGenerations: 10
};

export const TRIAL_DURATION_DAYS = 3;

export function getTrialState(user: { createdAt: Date; subscriptionStatus?: string | null }, settings?: { trialStartedAt?: Date | null, emailsSentThisMonth?: number, leadSearchesThisMonth?: number, competitorSearchesThisMonth?: number }) {
  const isSubscribed = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';

  // Trial ends exactly 3 days after user settings were created (trial started)
  const trialStart = settings?.trialStartedAt ? new Date(settings.trialStartedAt) : new Date(user.createdAt);
  const trialEnd = new Date(trialStart.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const isTrialTimeActive = Date.now() < trialEnd.getTime();

  const isEmailLimitReached = (settings?.emailsSentThisMonth || 0) >= TRIAL_LIMITS.emails;
  const isLeadLimitReached = (settings?.leadSearchesThisMonth || 0) >= TRIAL_LIMITS.leads;
  const isSearchLimitReached = (settings?.competitorSearchesThisMonth || 0) >= TRIAL_LIMITS.searches;

  const isTrialLimitsReached = isEmailLimitReached || isLeadLimitReached || isSearchLimitReached;

  const isTrialExpired = !isSubscribed && (!isTrialTimeActive || isTrialLimitsReached);
  const isTrialActive = !isSubscribed && isTrialTimeActive && !isTrialLimitsReached;

  return {
    isSubscribed,
    isTrialActive,
    isTrialExpired,
    trialEnd
  };
}
