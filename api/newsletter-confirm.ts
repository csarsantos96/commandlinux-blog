import { confirm, validateServerConfig, safeFailure } from '../lib/newsletter.mjs';
import { renderConfirmationPage } from '../lib/newsletter-views.mjs';
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).setHeader('Allow', 'GET, POST').end();
  const token = req.query?.token;
  const language = req.query?.lang === 'en' ? 'en' : 'pt';
  const page = (state: string, lang = language) => renderConfirmationPage(state, lang);
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).end(page('invalid'));
  // Email scanners may GET the link; only the explicit form POST enrolls.
  if (req.method === 'GET') return res.status(200).end(page('confirm'));
  try {
    validateServerConfig();
    const result = await confirm(token);
    if (!result) return res.status(410).end(page('expired'));
    if (!result.enrolled) return res.status(200).end(page('optedOut', result.language));
    return res.status(200).end(page('success', result.language));
  } catch (error) {
    console.error('Newsletter confirmation failed:', safeFailure(error));
    return res.status(503).end(page('error'));
  }
}
