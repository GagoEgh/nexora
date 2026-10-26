export type ChallengeTone = 'plain' | 'accent';

/** Stable identifiers for the eight challenges, in the order they are authored. */
export const CHALLENGE_IDS = [
  'launch-digital-product',
  'modernize-platform',
  'automate-operations',
  'introduce-ai',
  'connect-systems',
  'scale-engineering',
  'build-saas',
  'improve-reliability',
] as const;

export type ChallengeId = (typeof CHALLENGE_IDS)[number];

export function isChallengeId(value: unknown): value is ChallengeId {
  return typeof value === 'string' && (CHALLENGE_IDS as readonly string[]).includes(value);
}

export function challengeSectionId(challenge: ChallengeId): string {
  return `challenge-${challenge}`;
}
