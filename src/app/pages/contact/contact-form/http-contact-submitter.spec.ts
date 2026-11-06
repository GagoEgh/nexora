import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_ORIGIN } from '../../../core/routing/api-origin';
import type { ContactInquiry } from './contact-submitter';
import { HttpContactSubmitter, rejectedFieldsOf } from './http-contact-submitter';

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

class CapturingErrorHandler implements ErrorHandler {
  readonly errors: unknown[] = [];
  handleError(error: unknown): void {
    this.errors.push(error);
  }
}

describe('HttpContactSubmitter', () => {
  let http: HttpTestingController;
  let errors: CapturingErrorHandler;

  const create = (origin = ORIGIN) => {
    errors = new CapturingErrorHandler();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpContactSubmitter,
        { provide: API_ORIGIN, useValue: origin },
        { provide: ErrorHandler, useValue: errors },
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

  // CT-05. This used to be the one way to fail without leaving a trace: a 200 carrying
  // `success: false` returned 'failed' and told nobody, while every other failure logged.
  it('logs an HTTP 200 that does not report success', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush({ success: false, message: 'queue offline' });
    await expect(pending).resolves.toEqual({ status: 'failed' });

    expect(errors.errors).toHaveLength(1);
    expect(String(errors.errors[0])).toContain('HTTP 200 without success');
    // The body reaches the log, so the reason is recoverable from it.
    expect(String(errors.errors[0])).toContain('queue offline');
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

  // The API answers a rejected field with class-validator's default wording, which always starts
  // with the property name. These bodies are the shape its own `AllExceptionsFilter` writes.
  it('reports which fields the API rejected, in form order', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush(
      {
        success: false,
        statusCode: 400,
        message: [
          'description must be longer than or equal to 1 characters',
          'email must be an email',
        ],
        error: 'Bad Request',
        requestId: 'req-7',
      },
      { status: 400, statusText: 'Bad Request' },
    );

    await expect(pending).resolves.toEqual({
      status: 'failed',
      rejectedFields: ['email', 'description'],
    });
  });

  it('logs the server wording and request id it does not show the visitor', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush(
      {
        success: false,
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
        requestId: 'req-7',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await pending;

    expect(errors.errors).toHaveLength(1);
    const logged = errors.errors[0] as Error;
    expect(logged.message).toContain('email must be an email');
    expect(logged.message).toContain('requestId req-7');
  });

  it('ignores a whitelist complaint, which names no field the visitor can fix', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http
      .expectOne(`${ORIGIN}${PATH}`)
      .flush(
        { success: false, statusCode: 400, message: ['property nickname should not exist'] },
        { status: 400, statusText: 'Bad Request' },
      );

    // Drift between the two repositories, not something to pin on a control: a generic failure.
    await expect(pending).resolves.toEqual({ status: 'failed' });
  });

  it('reports no fields when the API sends a single message rather than a validation list', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush(
      {
        success: false,
        statusCode: 503,
        message: 'The message could not be stored right now. Please try again shortly.',
      },
      { status: 503, statusText: 'Service Unavailable' },
    );

    await expect(pending).resolves.toEqual({ status: 'failed' });
  });

  // The coalescing latch used to be unkeyed, so a second call with *different* data received the
  // first call's result and was never sent at all.
  it('does not hand a different inquiry the result of the send already in flight', async () => {
    const submitter = create();

    const first = submitter.submit(inquiry);
    const second = submitter.submit({ ...inquiry, email: 'grace@example.com' });

    const requests = http.match(`${ORIGIN}${PATH}`);
    expect(requests).toHaveLength(2);
    expect(requests.map((request) => (request.request.body as ContactInquiry).email)).toEqual([
      'ada@example.com',
      'grace@example.com',
    ]);

    requests[0].flush({ success: true });
    requests[1].flush({ success: false }, { status: 400, statusText: 'Bad Request' });

    await expect(first).resolves.toEqual({ status: 'sent' });
    await expect(second).resolves.toEqual({ status: 'failed' });
  });

  // `FetchBackend.parseBody` returns the raw text when a non-2xx body is not JSON, rather than
  // throwing - so an HTML error page from a proxy arrives as a string where an object is
  // expected. This is the realistic production shape when the API is not reached at all.
  it('survives an error body that is not JSON at all', async () => {
    const submitter = create();
    const pending = submitter.submit(inquiry);

    http.expectOne(`${ORIGIN}${PATH}`).flush('<html><body><h1>502 Bad Gateway</h1></body></html>', {
      status: 502,
      statusText: 'Bad Gateway',
    });

    await expect(pending).resolves.toEqual({ status: 'failed' });
    expect(errors.errors).toHaveLength(1);
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

describe('rejectedFieldsOf', () => {
  it('reads the field out of each class-validator message', () => {
    expect(
      rejectedFieldsOf([
        'name must be longer than or equal to 1 characters',
        'company must be shorter than or equal to 160 characters',
      ]),
    ).toEqual(['name', 'company']);
  });

  it('drops fields this form has nowhere to show an error', () => {
    // `interest` and `method` are chip groups, `timeline` and `budget` selects with no error slot,
    // and `website` is the honeypot - hidden and out of the tab order. Their accepted values are
    // pinned by `contact-contract.spec.ts`, so a rejection means the two repositories have
    // drifted: a developer's problem, and focusing a control the visitor cannot see would trap
    // them with no way to proceed.
    expect(
      rejectedFieldsOf([
        'interest must be one of the following values: new-project',
        'website must be a string',
        'timeline must be one of the following values: asap',
        'method must be one of the following values: email',
        'email must be an email',
      ]),
    ).toEqual(['email']);
  });

  it('never reports the same field twice, however many rules it broke', () => {
    expect(
      rejectedFieldsOf(['email must be an email', 'email must be shorter than or equal to 254']),
    ).toEqual(['email']);
  });

  it('returns nothing for a string, a missing message or an empty list', () => {
    expect(rejectedFieldsOf('Malformed JSON body.')).toEqual([]);
    expect(rejectedFieldsOf(undefined)).toEqual([]);
    expect(rejectedFieldsOf([])).toEqual([]);
  });

  it('does not match a field name that merely appears later in the sentence', () => {
    // Only the leading word is the property. A message that mentions another field in its list of
    // accepted values must not be attributed to it.
    expect(rejectedFieldsOf(['service must not equal name or company'])).toEqual(['service']);
  });
});
