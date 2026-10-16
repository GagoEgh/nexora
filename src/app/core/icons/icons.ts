/**
 * Icon catalogue.
 *
 * Every name below is a file `public/icons/<name>.svg` (served at `icons/<name>.svg`).
 * The files are 24x24 outline icons with a 1.75 stroke; the stroke follows
 * `currentColor` at render time (see the `.mat-icon` rule in styles.scss),
 * so the same file works on light and inverse surfaces.
 *
 * Templates:   <mat-icon svgIcon="app:arrow-right" />
 * TypeScript:  appIcon('arrow-right')  // -> 'app:arrow-right', type-checked
 *
 * Adding an icon = drop the SVG into public/icons and add its name here.
 * e2e/icons.spec.ts fails if the list and the folder disagree.
 */
export const APP_ICON_NAMESPACE = 'app';

export const APP_ICON_NAMES = [
  'arrow-right',
  'arrow-up-right',
  'bot',
  'briefcase',
  'check',
  'chevron-down',
  'cloud',
  'code',
  'compass',
  'database',
  'file-text',
  'git-branch',
  'globe',
  'handshake',
  'layout-dashboard',
  'mail',
  'menu',
  'message-square',
  'minus',
  'pen-tool',
  'plug',
  'plus',
  'refresh-cw',
  'rocket',
  'search',
  'server',
  'shield-check',
  'smartphone',
  'sparkle',
  'tag',
  'target',
  'users',
  'wrench',
  'x',
] as const;

export type AppIconName = (typeof APP_ICON_NAMES)[number];

export function isAppIconName(name: string): name is AppIconName {
  return (APP_ICON_NAMES as readonly string[]).includes(name);
}

/** Namespaced icon reference for `[svgIcon]` bindings, e.g. `appIcon('check')`. */
export function appIcon(name: AppIconName): `${typeof APP_ICON_NAMESPACE}:${AppIconName}` {
  return `${APP_ICON_NAMESPACE}:${name}`;
}
