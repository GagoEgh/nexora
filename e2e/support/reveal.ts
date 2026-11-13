import type { Locator } from '@playwright/test';
export const REVEAL_LINE = 0.9;
const EPSILON = 1;

export interface RevealProbe {
  state: string | null;
  past: number;
}

export const probeReveal = (locator: Locator): Promise<RevealProbe[]> =>
  locator.evaluateAll(
    (els, line) =>
      els.map((el) => ({
        state: el.getAttribute('data-reveal'),
        past: el.getBoundingClientRect().top - window.innerHeight * line,
      })),
    REVEAL_LINE,
  );

export const heldBelowTheFold = (probes: RevealProbe[]): RevealProbe[] =>
  probes.filter((probe) => probe.past > EPSILON);

export const revealedOnSight = (probes: RevealProbe[]): RevealProbe[] =>
  probes.filter((probe) => probe.past < -EPSILON);
