const REACTIONS = ['fire', 'idea', 'mindblown'] as const;

type Reaction = (typeof REACTIONS)[number];

function json(response: any, status: number, body: unknown) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function validPostId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9:/-]{1,180}$/i.test(value);
}

async function redis(commands: (string | number)[][]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) throw new Error('Redis is not configured');

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) throw new Error(`Redis returned ${response.status}`);
  return response.json() as Promise<{ result?: number; error?: string }[]>;
}

function reactionKey(postId: string, reaction: Reaction) {
  return `reactions:${postId}:${reaction}`;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return json(response, 405, { error: 'Method not allowed' });
  }

  const postId = request.method === 'GET' ? request.query?.postId : request.body?.postId;
  if (!validPostId(postId)) return json(response, 400, { error: 'Invalid postId' });

  try {
    if (request.method === 'GET') {
      const results = await redis(REACTIONS.map((reaction) => ['SCARD', reactionKey(postId, reaction)]));
      return json(response, 200, {
        counts: Object.fromEntries(REACTIONS.map((reaction, index) => [reaction, Number(results[index]?.result ?? 0)])),
      });
    }

    const { reaction, action, visitorId } = request.body ?? {};
    if (!REACTIONS.includes(reaction) || !['add', 'remove'].includes(action)) {
      return json(response, 400, { error: 'Invalid reaction or action' });
    }
    if (typeof visitorId !== 'string' || !/^[a-f0-9-]{20,64}$/i.test(visitorId)) {
      return json(response, 400, { error: 'Invalid visitorId' });
    }

    const key = reactionKey(postId, reaction);
    const command = action === 'add' ? 'SADD' : 'SREM';
    const results = await redis([[command, key, visitorId], ['SCARD', key]]);

    return json(response, 200, {
      reaction,
      count: Number(results[1]?.result ?? 0),
      selected: action === 'add',
    });
  } catch (error) {
    console.error('Reactions API error:', error);
    return json(response, 503, { error: 'Reactions are temporarily unavailable' });
  }
}
