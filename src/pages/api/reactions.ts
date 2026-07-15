import type { APIRoute } from 'astro';
import { redis } from '../../lib/redis';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug, emoji } = await request.json();

    if (!slug || !emoji) {
      return Response.json(
        { error: 'Slug e emoji são obrigatórios' },
        { status: 400 },
      );
    }

    const key = `reactions:${slug}`;
    const count = await redis.hincrby(key, emoji, 1);

    return Response.json({
      emoji,
      count,
    });
  } catch (error) {
    console.error('Erro ao registrar reação:', error);

    return Response.json(
      { error: 'Não foi possível registrar a reação' },
      { status: 500 },
    );
  }
};