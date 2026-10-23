import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatSnackBar, type MatSnackBarRef } from '@angular/material/snack-bar';
import { provideIntlayer, useLocale } from 'angular-intlayer';
import { firstValueFrom } from 'rxjs';
import { provideAppIcons } from '../../../core/icons/provide-app-icons';
import { SnackBar, type SnackBarData } from './snack-bar';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M20 6L9 17L4 12" stroke="#0B1324"/></svg>';

@Component({ template: '' })
class Host {}

describe('SnackBar', () => {
  let fixture: ComponentFixture<Host>;
  let snackBar: MatSnackBar;
  let http: HttpTestingController;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppIcons(),
        provideIntlayer(),
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    snackBar = TestBed.inject(MatSnackBar);
    http = TestBed.inject(HttpTestingController);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  const setLocale = (locale: string) =>
    TestBed.runInInjectionContext(() => useLocale()).setLocale(locale);

  afterEach(() => {
    http.verify();
    setLocale('en');
  });

  async function open(data: SnackBarData): Promise<MatSnackBarRef<SnackBar>> {
    const ref = snackBar.openFromComponent(SnackBar, { data });
    await fixture.whenStable();
    http.expectOne(`icons/${data.icon}.svg`).flush(ICON_SVG);
    await fixture.whenStable();
    return ref;
  }

  const host = () => overlay.querySelector('app-snack-bar') as HTMLElement;
  const actionButton = () =>
    overlay.querySelector<HTMLButtonElement>(
      'button.mat-mdc-snack-bar-action',
    ) as HTMLButtonElement;

  it('renders the message, the catalogue icon and the default "Dismiss" action', async () => {
    await open({ message: 'Changes saved', icon: 'check', tone: 'success' });

    expect(host().querySelector('.mat-mdc-snack-bar-label')?.textContent?.trim()).toBe(
      'Changes saved',
    );
    expect(host().querySelector('mat-icon svg path')).not.toBeNull();
    expect(host().querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(actionButton().textContent?.trim()).toBe('Dismiss');
    expect(actionButton().classList.contains('mat-mdc-button')).toBe(true);
  });

  it('localizes the default action label', async () => {
    setLocale('hy');
    await open({ message: 'Փոփոխությունները պահպանված են', icon: 'check', tone: 'success' });
    expect(actionButton().textContent?.trim()).toBe('Փակել');
  });

  it('accepts a custom action label', async () => {
    await open({ message: 'Item archived', icon: 'x', tone: 'error', action: 'Undo' });
    expect(actionButton().textContent?.trim()).toBe('Undo');
  });

  it('reflects the tone on the host for the stylesheet', async () => {
    const variants: SnackBarData[] = [
      { message: 'Neutral', icon: 'globe', tone: 'neutral' },
      { message: 'Success', icon: 'check', tone: 'success' },
      { message: 'Error', icon: 'x', tone: 'error' },
    ];
    for (const data of variants) {
      const ref = await open(data);
      expect(host().getAttribute('data-tone')).toBe(data.tone);
      const dismissed = firstValueFrom(ref.afterDismissed());
      ref.dismiss();
      await fixture.whenStable();
      await dismissed;
    }
  });

  it('dismisses with action when the action is clicked', async () => {
    const ref = await open({ message: 'Changes saved', icon: 'check', tone: 'success' });
    const dismissed = firstValueFrom(ref.afterDismissed());

    actionButton().click();
    await fixture.whenStable();

    expect(await dismissed).toEqual({ dismissedByAction: true });
    expect(overlay.querySelector('app-snack-bar')).toBeNull();
  });
});
