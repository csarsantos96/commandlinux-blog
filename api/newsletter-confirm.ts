import { confirm, validateServerConfig, safeFailure } from '../lib/newsletter.mjs';
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'none'; form-action 'self'; frame-ancestors 'none'");
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).setHeader('Allow', 'GET, POST').end();
  const token = req.query?.token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).end('Link inválido / Invalid link');
  // Email scanners may GET the link; only the explicit form POST enrolls.
  if (req.method === 'GET') return res.status(200).end('<!doctype html><html lang="pt"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Command Linux</title><h1>Command Linux</h1><form method="post"><button>Confirmar inscrição / Confirm subscription</button></form></html>');
  try {
    validateServerConfig();
    const result = await confirm(token);
    if (!result) return res.status(410).end('Link expirado ou já utilizado / Link expired or already used');
    if (!result.enrolled) return res.status(200).end('Cancelamento anterior preservado / Previous unsubscribe preserved');
    return res.status(200).end(result.language === 'en' ? 'Subscription confirmed.' : 'Inscrição confirmada.');
  } catch (error) {
    console.error('Newsletter confirmation failed:', safeFailure(error));
    return res.status(503).end('Tente novamente / Please retry');
  }
}
