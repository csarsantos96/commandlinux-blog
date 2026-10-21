import test from 'node:test';
import assert from 'node:assert/strict';
import { deliver } from './delivery.mjs';
import { renderNewsletter } from './template.mjs';
const post = { language: 'pt', url: 'https://commandlinux.dev/posts/test/', title: 'Title', description: 'Summary', date: new Date(), category: 'Linux', tags: [] };
function store() { const values = new Map(); return { get: async k => values.get(k), del: async k => values.delete(k), set: async (k, v, options) => { if (options?.nx && values.has(k)) return null; values.set(k, v); return 'OK'; } }; }
test('durable claim prevents duplicates across concurrent deliveries', async () => {
  process.env.RESEND_SEGMENT_PT = 'pt-only';
  const db = store(); let calls = 0;
  const api = async (path, method, body) => { calls++; assert.equal(body.segment_id, 'pt-only'); assert.equal(body.send, true); assert.match(body.html, /RESEND_UNSUBSCRIBE_URL/); return { id: 'broadcast' }; };
  await Promise.allSettled([deliver(post, db, api), deliver(post, db, api)]);
  assert.equal(await deliver(post, db, api), false);
  assert.equal(calls, 1);
});
test('ambiguous API failure is not retried on replay', async () => {
  const db = store(); let calls = 0;
  const api = async () => { calls++; throw new Error('timeout'); };
  await assert.rejects(deliver(post, db, api));
  await assert.rejects(deliver(post, db, api), /Reconcile/);
  assert.equal(calls, 1);
});
test('both languages render native unsubscribe placeholder', () => {
  assert.match(renderNewsletter(post), /Cancelar inscrição/);
  assert.match(renderNewsletter({ ...post, language: 'en' }), /Unsubscribe/);
});

test('campaign name fits the Resend limit and remains stable per article', async () => {
  process.env.RESEND_SEGMENT_EN = 'en-only';
  const names = [];
  const api = async (path, method, body) => { names.push(body.name); return { id: 'ok' }; };
  await deliver(post, store(), api);
  await deliver(post, store(), api);
  await deliver({ ...post, language: 'en' }, store(), api);
  assert.equal(names[0].length, 64);
  assert.equal(names[0], names[1]);
  assert.notEqual(names[0], names[2]);
});
test('explicit validation rejection releases claim for a corrected retry', async () => {
  const db = store();
  await assert.rejects(deliver(post, db, async () => {
    throw Object.assign(new Error('validation'), { status: 422 });
  }));
  assert.equal(await deliver(post, db, async () => ({ id: 'ok' })), true);
  assert.equal(await deliver(post, db, async () => assert.fail('duplicate')), false);
});
