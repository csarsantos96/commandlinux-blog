import { Redis } from '@upstash/redis';

export function getRedis(): Redis {
  const url =
    process.env.REDIS_KV_REST_API_URL ??
    import.meta.env.REDIS_KV_REST_API_URL;

  const token =
    process.env.REDIS_KV_REST_API_TOKEN ??
    import.meta.env.REDIS_KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      'REDIS_KV_REST_API_URL ou REDIS_KV_REST_API_TOKEN ausente.',
    );
  }

  return new Redis({
    url,
    token,
  });
}