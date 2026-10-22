import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useIntlayer } from 'angular-intlayer';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';

@Component({
  selector: 'app-start-conversation',
  imports: [RouterLink, LocalizedPathPipe, MatButton, MatIcon],
  templateUrl: './start-conversation.html',
  styleUrl: './start-conversation.scss',
})
export class StartConversation {
  protected readonly content = useIntlayer('start-conversation');
  protected readonly arrowIcon = appIcon('arrow-right');
}
