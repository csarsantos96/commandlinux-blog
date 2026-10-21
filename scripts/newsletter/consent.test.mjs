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
