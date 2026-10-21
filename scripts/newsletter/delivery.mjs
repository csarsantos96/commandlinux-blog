import { hash, sender, segment, resend } from '../../lib/newsletter.mjs';
import { renderNewsletter } from './template.mjs';
export const articleKey = post => `newsletter:article:${hash(post.language + '\n' + post.url)}`;
export async function assertTestSegment(language, api = resend) {
  const expected = process.env.NEWSLETTER_TEST_EMAIL?.trim().toLowerCase();
  if (!expected) throw new Error('Set NEWSLETTER_TEST_EMAIL to the authorized address');
  const result = await api(`/segments/${segment(language)}/contacts?limit=100`);
  if (result.has_more || result.data?.length !== 1 || result.data[0].email?.toLowerCase() !== expected || result.data[0].unsubscribed) {
    throw new Error('Test segment must contain only the authorized subscribed address');
  }
}
export async function deliver(post, db, api = resend) {
  const segmentId = segment(post.language);
  const key = articleKey(post);
  // Permanent claim, without TTL: ambiguous failures require reconciliation.
  if (!await db.set(key, { status: 'claimed', at: new Date().toISOString() }, { nx: true })) {
    const state = await db.get(key);
    if (!['sent', 'baseline'].includes(state?.status)) throw new Error(`Reconcile unresolved delivery: ${key}`);
    return false;
  }
  let result;
  try {
    result = await api('/broadcasts', 'POST', {
      segment_id: segmentId, from: sender(),
      subject: `Command Linux — ${post.title}`, html: renderNewsletter(post),
      // Resend limits campaign names to 70 characters; retain the full digest.
      name: hash(post.language + '\n' + post.url), send: true,
    });
  } catch (error) {
    // A validation rejection did not create a campaign. Other failures may be
    // ambiguous and must keep their permanent claim to prevent duplicate sends.
    if (error?.status === 422) await db.del(key);
    throw error;
  }
  if (!result?.id) throw new Error(`Missing broadcast ID; reconcile ${key}`);
  await db.set(key, { status: 'sent', id: result.id });
  return true;
}
