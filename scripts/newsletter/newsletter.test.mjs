import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  detectPosts,
  parsePost,
} from './posts.mjs';
import {
  createArticleDraft,
} from './reach.mjs';
import {
  renderNewsletter,
  renderSeries,
} from './template.mjs';

const SITE = 'https://www.commandlinux.dev';

function source(extra = '') {
  return `---
title: Test article
description: "Description with a colon: still valid"
date: 2026-09-07
category: CLOUD
tags: [aws, storage, cloud, extra]
${extra}---

Body
`;
}

test('series metadata is read independently from the post', () => {
  const post = parsePost(
    'src/content/posts/aws-storage.md',
    source(
      'series: AWS para a Cloud Practitioner\npart: 10\ntotalParts: 12\n',
    ),
    SITE,
  );

  assert.deepEqual(post.series, {
    name: 'AWS para a Cloud Practitioner',
    part: 10,
    totalParts: 12,
  });
  assert.equal(post.category, 'CLOUD');
  assert.deepEqual(post.tags, [
    'aws',
    'storage',
    'cloud',
    'extra',
  ]);

  const html = renderNewsletter(post);

  assert.match(
    html,
    /AWS para a Cloud Practitioner/,
  );
  assert.match(html, /Parte 10 de 12/);
  assert.match(html, /CLOUD/);
  assert.doesNotMatch(html, /#extra/);
});

test('a series without both numbers shows only its name', () => {
  const post = parsePost(
    'src/content/posts/partial-series.md',
    source(
      'series: Série independente\npart: 3\n',
    ),
    SITE,
  );

  assert.deepEqual(post.series, {
    name: 'Série independente',
    part: null,
    totalParts: null,
  });

  const block = renderSeries(post.series, 'pt');

  assert.match(block, /Série independente/);
  assert.doesNotMatch(block, /Parte/);
  assert.doesNotMatch(block, /undefined|null/);
});

test('a normal post renders no series block or empty placeholder', () => {
  const post = parsePost(
    'src/content/posts/normal.md',
    source(),
    SITE,
  );
  const html = renderNewsletter(post);

  assert.equal(post.series, null);
  assert.doesNotMatch(html, /Parte|Part/);
  assert.doesNotMatch(html, /undefined|null/);
});

test('English post uses the existing language metadata', () => {
  const post = parsePost(
    'src/content/posts/en/aws-storage.md',
    source(
      'language: en\nseries: AWS for Cloud Practitioner\npart: 10\ntotalParts: 12\n',
    ),
    SITE,
  );
  const html = renderNewsletter(post);

  assert.equal(
    post.url,
    `${SITE}/en/posts/aws-storage/`,
  );
  assert.match(html, /NEW ON THE BLOG/);
  assert.match(html, /Part 10 of 12/);
  assert.match(html, /Read the article/);
});

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
  }).trim();
}

async function writePost(
  root,
  relative,
  frontmatter = '',
) {
  const file = path.join(
    root,
    'src/content/posts',
    relative,
  );

  await fs.mkdir(path.dirname(file), {
    recursive: true,
  });
  await fs.writeFile(
    file,
    source(frontmatter),
    'utf8',
  );
}

test('full push detection includes additions and draft publication only', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'newsletter-test-'),
  );

  try {
    git(root, 'init', '-q');
    git(root, 'config', 'user.email', 'test@example.com');
    git(root, 'config', 'user.name', 'Test');

    await writePost(root, 'existing.md');
    await writePost(
      root,
      'draft.md',
      'draft: true\n',
    );
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'base');
    const before = git(root, 'rev-parse', 'HEAD');

    await fs.appendFile(
      path.join(
        root,
        'src/content/posts/existing.md',
      ),
      '\nEdited\n',
    );
    await writePost(root, 'new.md');
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'first');

    await writePost(
      root,
      'draft.md',
      'draft: false\n',
    );
    await writePost(
      root,
      'en/new.md',
      'language: en\n',
    );
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'second');

    const after = git(root, 'rev-parse', 'HEAD');
    const posts = detectPosts({
      before,
      after,
      site: SITE,
      cwd: root,
    });

    assert.deepEqual(
      posts.map((post) => post.file).sort(),
      [
        'src/content/posts/draft.md',
        'src/content/posts/en/new.md',
        'src/content/posts/new.md',
      ],
    );
  } finally {
    await fs.rm(root, {
      recursive: true,
      force: true,
    });
  }
});

test('Reach campaign lookup prevents duplicate drafts', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });

    return new Response(
      JSON.stringify({
        data: [
          {
            uuid: 'campaign-1',
            title:
              'CommandLinux newsletter [pt:already-created]',
          },
        ],
      }),
      { status: 200 },
    );
  };

  const post = parsePost(
    'src/content/posts/idempotent.md',
    source(),
    SITE,
  );

  // Match the generated stable prefix without coupling
  // the test to a hard-coded hash.
  fetchImpl.calls = 0;
  const crypto = await import('node:crypto');
  const key = crypto
    .createHash('sha256')
    .update(`${post.language}\n${post.url}`)
    .digest('hex')
    .slice(0, 16);

  const duplicateFetch = async (url, options) => {
    requests.push({ url, options });

    return new Response(
      JSON.stringify({
        data: [
          {
            uuid: 'campaign-1',
            title:
              `CommandLinux newsletter [pt:${key}] Test article`,
          },
        ],
      }),
      { status: 200 },
    );
  };

  const result = await createArticleDraft(
    post,
    renderNewsletter(post),
    {
      token: 'not-logged',
      profileUuid: 'profile',
      senderEmail: 'newsletter@example.com',
      senderName: 'CommandLinux',
      fetchImpl: duplicateFetch,
    },
  );

  assert.equal(result.created, false);
  assert.equal(requests.length, 1);
  assert.match(
    requests[0].url,
    /\/campaigns\?/,
  );
});
