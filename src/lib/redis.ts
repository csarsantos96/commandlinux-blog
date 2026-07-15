import { Redis } from '@upstash/redis';

const url = import.meta.env.REDIS_KV_REST_API_URL;
const token = import.meta.env.REDIS_KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error('As variáveis do Upstash Redis não foram configuradas.');
}

export const redis = new Redis({
  url,
  token,
});