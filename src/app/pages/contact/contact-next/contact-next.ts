import { Component } from '@angular/core';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import contactNextContent from './contact-next.content';

@Component({
  selector: 'app-contact-next',
  imports: [Reveal],
  templateUrl: './contact-next.html',
  styleUrl: './contact-next.scss',
})
export class ContactNext {
  protected readonly content = useDictionary(contactNextContent);
}
