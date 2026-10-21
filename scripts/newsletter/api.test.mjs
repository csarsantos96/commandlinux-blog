import test from 'node:test';
import assert from 'node:assert/strict';
import subscribe from '../../api/newsletter-subscribe.ts';
import confirmation from '../../api/newsletter-confirm.ts';
function response() {
  return { code: 200, headers: {}, body: '', status(n) { this.code=n;return this; }, setHeader(k,v) { this.headers[k]=v;return this; }, end(body='') { this.body=body;return this; } };
}
test('form API rejects unsupported methods, foreign origins and invalid data without provider calls',async()=>{
  for(const [request,status] of [
    [{method:'GET'},405],
    [{method:'POST',headers:{origin:'https://foreign.example',host:'commandlinux.dev'}},403],
    [{method:'POST',body:{email:'bad',language:'pt'}},400],
    [{method:'POST',body:{email:'reader@example.com',language:'xx'}},400],
  ]) {const res=response();await subscribe(request,res);assert.equal(res.code,status);}
});
test('honeypot pretends success without sending',async()=>{
  const res=response();await subscribe({method:'POST',body:{website:'spam'}},res);assert.equal(res.code,200);
});
test('email scanner GET only displays form; malformed tokens are rejected',async()=>{
  const res=response();await confirmation({method:'GET',query:{token:'a'.repeat(64)}},res);
  assert.equal(res.code,200);assert.match(res.body,/<form method="post">/);assert.equal(res.headers['Cache-Control'],'no-store');
  const invalid=response();await confirmation({method:'POST',query:{token:'bad'}},invalid);assert.equal(invalid.code,400);
});
