import { Pipe, PipeTransform } from '@angular/core';
import { useLocale } from 'angular-intlayer';
import { getLocalizedUrl } from 'intlayer';

@Pipe({ name: 'localizedPath', pure: false })
export class LocalizedPathPipe implements PipeTransform {
  private readonly locale = useLocale().locale;

  transform(path: string): string {
    return getLocalizedUrl(path, this.locale());
  }
}
