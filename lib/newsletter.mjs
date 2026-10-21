import { createHash, randomBytes } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { renderConfirmationEmail, confirmationText } from './newsletter-views.mjs';

export const hash = (value) => createHash('sha256').update(value).digest('hex');
export function redisConfig(env = process.env) {
  // Prefer a dedicated newsletter database. Never mix credentials from two pairs.
  const dedicated = !!(env.UPSTASH_REDIS_REST_URL || env.UPSTASH_REDIS_REST_TOKEN);
  return dedicated
    ? { url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }
    : { url: env.REDIS_KV_REST_API_URL, token: env.REDIS_KV_REST_API_TOKEN };
}
export const redis = () => new Redis(redisConfig());
export const sender = () => process.env.NEWSLETTER_FROM || 'Command Linux <newsletter@commandlinux.dev>';
export function segment(language) {
  if (!['pt', 'en'].includes(language)) throw new Error('Invalid language');
  const value = process.env[`RESEND_SEGMENT_${language.toUpperCase()}`];
  if (!value || process.env.RESEND_SEGMENT_PT === process.env.RESEND_SEGMENT_EN) throw new Error('Configure distinct language segments');
  return encodeURIComponent(value);
}

// Report variable names only, never values. Called before touching external services.
export function validateServerConfig() {
  const required = ['RESEND_API_KEY', 'RESEND_SEGMENT_PT', 'RESEND_SEGMENT_EN'];
  const missing = required.filter(name => !process.env[name]?.trim());
  const config = redisConfig();
  const dedicated = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!config.url?.trim()) missing.push(dedicated ? 'UPSTASH_REDIS_REST_URL' : 'REDIS_KV_REST_API_URL');
  if (!config.token?.trim()) missing.push(dedicated ? 'UPSTASH_REDIS_REST_TOKEN' : 'REDIS_KV_REST_API_TOKEN');
  if (missing.length) {
    const error = new Error('Newsletter server configuration missing');
    error.code = 'NEWSLETTER_CONFIG_MISSING';
    error.variables = missing;
    throw error;
  }
  if (process.env.RESEND_SEGMENT_PT === process.env.RESEND_SEGMENT_EN) {
    const error = new Error('Newsletter segments must be distinct');
    error.code = 'NEWSLETTER_SEGMENTS_INVALID';
    throw error;
  }
}
export function safeFailure(error) {
  if (error?.code === 'NEWSLETTER_CONFIG_MISSING') return { code: error.code, variables: error.variables };
  if (error?.code === 'NEWSLETTER_SEGMENTS_INVALID') return { code: error.code };
  // Never log provider bodies, messages, URLs, credentials or subscriber data.
  return { code: 'NEWSLETTER_SERVICE_ERROR', ...(Number.isInteger(error?.status) ? { providerStatus: error.status } : {}), ...(['contacts', 'broadcasts', 'emails'].includes(error?.operation) ? { operation: error.operation } : {}) };
}

// Pace sequential calls; 429 is a rejected request and may safely be retried.
let lastRequest = 0;
export async function resend(path, method = 'GET', body, key) {
  if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 600 - (Date.now() - lastRequest))));
    lastRequest = Date.now();
    const response = await fetch(`https://api.resend.com${path}`, {
      method, headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...(key ? { 'Idempotency-Key': key } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
    });
    if (response.status === 429 && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, Math.min(10000, Math.max(1000, Number(response.headers.get('retry-after')) * 1000 || 1000))));
      continue;
    }
    if (!response.ok) {
      // Never include response bodies, addresses, tokens or request URLs in logs.
      const error = new Error(`Resend ${method} failed: ${response.status}`);
      error.status = response.status;
      error.operation = path.startsWith('/contacts') ? 'contacts' : path.startsWith('/broadcasts') ? 'broadcasts' : 'emails';
      throw error;
    }
    const raw = await response.text();
    return raw ? JSON.parse(raw) : null;
  }
}
export async function contact(email, api = resend) {
  try { return await api(`/contacts/${encodeURIComponent(email)}`); }
  catch (error) { if (error.status === 404) return null; throw error; }
}
export async function removeSegment(email, language, api = resend) {
  try { await api(`/contacts/${encodeURIComponent(email)}/segments/${segment(language)}`, 'DELETE'); }
  catch (error) { if (error.status !== 404) throw error; }
}
export async function enroll(email, language, db = redis(), api = resend) {
  segment(language);
  const legacy = await db.get(`newsletter:legacy:${hash(email)}`);
  const existing = await contact(email, api);
  // Preserve opt-outs; touch only the blog's dedicated segments in this shared account.
  if (existing?.unsubscribed || legacy?.status === 'unsubscribed') return false;
  if (!existing) await api('/contacts', 'POST', { email, unsubscribed: false });
  await removeSegment(email, language === 'pt' ? 'en' : 'pt', api);
  await api(`/contacts/${encodeURIComponent(email)}/segments/${segment(language)}`, 'POST');
  return true;
}
export async function requestConfirmation(email, language, db = redis(), api = resend) {
  segment(language);
  if (process.env.NEWSLETTER_TEST_EMAIL && email !== process.env.NEWSLETTER_TEST_EMAIL.trim().toLowerCase()) return;
  const digest = hash(email);
  if (!await db.set(`newsletter:rate:${digest}`, '1', { nx: true, ex: 300 })) return;
  const token = randomBytes(32).toString('hex');
  await db.set(`newsletter:confirm:${hash(token)}`, { email, language }, { ex: 86400 });
  const url = new URL('/api/newsletter-confirm', process.env.NEWSLETTER_SITE_URL || 'https://www.commandlinux.dev');
  url.searchParams.set('token', token);
  url.searchParams.set('lang', language);
  const label = language === 'en' ? 'Confirm subscription' : 'Confirmar inscrição';
  try {
    await api('/emails', 'POST', { from: sender(), to: [email], subject: `Command Linux — ${label}`, html: renderConfirmationEmail(url.href, language), text: confirmationText(url.href, language) }, `confirm-${hash(token)}`);
  } catch (error) {
    // A failed send must not block the reader's next request for five minutes.
    await db.del(`newsletter:rate:${digest}`);
    throw error;
  }
}
export async function confirm(token, db = redis(), api = resend) {
  const key = `newsletter:confirm:${hash(token)}`;
  const pending = await db.get(key);
  if (!pending) return null;
  // Serializes all confirmations for this email, including different tokens/languages.
  const lock = `newsletter:enroll:${hash(pending.email)}`;
  if (!await db.set(lock, '1', { nx: true, ex: 180 })) throw new Error('Confirmation busy');
  try {
    if (!await db.get(key)) return null;
    const enrolled = await enroll(pending.email, pending.language, db, api);
    await db.del(key);
    return { language: pending.language, enrolled };
  } finally { await db.del(lock); }
}
export async function allowRequest(ip, db = redis()) {
  // Atomic fixed windows with expiry, no raw IP stored. Fail closed on Redis errors.
  return Number(await db.eval(`local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n`, [`newsletter:ip:${hash(ip)}:${Math.floor(Date.now() / 600000)}`], [])) <= 10;
}
