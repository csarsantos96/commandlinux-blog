// Input: reviewed, lossless normalized Reach export. Original export stays untouched.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { contact, enroll, removeSegment, resend, redis, hash } from '../lib/newsletter.mjs';
export function normalize(rows) {
  if (!Array.isArray(rows)) throw new Error('Expected array');
  const merged = new Map();
  for (const row of rows) {
    if (typeof row?.email !== 'string' || row.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim()) || !['pt', 'en'].includes(row.language) || !['subscribed', 'unsubscribed', 'pending'].includes(row.status)) throw new Error('Invalid export; no writes performed');
    const email = row.email.trim().toLowerCase();
    const old = merged.get(email);
    if (old && old.language !== row.language) throw new Error('Resolve conflicting language before import');
    const priority = { subscribed: 0, pending: 1, unsubscribed: 2 };
    if (!old || priority[row.status] > priority[old.status]) merged.set(email, { ...row, email });
  }
  return [...merged.values()];
}
export async function importContact(row, db, api = resend) {
  const key = `newsletter:legacy:${hash(row.email)}`;
  const previous = await db.get(key);
  // An older export must not undo an already imported opt-out.
  if (previous?.status === 'unsubscribed') row = { ...row, status: 'unsubscribed' };
  await db.set(key, row);
  const existing = await contact(row.email, api);
  if (row.status === 'subscribed') await enroll(row.email, row.language, db, api);
  else {
    // Do not alter another project's global contact status in the shared account.
    if (!existing && row.status === 'unsubscribed') await api('/contacts', 'POST', { email: row.email, unsubscribed: true });
    if (existing) for (const language of ['pt', 'en']) await removeSegment(row.email, language, api);
  }
}
async function main() {
  const rows = normalize(JSON.parse(await readFile(process.argv[2], 'utf8')));
  console.log(`Validated ${rows.length} unique contacts.`);
  if (!process.argv.includes('--apply')) return console.log('Dry run; no writes. Use --apply only after pausing Reach.');
  if (process.env.NEWSLETTER_ENABLED === 'true') throw new Error('Disable newsletter sends before migration');
  const db = redis();
  for (const row of rows) await importContact(row, db);
  console.log('Import complete. Reconcile counts/statuses before enabling sends.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(() => { console.error('Migration failed; review configuration/export. No contact data logged.'); process.exitCode = 1; });
