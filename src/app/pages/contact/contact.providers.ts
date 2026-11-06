import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ContactSubmitter } from './contact-form/contact-submitter';
import { HttpContactSubmitter } from './contact-form/http-contact-submitter';

export function provideContactForm(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ContactSubmitter, useClass: HttpContactSubmitter }]);
}
