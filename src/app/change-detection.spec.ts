import { ChangeDetectionStrategy, type Type } from '@angular/core';
import { App } from './app';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { AiAutomation } from './pages/home/ai-automation/ai-automation';
import { EngagementModels } from './pages/home/engagement-models/engagement-models';
import { Expertise } from './pages/home/expertise/expertise';
import { Hero } from './pages/home/hero/hero';
import { HeroIllustration } from './pages/home/hero/illustration/hero-illustration';
import { HeroNotes } from './pages/home/hero/illustration/notes/hero-notes';
import { Home } from './pages/home/home';
import { HowWeWork } from './pages/home/how-we-work/how-we-work';
import { StartConversation } from './pages/home/start-conversation/start-conversation';
import { WhatWeBuildIllustration } from './pages/home/what-we-build/illustration/what-we-build-illustration';
import { WhatWeBuild } from './pages/home/what-we-build/what-we-build';
import { Why } from './pages/home/why/why';
import { Partnerships } from './pages/partnerships/partnerships';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { Services } from './pages/services/services';
import { Solutions } from './pages/solutions/solutions';
import { TermsOfUse } from './pages/terms-of-use/terms-of-use';
import { FieldLabel } from './shared/ui/field-label/field-label';
import { IconTile } from './shared/ui/icon-tile/icon-tile';
import { Logo } from './shared/ui/logo/logo';
import { SnackBar } from './shared/ui/snack-bar/snack-bar';

/**
 * Change detection contract.
 *
 * No component in this application declares `changeDetection`: Angular 22 compiles an omitted
 * strategy to OnPush (`onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.
 * Eager` in `ɵɵdefineComponent`), so the explicit setting was redundant and was removed.
 *
 * That makes the behaviour of every component depend on a framework default which changed in the
 * current major version, so it is asserted rather than assumed: the first test pins the default
 * itself, and the second checks the resolved strategy of every component in the application. If a
 * future Angular release moves the default back, these fail instead of the UI silently going stale.
 *
 * A component that genuinely needs eager checking must say `ChangeDetectionStrategy.Eager`
 * explicitly and be listed here as such — `Default` is a deprecated alias for `Eager`.
 */
const COMPONENTS: readonly [string, Type<unknown>][] = [
  ['App', App],
  ['Header', Header],
  ['Footer', Footer],
  ['Home', Home],
  ['Hero', Hero],
  ['HeroIllustration', HeroIllustration],
  ['HeroNotes', HeroNotes],
  ['Expertise', Expertise],
  ['Why', Why],
  ['WhatWeBuild', WhatWeBuild],
  ['WhatWeBuildIllustration', WhatWeBuildIllustration],
  ['AiAutomation', AiAutomation],
  ['HowWeWork', HowWeWork],
  ['EngagementModels', EngagementModels],
  ['StartConversation', StartConversation],
  ['Services', Services],
  ['About', About],
  ['Solutions', Solutions],
  ['Partnerships', Partnerships],
  ['Contact', Contact],
  ['PrivacyPolicy', PrivacyPolicy],
  ['TermsOfUse', TermsOfUse],
  ['Logo', Logo],
  ['IconTile', IconTile],
  ['FieldLabel', FieldLabel],
  ['SnackBar', SnackBar],
];

/** The compiled definition's resolved strategy, as `ɵɵdefineComponent` stored it. */
const isOnPush = (component: Type<unknown>): boolean =>
  (component as unknown as { ɵcmp: { onPush: boolean } }).ɵcmp.onPush;

describe('change detection', () => {
  it('Angular compiles an omitted strategy to OnPush, and only Eager opts out', () => {
    expect(ChangeDetectionStrategy.OnPush).toBe(0);
    expect(ChangeDetectionStrategy.Eager).toBe(1);
    expect(ChangeDetectionStrategy.Default).toBe(ChangeDetectionStrategy.Eager);
  });

  it('every component in the application resolves to OnPush', () => {
    expect(COMPONENTS).toHaveLength(26);
    const eager = COMPONENTS.filter(([, component]) => !isOnPush(component)).map(([name]) => name);
    expect(eager, 'these components are checked eagerly').toEqual([]);
  });
});
