import { expect, type Page } from '@playwright/test';

/**
 * Reads the design tokens out of the running page.
 *
 * The specs used to pin every dimension to a literal copied from a mockup, which meant ~481
 * assertions had to be rewritten for any change to the scale, and a failure told you a number
 * had moved without saying whether the move was wrong. Reading the token instead asserts the
 * thing that actually matters: that an element uses the role it is supposed to use, and that
 * the roles stay in the right order relative to each other.
 *
 * Literals are still right for anything fixed by the canvas rather than by the scale - the 1440
 * design width, the 1280 container, a 320px mobile viewport. Those are not tokens and should
 * not pretend to be.
 */

/** Resolved value of a custom property on `:root`, e.g. `--nx-sys-display-hero-size`. */
export const token = (page: Page, name: string): Promise<string> =>
  page.evaluate(
    (property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
    name,
  );

/** Several tokens at once, in one round trip. */
export const tokens = async <T extends readonly string[]>(
  page: Page,
  names: T,
): Promise<Record<T[number], string>> =>
  page.evaluate(
    (properties) => {
      const root = getComputedStyle(document.documentElement);
      const out: Record<string, string> = {};
      for (const property of properties) {
        out[property] = root.getPropertyValue(property).trim();
      }
      return out;
    },
    names as unknown as string[],
  ) as Promise<Record<T[number], string>>;

/** A `--nx-sys-*` type role's rendered size and line height, as px strings. */
export const typeRole = async (
  page: Page,
  role: string,
): Promise<{ size: string; lineHeight: string }> => {
  const values = await tokens(page, [`--nx-sys-${role}-size`, `--nx-sys-${role}-line-height`]);
  return {
    size: await toPx(page, values[`--nx-sys-${role}-size`]),
    lineHeight: await toPx(page, values[`--nx-sys-${role}-line-height`]),
  };
};

/**
 * Converts a CSS length to the px string `getComputedStyle` reports, by letting the browser do
 * it. Tokens are authored in `rem`, computed styles come back in `px`, and hard-coding the
 * 16px root would silently break if the root size ever changed.
 */
export const toPx = (page: Page, length: string): Promise<string> =>
  page.evaluate((value) => {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.width = value;
    document.body.append(probe);
    const px = getComputedStyle(probe).width;
    probe.remove();
    return px;
  }, length);

/** The numeric part of a px string, for ordering comparisons. */
export const px = (value: string): number => Number.parseFloat(value);

/** A single computed style property of the first match. */
export const style = (page: Page, selector: string, property: string): Promise<string> =>
  page
    .locator(selector)
    .first()
    .evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

/**
 * Asserts an element renders the type of a named role, instead of a literal copied from a
 * mockup.
 *
 * The role name carries the prefix, because the project draws from two systems: `--nx-sys-*`
 * for the Nexora display and body roles, `--mat-sys-*` for the Material typescale a themed
 * component binds to. A failure here means the element stopped using the role it was designed
 * with - which is the actual defect - rather than merely reporting that a number moved.
 */
export const expectTypeFromRole = async (
  page: Page,
  selector: string,
  role: string,
): Promise<void> => {
  const size = await toPx(page, await token(page, `${role}-size`));
  const lineHeight = await toPx(page, await token(page, `${role}-line-height`));

  expect(await style(page, selector, 'font-size'), `${selector} font-size (${role})`).toBe(size);
  expect(await style(page, selector, 'line-height'), `${selector} line-height (${role})`).toBe(
    lineHeight,
  );
};
