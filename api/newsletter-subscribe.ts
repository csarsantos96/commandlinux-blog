const REACH_API =
  'https://developers.hostinger.com/api/reach/v1';

type ReachContact = {
  uuid?: string;
  email?: string;
};

type ReachTag = {
  uuid?: string;
  value?: string;
};

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

async function reach(
  path: string,
  token: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
) {
  const result = await fetch(
    `${REACH_API}${path}`,
    {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(options.body
        ? { body: JSON.stringify(options.body) }
        : {}),
      signal: AbortSignal.timeout(15_000),
    },
  );

  const raw = await result.text();
  let body: any = null;

  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  }

  if (!result.ok) {
    const error = new Error(
      `Reach returned ${result.status}`,
    ) as Error & { status?: number };

    error.status = result.status;
    throw error;
  }

  return body;
}

function items<T>(response: any): T[] {
  if (Array.isArray(response)) return response;

  return Array.isArray(response?.data)
    ? response.data
    : [];
}

async function findContact(
  profileUuid: string,
  token: string,
  email: string,
) {
  const response = await reach(
    `/profiles/${encodeURIComponent(profileUuid)}/contacts?search=${encodeURIComponent(email)}&per_page=25`,
    token,
  );

  return (
    items<ReachContact>(response).find(
      (contact) =>
        contact.email?.toLowerCase() ===
        email.toLowerCase(),
    ) ?? null
  );
}

async function findOrCreateContact(
  profileUuid: string,
  token: string,
  email: string,
) {
  let contact = await findContact(
    profileUuid,
    token,
    email,
  );

  if (contact?.uuid) return contact;

  try {
    await reach(
      `/profiles/${encodeURIComponent(profileUuid)}/contacts`,
      token,
      {
        method: 'POST',
        body: { email },
      },
    );
  } catch (error) {
    // A simultaneous request may already have created it.
    if ((error as any)?.status !== 422) {
      throw error;
    }
  }

  for (const delay of [100, 300, 700]) {
    await new Promise((resolve) =>
      setTimeout(resolve, delay),
    );

    contact = await findContact(
      profileUuid,
      token,
      email,
    );

    if (contact?.uuid) return contact;
  }

  throw new Error(
    'Reach did not return the created contact.',
  );
}

async function findOrCreateTag(
  profileUuid: string,
  token: string,
  language: 'pt' | 'en',
) {
  const name = `newsletter-${language}`;
  const response = await reach(
    `/profiles/${encodeURIComponent(profileUuid)}/tags`,
    token,
    {
      method: 'POST',
      body: { names: [name] },
    },
  );

  const tag = items<ReachTag>(response).find(
    (item) => item.value === name,
  );

  if (!tag?.uuid) {
    throw new Error(
      'Reach did not return the language tag.',
    );
  }

  return tag;
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

  const token =
    process.env.HOSTINGER_REACH_API_TOKEN;
  const profileUuid =
    process.env.HOSTINGER_REACH_PROFILE_UUID;

  if (!token || !profileUuid) {
    console.error(
      'Newsletter subscription is not configured.',
    );

    return json(response, 503, {
      error: 'Newsletter is temporarily unavailable',
    });
  }

  try {
    const [contact, tag] = await Promise.all([
      findOrCreateContact(
        profileUuid,
        token,
        email.toLowerCase(),
      ),
      findOrCreateTag(
        profileUuid,
        token,
        language,
      ),
    ]);

    await reach(
      `/profiles/${encodeURIComponent(profileUuid)}/tags/${encodeURIComponent(tag.uuid!)}/contacts/${encodeURIComponent(contact.uuid!)}`,
      token,
      { method: 'POST' },
    );

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error(
      'Newsletter subscription failed:',
      (error as Error).message,
    );

    return json(response, 503, {
      error: 'Newsletter is temporarily unavailable',
    });
  }
}
