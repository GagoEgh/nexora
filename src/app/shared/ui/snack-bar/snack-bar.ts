import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  type MatSnackBarConfig,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { useDictionary } from 'angular-intlayer';
import { appIcon, type AppIconName } from '../../../core/icons/icons';
import snackBarContent from './snack-bar.content';
export const SNACK_BAR_CONFIG = { verticalPosition: 'top' } as const satisfies MatSnackBarConfig;

export type SnackBarTone = 'neutral' | 'success' | 'error';

export interface SnackBarData {
  message: string;
  icon: AppIconName;
  tone: SnackBarTone;
  action?: string;
}

@Component({
  selector: 'app-snack-bar',
  imports: [MatButton, MatIcon, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  templateUrl: './snack-bar.html',
  styleUrl: './snack-bar.scss',
  host: {
    '[attr.data-tone]': 'data.tone',
  },
})
export class SnackBar {
  protected readonly data = inject<SnackBarData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject<MatSnackBarRef<SnackBar>>(MatSnackBarRef);
  private readonly content = useDictionary(snackBarContent);

  protected readonly svgIcon = appIcon(this.data.icon);
  protected readonly action = this.data.action ?? this.content().dismiss.value;

  protected dismiss(): void {
    this.snackBarRef.dismissWithAction();
  }
}
