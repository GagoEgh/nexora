import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { appIcon, type AppIconName, isAppIconName } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';

@Component({
  selector: 'app-expertise',
  imports: [RouterLink, MatButton, MatIcon, IconTile],
  templateUrl: './expertise.html',
  styleUrl: './expertise.scss',
})
export class Expertise {
  protected readonly content = useIntlayer('expertise');
  protected readonly arrowIcon = appIcon('arrow-right');

  protected serviceIcon(name: string): AppIconName {
    if (!isAppIconName(name)) {
      throw new Error(`Unknown service icon "${name}"`);
    }
    return name;
  }
}
