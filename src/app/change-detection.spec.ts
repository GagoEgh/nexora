import { readFileSync, readdirSync } from 'node:fs';
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
import { ModelPanel } from './pages/about/senior-model/model-panel/model-panel';
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
import { ContactChannels } from './pages/contact/contact-channels/contact-channels';
import { ContactForm } from './pages/contact/contact-form/contact-form';
import { ChipSelect } from './pages/contact/contact-form/chip-select/chip-select';
import { ContactNext } from './pages/contact/contact-next/contact-next';
import { EngagementModelsPage } from './pages/engagement-models/engagement-models';
import { ModelComparison } from './pages/engagement-models/model-comparison/model-comparison';
import { ModelDetails } from './pages/engagement-models/model-details/model-details';
import { ModelFaq } from './pages/engagement-models/model-faq/model-faq';
import { ModelFinder } from './pages/engagement-models/model-finder/model-finder';
import { AiAutomation } from './pages/home/ai-automation/ai-automation';
import { EngagementModels } from './pages/home/engagement-models/engagement-models';
import { Expertise } from './pages/home/expertise/expertise';
import { Hero } from './pages/home/hero/hero';
import { HeroIllustration } from './pages/home/hero/illustration/hero-illustration';
import { HeroNotes } from './pages/home/hero/illustration/notes/hero-notes';
import { ArtNode } from './pages/home/hero/illustration/node/art-node';
import { ArtPipeline } from './pages/home/hero/illustration/pipeline/art-pipeline';
import { AiPipeline } from './pages/home/ai-automation/pipeline/ai-pipeline';
import { ConversationArt } from './shared/ui/start-conversation/art/conversation-art';
import { Home } from './pages/home/home';
import { HowWeWork } from './pages/home/how-we-work/how-we-work';
import { WhatWeBuildIllustration } from './pages/home/what-we-build/illustration/what-we-build-illustration';
import { WhatWeBuild } from './pages/home/what-we-build/what-we-build';
import { Why } from './pages/home/why/why';
import { PartnerAudience } from './pages/partnerships/partner-audience/partner-audience';
import { PartnerFlow } from './pages/partnerships/partner-flow/partner-flow';
import { PartnerModel } from './pages/partnerships/partner-model/partner-model';
import { PartnerProcess } from './pages/partnerships/partner-process/partner-process';
import { PartnerTerms } from './pages/partnerships/partner-terms/partner-terms';
import { Partnerships } from './pages/partnerships/partnerships';
import { NotFound } from './pages/not-found/not-found';
import { CategoryNav } from './pages/services/category-nav/category-nav';
import { FilterBar } from './pages/services/filter-bar/filter-bar';
import { Services } from './pages/services/services';
import { ChallengeDetails } from './pages/solutions/challenge-details/challenge-details';
import { ChallengeIndex } from './pages/solutions/challenge-index/challenge-index';
import { Solutions } from './pages/solutions/solutions';
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
 *
 * `COMPONENTS` has to be written out, because the specs are compiled by esbuild rather than
 * Vite's transform pipeline, so there is no `import.meta.glob` to enumerate them with. A hand
 * list is only worth as much as its upkeep, and `expect(COMPONENTS).toHaveLength(66)` did not
 * provide any: it caught an entry being deleted, but a *new* component that nobody added here
 * was simply not checked - the one case the list exists for. So the third test reads the source
 * tree and fails until every `@Component` under `src/app` appears above, which is what makes
 * the claim "every component in the application" true rather than aspirational.
 */
const COMPONENTS: readonly [string, Type<unknown>][] = [
  ['App', App],
  ['Header', Header],
  ['Footer', Footer],
  ['Home', Home],
  ['Hero', Hero],
  ['HeroIllustration', HeroIllustration],
  ['HeroNotes', HeroNotes],
  ['ArtNode', ArtNode],
  ['ArtPipeline', ArtPipeline],
  ['AiPipeline', AiPipeline],
  ['ConversationArt', ConversationArt],
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
  ['ModelPanel', ModelPanel],
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
  ['EngagementModelsPage', EngagementModelsPage],
  ['ModelFinder', ModelFinder],
  ['ModelDetails', ModelDetails],
  ['ModelComparison', ModelComparison],
  ['ModelFaq', ModelFaq],
  ['Partnerships', Partnerships],
  ['PartnerFlow', PartnerFlow],
  ['PartnerAudience', PartnerAudience],
  ['PartnerModel', PartnerModel],
  ['PartnerProcess', PartnerProcess],
  ['PartnerTerms', PartnerTerms],
  ['Contact', Contact],
  ['ContactNext', ContactNext],
  ['ContactChannels', ContactChannels],
  ['ContactForm', ContactForm],
  ['ChipSelect', ChipSelect],
  ['NotFound', NotFound],
  ['Logo', Logo],
  ['IconTile', IconTile],
  ['PageIntro', PageIntro],
  ['FieldLabel', FieldLabel],
  ['ServiceCard', ServiceCard],
  ['SnackBar', SnackBar],
];

/**
 * Every class decorated with `@Component` under `root`, by name, read from the source rather
 * than from the module graph - importing all of them eagerly here would mean a second copy of
 * the list above.
 *
 * @param root directory to walk, relative to the project root (tests run from there)
 */
function declaredComponents(root: string): string[] {
  const names: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = `${root}/${entry.name}`;

    if (entry.isDirectory()) {
      names.push(...declaredComponents(path));
      continue;
    }
    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
      continue;
    }

    const source = readFileSync(path, 'utf8');
    // `@Component({...}) export class Foo` - the decorator and the class it applies to. Only
    // the first class in a file can carry it in this codebase, which is one component per file.
    for (const match of source.matchAll(/@Component\(\{[\s\S]*?\}\)\s*export class (\w+)/g)) {
      names.push(match[1]);
    }
  }

  return names;
}

/** The compiled definition's resolved strategy, as `ɵɵdefineComponent` stored it. */
const isOnPush = (component: Type<unknown>): boolean =>
  (component as unknown as { ɵcmp: { onPush: boolean } }).ɵcmp.onPush;

describe('change detection', () => {
  it('Angular compiles an omitted strategy to OnPush, and only Eager opts out', () => {
    expect(ChangeDetectionStrategy.OnPush).toBe(0);
    expect(ChangeDetectionStrategy.Eager).toBe(1);
    // `Default` is deprecated in favour of `Eager`, and naming it here is the point: this file
    // exists to pin the enum's numeric semantics, and `Default === Eager === 1` is the half that
    // makes "an omitted strategy is OnPush" safe to rely on. The deprecation rule is suppressed
    // for this one reference rather than for the file, so an accidental use elsewhere still fails.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(ChangeDetectionStrategy.Default).toBe(ChangeDetectionStrategy.Eager);
  });

  it('every component in the application resolves to OnPush', () => {
    const eager = COMPONENTS.filter(([, component]) => !isOnPush(component)).map(([name]) => name);
    expect(eager, 'these components are checked eagerly').toEqual([]);
  });

  it('covers every @Component declared under src/app', () => {
    const declared = declaredComponents('src/app');
    const listed = COMPONENTS.map(([name]) => name);

    // Sorted set comparison, so the failure names the component rather than a count delta.
    expect([...listed].sort(), 'register new components in COMPONENTS above').toEqual(
      [...declared].sort(),
    );
    expect(declared.length).toBeGreaterThan(0);
  });
});
