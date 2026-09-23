import { createHash } from 'node:crypto';

const API_BASE =
  'https://developers.hostinger.com/api/reach/v1';

export class ReachError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ReachError';
    this.status = status;
  }
}

export function getReachConfig(env = process.env) {
  const config = {
    token: env.HOSTINGER_REACH_API_TOKEN,
    profileUuid:
      env.HOSTINGER_REACH_PROFILE_UUID,
    senderEmail:
      env.HOSTINGER_REACH_SENDER_EMAIL,
    senderName:
      env.HOSTINGER_REACH_SENDER_NAME,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      `Missing Reach configuration: ${missing.join(', ')}`,
    );
  }

  return config;
}

export async function reachRequest(
  apiPath,
  {
    token,
    method = 'GET',
    body,
    fetchImpl = fetch,
  },
) {
  const response = await fetchImpl(
    `${API_BASE}${apiPath}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(body
        ? { body: JSON.stringify(body) }
        : {}),
      signal: AbortSignal.timeout(20_000),
    },
  );

  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === 'string'
        ? data
        : JSON.stringify(data);

    throw new ReachError(
      `Reach API ${method} ${apiPath} returned ${response.status}: ${detail.slice(0, 500)}`,
      response.status,
    );
  }

  return data;
}

function list(value) {
  if (Array.isArray(value)) return value;

  return Array.isArray(value?.data)
    ? value.data
    : [];
}

function uuid(value) {
  const resource = value?.data ?? value;

  if (
    typeof resource?.uuid !== 'string' ||
    !resource.uuid
  ) {
    throw new Error(
      'Reach response did not include a UUID.',
    );
  }

  return resource.uuid;
}

function resourceNames(post) {
  const key = createHash('sha256')
    .update(`${post.language}\n${post.url}`)
    .digest('hex')
    .slice(0, 16);

  const prefix =
    `CommandLinux newsletter [${post.language}:${key}]`;

  return {
    prefix,
    templateTitle: prefix,
    campaignTitle:
      `${prefix} ${post.title}`.slice(0, 255),
  };
}

async function findCampaign(config, prefix) {
  for (let page = 1; page <= 100; page += 1) {
    const response = await reachRequest(
      `/profiles/${encodeURIComponent(config.profileUuid)}/campaigns?type=campaign&sort_direction=desc&page=${page}&per_page=25`,
      config,
    );

    const campaigns = list(response);
    const found = campaigns.find(
      (campaign) =>
        campaign?.title?.startsWith(prefix),
    );

    if (found) return found;
    if (campaigns.length < 25) return null;
  }

  throw new Error(
    'Campaign lookup exceeded 100 pages.',
  );
}

async function findTemplate(config, title) {
  const response = await reachRequest(
    `/profiles/${encodeURIComponent(config.profileUuid)}/templates`,
    config,
  );

  return (
    list(response).find(
      (template) => template?.title === title,
    ) ?? null
  );
}

export async function createArticleDraft(
  post,
  html,
  config,
) {
  const names = resourceNames(post);
  const existingCampaign = await findCampaign(
    config,
    names.prefix,
  );

  if (existingCampaign) {
    return {
      created: false,
      campaign: existingCampaign,
    };
  }

  let template = await findTemplate(
    config,
    names.templateTitle,
  );

  if (!template) {
    template = await reachRequest(
      `/profiles/${encodeURIComponent(config.profileUuid)}/templates`,
      {
        ...config,
        method: 'POST',
        body: {
          title: names.templateTitle,
          template_content: html,
        },
      },
    );
  }

  const campaign = await reachRequest(
    `/profiles/${encodeURIComponent(config.profileUuid)}/campaigns`,
    {
      ...config,
      method: 'POST',
      body: {
        sender_name: config.senderName,
        sender_email: config.senderEmail,
        title: names.campaignTitle,
        subject: `CommandLinux — ${post.title}`,
        template_uuid: uuid(template),
      },
    },
  );

  return {
    created: true,
    campaign: campaign?.data ?? campaign,
  };
}

export async function listProfiles(token) {
  return reachRequest('/profiles', { token });
}
