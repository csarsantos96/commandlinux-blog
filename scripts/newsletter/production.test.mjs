import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { publishProduction } from './production.mjs';
process.env.RESEND_SEGMENT_PT='pt';
process.env.RESEND_SEGMENT_EN='en';
const source = (title, draft=false) => `---\ntitle: ${title}\ndescription: Summary\ncategory: Linux\ndate: 2026-10-21\ndraft: ${draft}\n---\n`;
test('production baseline, retry, edits, old draft toggles, rollback and new post',async()=>{
  const cwd=await mkdtemp(path.join(os.tmpdir(),'newsletter-prod-'));
  const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
  const map=new Map(); const db={get:async k=>map.get(k),set:async(k,v,o)=>{if(o?.nx&&map.has(k))return null;map.set(k,v);return 'OK';}};
  let sends=0; const api=async()=>{sends++;return {id:`broadcast-${sends}`};};
  try {
    git('init','-q');git('config','user.email','test@example.com');git('config','user.name','Test');
    await mkdir(path.join(cwd,'src/content/posts'),{recursive:true});
    const write=async(name,title,draft)=>writeFile(path.join(cwd,`src/content/posts/${name}.md`),source(title,draft));
    const commit=()=>{git('add','.');git('commit','-qm','post');return git('rev-parse','HEAD');};
    await write('old','Old'); const first=commit();
    await publishProduction(first,db,{cwd,api}); assert.equal(sends,0);
    await write('old','Old edited');const edit=commit();
    await publishProduction(edit,db,{cwd,api});assert.equal(sends,0);
    await write('old','Old edited',true);await publishProduction(commit(),db,{cwd,api});
    await write('old','Old edited',false);await publishProduction(commit(),db,{cwd,api});assert.equal(sends,0);
    await write('new','New');const next=commit();
    await publishProduction(next,db,{cwd,api});assert.equal(sends,1);
    await publishProduction(next,db,{cwd,api});assert.equal(sends,1);
    await publishProduction(first,db,{cwd,api});assert.equal(map.get('newsletter:production-sha'),next);
    await write('third','Third');const third=commit();
    await assert.rejects(publishProduction(third,db,{cwd,api:async()=>{throw new Error('timeout');}}));
    await assert.rejects(publishProduction(third,db,{cwd,api}),/Reconcile/);
    assert.equal(map.get('newsletter:production-sha'),next);assert.equal(sends,1);
  } finally {await rm(cwd,{recursive:true,force:true});}
});
