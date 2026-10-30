import { Pipe, PipeTransform } from '@angular/core';
import { getLocalizedUrl } from 'intlayer';
import type { AppLocale } from './locale-labels';

@Pipe({ name: 'localizedPath' })
export class LocalizedPathPipe implements PipeTransform {
  transform(path: string, locale: AppLocale): string {
    return getLocalizedUrl(path, locale);
  }
}
