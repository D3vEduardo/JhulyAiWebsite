export function getUserOnboardingStatus({
  apiKey,
  name,
  email,
}: {
  apiKey?: string;
  email?: string;
  name?: string;
}):
  | { hasCompletedOnboarding: false; uncompletedFields: string[] }
  | { hasCompletedOnboarding: true } {
  const hasCompletedOnboarding = !!apiKey && !!name && !!email;

  if (!hasCompletedOnboarding) {
    const uncompletedFields = Object.keys(
      Object.fromEntries(
        Object.entries({
          name: !name,
          email: !email,
          apiKey: !apiKey,
        }).filter(([, isUncompleted]) => isUncompleted)
      )
    );

    return { hasCompletedOnboarding, uncompletedFields };
  }

  return { hasCompletedOnboarding };
}
