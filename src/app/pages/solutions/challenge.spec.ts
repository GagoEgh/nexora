import { CHALLENGE_IDS, challengeSectionId, isChallengeId } from './challenge';

/**
 * `isChallengeId` is a trust boundary: its input is the `?challenge=` query parameter, so it is
 * whatever the address bar contains. Other specs call it to assert that a link the application
 * produced is valid, which only ever exercises the true branch; these cover the false one, and
 * the ids it must not confuse with a neighbouring domain.
 */
describe('challenge', () => {
  it('accepts every declared id', () => {
    for (const id of CHALLENGE_IDS) {
      expect(isChallengeId(id), id).toBe(true);
    }
  });

  it('rejects anything that is not one of them', () => {
    for (const value of ['', ' ', 'not-a-challenge', 'launch', 'launch-digital-products']) {
      expect(isChallengeId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('rejects a value that is not a string at all', () => {
    // `queryParamMap.get` answers `null` for an absent parameter, which must not pass.
    for (const value of [null, undefined, 0, {}, [], ['introduce-ai']]) {
      expect(isChallengeId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('is case-sensitive, so a mistyped address does not half-work', () => {
    expect(isChallengeId('Introduce-AI')).toBe(false);
    expect(isChallengeId('INTRODUCE-AI')).toBe(false);
  });

  it('does not accept an id from the engagement-models domain', () => {
    // The two pages carry the same `?param=` mechanism, so a copied link must fail cleanly
    // rather than scroll to something arbitrary.
    expect(isChallengeId('dedicated-team')).toBe(false);
    expect(isChallengeId('white-label')).toBe(false);
  });

  it('names a section element for each id', () => {
    expect(challengeSectionId('introduce-ai')).toBe('challenge-introduce-ai');
    expect(new Set(CHALLENGE_IDS.map(challengeSectionId)).size).toBe(CHALLENGE_IDS.length);
  });
});
