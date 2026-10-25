import { ChangeDetectionStrategy, type Type } from '@angular/core';
import { App } from './app';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { About } from './pages/about/about';
import { AboutGlance } from './pages/about/glance/about-glance';
import { Philosophy } from './pages/about/philosophy/philosophy';
import { BusinessFlow } from './pages/about/business-flow/business-flow';
import { SeniorModel } from './pages/about/senior-model/senior-model';
import { LongTerm } from './pages/about/long-term/long-term';
import { Markets } from './pages/about/markets/markets';
import { QualityCapability } from './pages/about/quality-capability/quality-capability';
import { AiAgent } from './pages/ai-agent/ai-agent';
import { Audiences } from './pages/ai-agent/audiences/audiences';
import { BusinessValue } from './pages/ai-agent/business-value/business-value';
import { Capabilities } from './pages/ai-agent/capabilities/capabilities';
import { Overview } from './pages/ai-agent/overview/overview';
import { Problems } from './pages/ai-agent/problems/problems';
import { EngagementPanel } from './pages/ai-agent/related-services/engagement-panel/engagement-panel';
import { RelatedServices } from './pages/ai-agent/related-services/related-services';
import { Workflow } from './pages/ai-agent/workflow/workflow';
import { Contact } from './pages/contact/contact';
import { AiAutomation } from './pages/home/ai-automation/ai-automation';
import { EngagementModels } from './pages/home/engagement-models/engagement-models';
import { Expertise } from './pages/home/expertise/expertise';
import { Hero } from './pages/home/hero/hero';
import { HeroIllustration } from './pages/home/hero/illustration/hero-illustration';
import { HeroNotes } from './pages/home/hero/illustration/notes/hero-notes';
import { Home } from './pages/home/home';
import { HowWeWork } from './pages/home/how-we-work/how-we-work';
import { WhatWeBuildIllustration } from './pages/home/what-we-build/illustration/what-we-build-illustration';
import { WhatWeBuild } from './pages/home/what-we-build/what-we-build';
import { Why } from './pages/home/why/why';
import { Partnerships } from './pages/partnerships/partnerships';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { CategoryNav } from './pages/services/category-nav/category-nav';
import { FilterBar } from './pages/services/filter-bar/filter-bar';
import { Services } from './pages/services/services';
import { ChallengeDetails } from './pages/solutions/challenge-details/challenge-details';
import { ChallengeIndex } from './pages/solutions/challenge-index/challenge-index';
import { Solutions } from './pages/solutions/solutions';
import { TermsOfUse } from './pages/terms-of-use/terms-of-use';
import { FieldLabel } from './shared/ui/field-label/field-label';
import { IconTile } from './shared/ui/icon-tile/icon-tile';
import { Logo } from './shared/ui/logo/logo';
import { PageIntro } from './shared/ui/page-intro/page-intro';
import { ServiceCard } from './shared/ui/service-card/service-card';
import { SnackBar } from './shared/ui/snack-bar/snack-bar';
import { StartConversation } from './shared/ui/start-conversation/start-conversation';

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
  ['CategoryNav', CategoryNav],
  ['FilterBar', FilterBar],
  ['About', About],
  ['AboutGlance', AboutGlance],
  ['Philosophy', Philosophy],
  ['SeniorModel', SeniorModel],
  ['BusinessFlow', BusinessFlow],
  ['QualityCapability', QualityCapability],
  ['LongTerm', LongTerm],
  ['Markets', Markets],
  ['AiAgent', AiAgent],
  ['Audiences', Audiences],
  ['BusinessValue', BusinessValue],
  ['Capabilities', Capabilities],
  ['Overview', Overview],
  ['Problems', Problems],
  ['EngagementPanel', EngagementPanel],
  ['RelatedServices', RelatedServices],
  ['Workflow', Workflow],
  ['Solutions', Solutions],
  ['ChallengeIndex', ChallengeIndex],
  ['ChallengeDetails', ChallengeDetails],
  ['Partnerships', Partnerships],
  ['Contact', Contact],
  ['PrivacyPolicy', PrivacyPolicy],
  ['TermsOfUse', TermsOfUse],
  ['Logo', Logo],
  ['IconTile', IconTile],
  ['PageIntro', PageIntro],
  ['FieldLabel', FieldLabel],
  ['ServiceCard', ServiceCard],
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
    expect(COMPONENTS).toHaveLength(48);
    const eager = COMPONENTS.filter(([, component]) => !isOnPush(component)).map(([name]) => name);
    expect(eager, 'these components are checked eagerly').toEqual([]);
  });
});
