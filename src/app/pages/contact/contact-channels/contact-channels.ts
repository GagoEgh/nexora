import { Component, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon, isAppIconName } from '../../../core/icons/icons';
import { Reveal } from '../../../shared/motion/reveal';
import contactChannelsContent from './contact-channels.content';

@Component({
  selector: 'app-contact-channels',
  imports: [MatIcon, Reveal],
  templateUrl: './contact-channels.html',
  styleUrl: './contact-channels.scss',
})
export class ContactChannels {
  protected readonly content = useDictionary(contactChannelsContent);

  protected readonly channels = computed(() =>
    this.content().items.map((item) => {
      const name = item.icon.value;
      return {
        label: item.label,
        detail: item.detail,
        href: item.href.value,
        svgIcon: isAppIconName(name) ? appIcon(name) : undefined,
      };
    }),
  );
}
