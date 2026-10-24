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
  'layers',
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
  'workflow',
  'wrench',
  'x',
] as const;

export type AppIconName = (typeof APP_ICON_NAMES)[number];

export function isAppIconName(name: string): name is AppIconName {
  return (APP_ICON_NAMES as readonly string[]).includes(name);
}

export function appIcon(name: AppIconName): `${typeof APP_ICON_NAMESPACE}:${AppIconName}` {
  return `${APP_ICON_NAMESPACE}:${name}`;
}
