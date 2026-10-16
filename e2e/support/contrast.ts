import { type Page } from '@playwright/test';

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseCssColor(value: string): Rgba {
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(value);
  if (rgb) {
    return {
      r: +rgb[1] / 255,
      g: +rgb[2] / 255,
      b: +rgb[3] / 255,
      a: rgb[4] === undefined ? 1 : +rgb[4],
    };
  }
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/.exec(value);
  if (srgb) {
    return { r: +srgb[1], g: +srgb[2], b: +srgb[3], a: srgb[4] === undefined ? 1 : +srgb[4] };
  }
  throw new Error(`Unsupported computed colour: "${value}"`);
}

export function relativeLuminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const [hi, lo] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

export async function resolveColorToken(page: Page, token: string): Promise<Rgba> {
  const computed = await page.evaluate((name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);
  return parseCssColor(computed);
}

export async function rootTokenValue(page: Page, token: string): Promise<string> {
  return page.evaluate(
    (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    token,
  );
}
