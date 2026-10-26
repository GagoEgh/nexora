import { Component, computed } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { PageIntro, type PageIntroCrumb } from '../../shared/ui/page-intro/page-intro';
import { ContactChannels } from './contact-channels/contact-channels';
import { ContactForm } from './contact-form/contact-form';
import { ContactNext } from './contact-next/contact-next';
import contactContent from './contact.content';

@Component({
  selector: 'app-contact',
  imports: [PageIntro, ContactNext, ContactChannels, ContactForm],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  host: { 'data-layout': 'immersive' },
})
export class Contact {
  protected readonly content = useDictionary(contactContent);

  protected readonly crumbs = computed<readonly PageIntroCrumb[]>(() => {
    const copy = this.content();
    return [{ label: copy.breadcrumbHome.value, path: '/' }, { label: copy.title.value }];
  });
}
