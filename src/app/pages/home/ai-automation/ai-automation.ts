import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { IconTile } from '../../../shared/ui/icon-tile/icon-tile';

@Component({
  selector: 'app-ai-automation',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon, IconTile],
  templateUrl: './ai-automation.html',
  styleUrl: './ai-automation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiAutomation {
  protected readonly content = useIntlayer('ai-automation');
  protected readonly arrowIcon = appIcon('arrow-right');
}
