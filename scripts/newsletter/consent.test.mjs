import test from 'node:test';
import assert from 'node:assert/strict';
import { requestConfirmation, confirm, hash, enroll, allowRequest } from '../../lib/newsletter.mjs';
import { normalize, importContact } from '../newsletter-migrate.mjs';
import { assertTestSegment } from './delivery.mjs';
process.env.RESEND_SEGMENT_PT = 'pt';
process.env.RESEND_SEGMENT_EN = 'en';
function store() {
  const map = new Map();
  return { map, get: async k => map.get(k), del: async k => map.delete(k), set: async (k,v,o) => { if(o?.nx && map.has(k)) return null; map.set(k,v); return 'OK'; } };
}
test('confirmation stores only token hash and creates no contact before consent; replay is consumed', async () => {
  const db = store(); const calls = [];
  const api = async (path, method, body) => {
    calls.push({path,method,body});
    if (method === undefined) { const e = new Error(); e.status=404; throw e; }
    return { id: 'ok' };
  };
  await requestConfirmation('test@example.com','en',db,api);
  assert.equal(calls.length,1);
  assert.equal(calls[0].path,'/emails');
  const token = calls[0].body.html.match(/token=([a-f0-9]{64})/)[1];
  assert.ok(db.map.has(`newsletter:confirm:${hash(token)}`));
  assert.ok(!db.map.has(`newsletter:confirm:${token}`));
  await requestConfirmation('test@example.com','en',db,api);
  assert.equal(calls.length,1);
  assert.deepEqual(await confirm(token,db,api), {language:'en',enrolled:true});
  assert.equal(calls.at(-1).path,'/contacts/test%40example.com/segments/en');
  assert.equal(await confirm(token,db,api),null);
});
test('expired confirmation never touches Resend', async () => {
  assert.equal(await confirm('expired',store(),()=>assert.fail()),null);
});
test('failed confirmation email allows an immediate retry', async () => {
  const db = store();
  await assert.rejects(requestConfirmation('retry@example.com', 'pt', db, async () => {
    throw Object.assign(new Error('provider unavailable'), { status: 503 });
  }));
  let sent = false;
  await requestConfirmation('retry@example.com', 'pt', db, async () => { sent = true; });
  assert.equal(sent, true);
});
test('provider failure during enrollment preserves the token for retry', async () => {
  const db = store();
  const token = 'c'.repeat(64);
  const key = `newsletter:confirm:${hash(token)}`;
  await db.set(key, { email: 'retry@example.com', language: 'pt' });
  await assert.rejects(confirm(token, db, async () => {
    throw Object.assign(new Error('restricted key'), { status: 401 });
  }));
  assert.ok(await db.get(key));
  assert.equal(await db.get(`newsletter:enroll:${hash('retry@example.com')}`), undefined);
  assert.deepEqual(await confirm(token, db, async () => ({ unsubscribed: false })), { language: 'pt', enrolled: true });
});
test('global and migrated opt-outs cannot be reactivated', async () => {
  const db = store();
  assert.equal(await enroll('x@example.com','pt',db,async()=>({unsubscribed:true})),false);
  await db.set(`newsletter:legacy:${hash('x@example.com')}`,{status:'unsubscribed'});
  assert.equal(await enroll('x@example.com','en',db,async()=>({unsubscribed:false})),false);
});
test('migration resolves duplicate opt-outs and validates all input before import', () => {
  const base={email:'A@example.com',language:'pt',status:'subscribed'};
  assert.equal(normalize([base,{...base,status:'unsubscribed'}])[0].status,'unsubscribed');
  assert.throws(()=>normalize([base,{...base,language:'xx'}]));
});
test('legacy opt-out removes only blog segments without changing shared contact', async () => {
  const calls=[];
  await importContact({email:'x@example.com',language:'pt',status:'unsubscribed'},store(),async(path,method)=>{calls.push({path,method});return {unsubscribed:false};});
  assert.deepEqual(calls.map(x=>x.method),[undefined,'DELETE','DELETE']);
});
test('test broadcast refuses a list containing anyone else', async () => {
  process.env.NEWSLETTER_TEST_EMAIL='test@example.com';
  await assertTestSegment('pt',async()=>({data:[{email:'test@example.com'}],has_more:false}));
  await assert.rejects(assertTestSegment('pt',async()=>({data:[{email:'other@example.com'}]})));
  await assert.rejects(assertTestSegment('pt',async()=>({data:[{email:'test@example.com'}],has_more:true})));
  delete process.env.NEWSLETTER_TEST_EMAIL;
});
test('abuse throttle rejects the eleventh request',async()=>{
  let count=0; const db={eval:async()=>++count};
  for(let i=0;i<10;i++) assert.equal(await allowRequest('ip',db),true);
  assert.equal(await allowRequest('ip',db),false);
});

test('configuration diagnostics identify missing variable names without exposing secrets', async () => {
  const { validateServerConfig, safeFailure } = await import('../../lib/newsletter.mjs');
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    assert.throws(validateServerConfig, error => {
      const diagnostic = safeFailure(error);
      assert.equal(diagnostic.code, 'NEWSLETTER_CONFIG_MISSING');
      assert.ok(diagnostic.variables.includes('RESEND_API_KEY'));
      return true;
    });
    assert.deepEqual(safeFailure(new Error('secret token and subscriber address')), {code:'NEWSLETTER_SERVICE_ERROR'});
    assert.deepEqual(safeFailure({status:403,message:'private provider body'}), {code:'NEWSLETTER_SERVICE_ERROR',providerStatus:403});
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY=previous;
  }
});

test('newsletter reuses Vercel integration Redis names without mixing database credentials', async () => {
  const { redisConfig } = await import('../../lib/newsletter.mjs');
  assert.deepEqual(redisConfig({REDIS_KV_REST_API_URL:'https://existing',REDIS_KV_REST_API_TOKEN:'write-token'}),{url:'https://existing',token:'write-token'});
  assert.deepEqual(redisConfig({UPSTASH_REDIS_REST_URL:'https://dedicated',UPSTASH_REDIS_REST_TOKEN:'dedicated-token',REDIS_KV_REST_API_TOKEN:'other-token'}),{url:'https://dedicated',token:'dedicated-token'});
  assert.deepEqual(redisConfig({UPSTASH_REDIS_REST_URL:'https://dedicated',REDIS_KV_REST_API_TOKEN:'other-token'}),{url:'https://dedicated',token:undefined});
});
