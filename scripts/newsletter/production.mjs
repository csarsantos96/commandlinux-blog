import { execFileSync } from 'node:child_process';
import { detectPosts, parsePost, POSTS_DIR } from './posts.mjs';
import { articleKey, deliver, assertTestSegment } from './delivery.mjs';

export async function publishProduction(after, db, { cwd = process.cwd(), api, testMode = false, site = 'https://www.commandlinux.dev' } = {}) {
  if (!/^[a-f0-9]{40}$/.test(after ?? '')) throw new Error('Invalid deployment SHA');
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  git(['cat-file', '-e', `${after}^{commit}`]);
  const baselineKey = 'newsletter:production-sha';
  const before = await db.get(baselineKey);
  if (!before) {
    // Mark the existing published archive permanently, before saving the cursor.
    const files = git(['ls-tree', '-r', '--name-only', after, '--', POSTS_DIR]).trim().split('\n');
    for (const file of files.filter(f => f.endsWith('.md'))) {
      const post = parsePost(file, git(['show', `${after}:${file}`]), site);
      if (!post.draft) await db.set(articleKey(post), { status: 'baseline' }, { nx: true });
    }
    await db.set(baselineKey, after, { nx: true });
    console.log('Production baseline saved; archive not sent.');
    return;
  }
  if (before === after) return;
  try { git(['merge-base', '--is-ancestor', before, after]); }
  catch (error) {
    if (error.status === 1) { console.log('Rollback or stale deployment ignored.'); return; }
    throw error;
  }
  const posts = detectPosts({ before, after, cwd, site });
  if (testMode) for (const language of new Set(posts.map(p => p.language))) await assertTestSegment(language, api);
  for (const post of posts) await deliver(post, db, api);
  await db.set(baselineKey, after);
}
