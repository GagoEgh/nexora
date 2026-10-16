import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { APP_ICON_NAMESPACE, isAppIconName } from './icons';

/**
 * Registers the `app:` icon namespace with Angular Material's icon registry.
 *
 * One resolver maps `app:<name>` to `icons/<name>.svg`; icons are fetched
 * lazily on first use and cached by the registry. Unknown names resolve to
 * `null`, so a typo surfaces as Material's "Unable to find icon" error
 * instead of a silent 404.
 *
 * Requires `provideHttpClient()` (the registry fetches SVGs over HTTP).
 */
export function provideAppIcons(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    registry.addSvgIconResolver((name, namespace) =>
      namespace === APP_ICON_NAMESPACE && isAppIconName(name)
        ? sanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`)
        : null,
    );
  });
}
