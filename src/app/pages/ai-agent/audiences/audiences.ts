import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { useDictionary } from 'angular-intlayer';
import { Reveal } from '../../../shared/motion/reveal';
import { LocalizedPathPipe } from '../../../core/i18n/localized-path.pipe';
import { appIcon } from '../../../core/icons/icons';
import { CONTACT_PATH } from '../../../core/routing/paths';
import { ordinal } from '../../../shared/ordinal';
import audiencesContent from './audiences.content';

@Component({
  selector: 'app-audiences',
  imports: [MatIcon, Reveal, RouterLink, LocalizedPathPipe],
  templateUrl: './audiences.html',
  styleUrl: './audiences.scss',
})
export class Audiences {
  protected readonly content = useDictionary(audiencesContent);
  protected readonly arrowIcon = appIcon('arrow-right');
  protected readonly ordinal = ordinal;
  protected readonly chipIcon = appIcon;

  /*
   * Every row is an example of work, not a page: the catalogue has no per-example entry and
   * nothing here maps onto one, so inventing six destinations would be guesswork. What is true
   * of all six is that recognising your own process is the point at which you talk to someone,
   * which is this page's own primary call to action.
   */
  protected readonly contactPath = CONTACT_PATH;
}
