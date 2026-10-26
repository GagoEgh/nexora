import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import contactNextContent from './contact-next.content';

@Component({
  selector: 'app-contact-next',
  templateUrl: './contact-next.html',
  styleUrl: './contact-next.scss',
})
export class ContactNext {
  protected readonly content = useDictionary(contactNextContent);
}
