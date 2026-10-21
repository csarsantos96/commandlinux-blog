import test from 'node:test';
import assert from 'node:assert/strict';
import { productionDeployment } from './vercel-event.mjs';
const event = () => ({action:'vercel.deployment.success',client_payload:{environment:'production',project:{id:'prj_blog'},git:{ref:'main',sha:'a'.repeat(40)},alias:['www.commandlinux.dev']}});
test('accepts completed Vercel production deploy and promotion using the actual deployed SHA',()=>{
  const e=event();assert.equal(productionDeployment(e,'prj_blog'),'a'.repeat(40));
  e.action='vercel.deployment.promoted';assert.equal(productionDeployment(e,'prj_blog'),'a'.repeat(40));
});
test('rejects previews, failed/ready builds, other projects, branches and domains',()=>{
  for(const change of [e=>e.action='vercel.deployment.ready',e=>e.action='vercel.deployment.error',e=>e.client_payload.environment='preview',e=>e.client_payload.project.id='prj_other',e=>e.client_payload.git.ref='feature',e=>e.client_payload.alias=['preview.vercel.app'],e=>e.client_payload.git.sha='invalid']) {
    const e=event();change(e);assert.throws(()=>productionDeployment(e,'prj_blog'));
  }
  assert.throws(()=>productionDeployment(event(),''));
});

test('accepts production events without the optional alias field', () => {
  for (const action of ['vercel.deployment.success', 'vercel.deployment.promoted']) {
    const e = event();
    e.action = action;
    delete e.client_payload.alias;
    assert.equal(productionDeployment(e, 'prj_blog'), 'a'.repeat(40));
    e.client_payload.project.id = 'prj_other';
    assert.throws(() => productionDeployment(e, 'prj_blog'));
  }
});

test('rejects malformed or empty aliases when provided', () => {
  for (const alias of [null, [], 'www.commandlinux.dev']) {
    const e = event();
    e.client_payload.alias = alias;
    assert.throws(() => productionDeployment(e, 'prj_blog'));
  }
});
