import { requestConfirmation, allowRequest, validateServerConfig, safeFailure } from '../lib/newsletter.mjs';

function json(
  response: any,
  status: number,
  body: unknown,
) {
  response
    .status(status)
    .setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function validEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function validLanguage(
  value: unknown,
): value is 'pt' | 'en' {
  return value === 'pt' || value === 'en';
}

function allowedOrigin(
  value: unknown,
  host: unknown,
) {
  if (typeof value !== 'string') return true;

  try {
    const url = new URL(value);

    const requestHost =
      typeof host === 'string'
        ? host.split(':')[0]
        : '';

    return (
      url.hostname === requestHost ||
      url.hostname === 'commandlinux.dev' ||
      url.hostname === 'www.commandlinux.dev' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

export default async function handler(
  request: any,
  response: any,
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');

    return json(response, 405, {
      error: 'Method not allowed',
    });
  }

  if (
    !allowedOrigin(
      request.headers?.origin,
      request.headers?.host,
    )
  ) {
    return json(response, 403, {
      error: 'Invalid origin',
    });
  }

  const { email, language, website } =
    request.body ?? {};

  // Honeypot for basic bot submissions.
  if (website) {
    return json(response, 200, { ok: true });
  }

  if (
    !validEmail(email) ||
    !validLanguage(language)
  ) {
    return json(response, 400, {
      error: 'Invalid subscription data',
    });
  }

  try {
    validateServerConfig();
    const ip = request.headers?.['x-vercel-forwarded-for'] || request.socket?.remoteAddress || 'unknown';
    if (!await allowRequest(String(ip))) return json(response, 429, { error: 'Please retry later' });
    await requestConfirmation(email.trim().toLowerCase(), language);

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error(
      'Newsletter subscription failed:',
      safeFailure(error),
    );

    return json(response, 503, {
      error: 'Newsletter is temporarily unavailable',
    });
  }
}
