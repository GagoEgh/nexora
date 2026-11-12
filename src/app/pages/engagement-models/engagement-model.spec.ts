import { MODEL_IDS, isModelId, modelSectionId } from './engagement-model';

/**
 * `isModelId` guards the `?model=` query parameter, and before this spec it had no direct test of
 * its own - the deep-link behaviour it gates was covered only end to end.
 */
describe('engagement model', () => {
  it('accepts every declared id', () => {
    for (const id of MODEL_IDS) {
      expect(isModelId(id), id).toBe(true);
    }
  });

  it('rejects anything that is not one of them', () => {
    for (const value of ['', ' ', 'not-a-model', 'dedicated', 'dedicated-teams']) {
      expect(isModelId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('rejects a value that is not a string at all', () => {
    for (const value of [null, undefined, 0, {}, [], ['white-label']]) {
      expect(isModelId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('is case-sensitive, so a mistyped address does not half-work', () => {
    expect(isModelId('Dedicated-Team')).toBe(false);
    expect(isModelId('WHITE-LABEL')).toBe(false);
  });

  it('does not accept an id from the solutions domain', () => {
    expect(isModelId('introduce-ai')).toBe(false);
    expect(isModelId('modernize-platform')).toBe(false);
  });

  it('names a section element for each id', () => {
    expect(modelSectionId('dedicated-team')).toBe('model-dedicated-team');
    expect(new Set(MODEL_IDS.map(modelSectionId)).size).toBe(MODEL_IDS.length);
  });
});
