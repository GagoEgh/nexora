import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_ORIGIN } from '../../../core/routing/api-origin';
import type { ContactInquiry } from './contact-submitter';
import { HttpContactSubmitter } from './http-contact-submitter';

const ORIGIN = 'https://api.test.invalid';
const PATH = '/api/contact';

const inquiry: ContactInquiry = {
  interest: 'new-project',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Nexora',
  service: 'software-engineering',
  description: 'Modernising a legacy ordering platform.',
  timeline: '',
  budget: '',
  method: 'email',
  website: '',
};

describe('HttpContactSubmitter', () => {
  let http: HttpTestingController;

  const create = (origin = ORIGIN) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpContactSubmitter,
        { provide: API_ORIGIN, useValue: origin },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(HttpContactSubmitter);
  };

  afterEach(() => {
    http?.verify();
    TestBed.resetTestingModule();
  });

  it('posts the inquiry to /api/contact on the configured origin', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    const request: TestRequest = http.expectOne(`${ORIGIN}${PATH}`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(inquiry);

    request.flush({ success: true, message: 'Your message has been submitted.' });
    await expect(pending).resolves.toEqual({ status: 'sent' });
  });

  it('reports a failure when the API says the send did not succeed', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush({ success: false });
    await expect(pending).resolves.toEqual({ status: 'failed' });
  });

  it('never reports success when the provider is unavailable', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http
      .expectOne(`${ORIGIN}${PATH}`)
      .flush({ success: false }, { status: 503, statusText: 'Service Unavailable' });

    await expect(pending).resolves.toEqual({ status: 'failed' });
  });

  it('reports a failure when the request never reaches the API', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).error(new ProgressEvent('error'));
    await expect(pending).resolves.toEqual({ status: 'failed' });
  });

  it('stays not-configured, and sends nothing, when no origin is set', async () => {
    const submitter = create('');

    await expect(submitter.submit(inquiry)).resolves.toEqual({ status: 'not-configured' });
    http.expectNone(() => true);
  });

  // The form disables its button while a send is in flight, but that only guards the button.
  // Delivering the same inquiry twice is the failure this prevents.
  it('coalesces a second submission into the send already in flight', async () => {
    const submitter = create();

    const first = submitter.submit(inquiry);
    const second = submitter.submit(inquiry);

    // `expectOne` fails the test if a second request was opened.
    http.expectOne(`${ORIGIN}${PATH}`).flush({ success: true });

    await expect(first).resolves.toEqual({ status: 'sent' });
    await expect(second).resolves.toEqual({ status: 'sent' });
  });

  it('accepts a new submission once the previous one has settled', async () => {
    const submitter = create();

    const failed = submitter.submit(inquiry);
    http.expectOne(`${ORIGIN}${PATH}`).error(new ProgressEvent('error'));
    await expect(failed).resolves.toEqual({ status: 'failed' });

    // A failed send must not latch the guard shut - retrying is the expected next action.
    const retried = submitter.submit(inquiry);
    http.expectOne(`${ORIGIN}${PATH}`).flush({ success: true });
    await expect(retried).resolves.toEqual({ status: 'sent' });
  });
});
