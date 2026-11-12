import {
  ALL_SERVICES,
  SERVICE_CATEGORY_IDS,
  isServiceCategoryId,
  isServiceFilter,
  serviceSectionId,
} from './service-category';

/**
 * The guards behind `?category=` on the services page. `isServiceFilter` is the wider of the two:
 * it also admits the `all` sentinel, which is the state the page opens in, so the pair has to be
 * tested together - admitting `all` where only a category belongs would name a section id that
 * does not exist.
 */
describe('service category', () => {
  it('accepts every declared category', () => {
    for (const id of SERVICE_CATEGORY_IDS) {
      expect(isServiceCategoryId(id), id).toBe(true);
    }
  });

  it('rejects anything that is not a category', () => {
    for (const value of ['', ' ', 'not-a-category', 'design', 'design-products']) {
      expect(isServiceCategoryId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('rejects a value that is not a string at all', () => {
    for (const value of [null, undefined, 0, {}, [], ['design-product']]) {
      expect(isServiceCategoryId(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('treats the `all` sentinel as a filter but not as a category', () => {
    expect(isServiceFilter(ALL_SERVICES)).toBe(true);
    expect(isServiceCategoryId(ALL_SERVICES)).toBe(false);
  });

  it('admits exactly the categories plus `all` as a filter', () => {
    for (const id of SERVICE_CATEGORY_IDS) {
      expect(isServiceFilter(id), id).toBe(true);
    }
    for (const value of ['none', '', null, undefined]) {
      expect(isServiceFilter(value), JSON.stringify(value)).toBe(false);
    }
  });

  it('does not accept an individual service id as a category', () => {
    // `SERVICE_IDS` and `SERVICE_CATEGORY_IDS` are different domains; the filter takes the latter.
    expect(isServiceCategoryId('web-development')).toBe(false);
    expect(isServiceCategoryId('ai-agents-automation')).toBe(false);
  });

  it('names a section element for each category', () => {
    expect(serviceSectionId('design-product')).toBe('services-design-product');
    expect(new Set(SERVICE_CATEGORY_IDS.map(serviceSectionId)).size).toBe(
      SERVICE_CATEGORY_IDS.length,
    );
  });
});
