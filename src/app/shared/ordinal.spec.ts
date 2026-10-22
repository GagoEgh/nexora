import { ordinal } from './ordinal';

describe('ordinal', () => {
  it('formats a zero-based index as a two-digit one-based number', () => {
    expect([0, 1, 4, 9, 10].map(ordinal)).toEqual(['01', '02', '05', '10', '11']);
  });
});
