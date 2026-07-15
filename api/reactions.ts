const REACTIONS = ['fire', 'idea', 'mindblown'] as const;

type Reaction = (typeof REACTIONS)[number];

type RedisResult = {
  result?: number;
  error?: string;
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

function validPostId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-z0-9:/-]{1,180}$/i.test(value)
  );
}

function validVisitorId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-f0-9-]{20,64}$/i.test(value)
  );
}

function validReaction(value: unknown): value is Reaction {
  return (
    typeof value === 'string' &&
    REACTIONS.includes(value as Reaction)
  );
}

async function redis(
  commands: (string | number)[][],
): Promise<RedisResult[]> {
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error('Redis is not configured');
  }

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Redis returned ${response.status}`);
  }

  return response.json() as Promise<RedisResult[]>;
}

function reactionKey(
  postId: string,
  reaction: Reaction,
) {
  return `reactions:${postId}:${reaction}`;
}

export default async function handler(
  request: any,
  response: any,
) {
  if (
    request.method !== 'GET' &&
    request.method !== 'POST'
  ) {
    response.setHeader('Allow', 'GET, POST');

    return json(response, 405, {
      error: 'Method not allowed',
    });
  }

  const postId =
    request.method === 'GET'
      ? request.query?.postId
      : request.body?.postId;

  if (!validPostId(postId)) {
    return json(response, 400, {
      error: 'Invalid postId',
    });
  }

  try {
    if (request.method === 'GET') {
      const commands = REACTIONS.map((reaction) => [
        'SCARD',
        reactionKey(postId, reaction),
      ]);

      const results = await redis(commands);

      const counts = Object.fromEntries(
        REACTIONS.map((reaction, index) => [
          reaction,
          Number(results[index]?.result ?? 0),
        ]),
      );

      return json(response, 200, { counts });
    }

    const {
      reaction,
      action,
      visitorId,
    } = request.body ?? {};

    if (
      !validReaction(reaction) ||
      !['add', 'remove'].includes(action)
    ) {
      return json(response, 400, {
        error: 'Invalid reaction or action',
      });
    }

    if (!validVisitorId(visitorId)) {
      return json(response, 400, {
        error: 'Invalid visitorId',
      });
    }

    /*
     * Remove o visitante de todas as reações do post.
     * Assim ele nunca fica contabilizado em dois emojis.
     */
    const mutationCommands: (string | number)[][] =
      REACTIONS.map((currentReaction) => [
        'SREM',
        reactionKey(postId, currentReaction),
        visitorId,
      ]);

    /*
     * Se ele escolheu uma reação, adicionamos somente
     * na reação atual. Em "remove", fica sem nenhuma.
     */
    if (action === 'add') {
      mutationCommands.push([
        'SADD',
        reactionKey(postId, reaction),
        visitorId,
      ]);
    }

    /*
     * Busca todas as contagens depois da alteração,
     * porque um único clique pode diminuir uma reação
     * e aumentar outra.
     */
    const countCommands: (string | number)[][] =
      REACTIONS.map((currentReaction) => [
        'SCARD',
        reactionKey(postId, currentReaction),
      ]);

    const results = await redis([
      ...mutationCommands,
      ...countCommands,
    ]);

    const countStartIndex = mutationCommands.length;

    const counts = Object.fromEntries(
      REACTIONS.map((currentReaction, index) => [
        currentReaction,
        Number(
          results[countStartIndex + index]?.result ?? 0,
        ),
      ]),
    );

    return json(response, 200, {
      counts,
      selectedReaction:
        action === 'add' ? reaction : null,
    });
  } catch (error) {
    console.error('Reactions API error:', error);

    return json(response, 503, {
      error: 'Reactions are temporarily unavailable',
    });
  }
}