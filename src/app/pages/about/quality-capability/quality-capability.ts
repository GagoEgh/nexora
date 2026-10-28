import { Component, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { useDictionary } from 'angular-intlayer';
import { appIcon } from '../../../core/icons/icons';
import { Reveal } from '../../../shared/motion/reveal';
import qualityCapabilityContent from './quality-capability.content';

@Component({
  selector: 'app-quality-capability',
  imports: [MatIcon, Reveal],
  templateUrl: './quality-capability.html',
  styleUrl: './quality-capability.scss',
})
export class QualityCapability {
  protected readonly content = useDictionary(qualityCapabilityContent);

  protected readonly practices = computed(() =>
    this.content().practices.items.map((item) => ({
      label: item.label,
      svgIcon: appIcon(item.icon.value),
    })),
  );
}
