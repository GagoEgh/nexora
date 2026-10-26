import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon, type AppIconName } from '../../../core/icons/icons';
import contactChannelsContent from './contact-channels.content';

@Component({
  selector: 'app-contact-channels',
  imports: [MatIcon],
  templateUrl: './contact-channels.html',
  styleUrl: './contact-channels.scss',
})
export class ContactChannels {
  protected readonly content = useDictionary(contactChannelsContent);

  protected icon(name: string): string {
    return appIcon(name as AppIconName);
  }
}
