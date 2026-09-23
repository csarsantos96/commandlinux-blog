import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import {
  createArticleDraft,
  getReachConfig,
  listProfiles,
} from './newsletter/reach.mjs';
import {
  detectPosts,
  parsePost,
} from './newsletter/posts.mjs';
import {
  renderNewsletter,
} from './newsletter/template.mjs';

const SITE =
  process.env.SITE_URL ||
  'https://www.commandlinux.dev';

function usage() {
  console.log(
    [
      'Usage:',
      '  npm run newsletter:preview -- <post.md>',
      '  node scripts/newsletter.mjs publish --before <sha> --after <sha>',
      '  npm run newsletter:profiles',
    ].join('\n'),
  );
}

async function preview(file) {
  if (!file) {
    throw new Error(
      'Provide the path of an existing post.',
    );
  }

  const normalized = file.replaceAll('\\', '/');
  const source = await fs.readFile(
    normalized,
    'utf8',
  );
  const post = parsePost(
    normalized,
    source,
    SITE,
  );

  const directory = path.resolve(
    '.newsletter-preview',
  );
  const output = path.join(
    directory,
    `${post.language}-${post.id.replaceAll('/', '-')}.html`,
  );

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    output,
    renderNewsletter(post),
    'utf8',
  );

  console.log(`Preview generated: ${output}`);
}

async function publish(args) {
  const { values } = parseArgs({
    args,
    options: {
      before: { type: 'string' },
      after: { type: 'string' },
    },
  });

  const posts = detectPosts({
    before: values.before,
    after: values.after,
    site: SITE,
  });

  if (!posts.length) {
    console.log(
      'No newly published posts found.',
    );

    return;
  }

  const config = getReachConfig();

  for (const post of posts) {
    console.log(
      `Processing ${post.language.toUpperCase()}: ${post.file}`,
    );

    const result = await createArticleDraft(
      post,
      renderNewsletter(post),
      config,
    );

    console.log(
      result.created
        ? `Draft created: ${post.title}`
        : `Draft already exists: ${post.title}`,
    );
  }
}

async function main() {
  const [command, ...args] =
    process.argv.slice(2);

  if (command === 'preview') {
    return preview(args[0]);
  }

  if (command === 'publish') {
    return publish(args);
  }

  if (command === 'profiles') {
    const token =
      process.env.HOSTINGER_REACH_API_TOKEN;

    if (!token) {
      throw new Error(
        'Missing HOSTINGER_REACH_API_TOKEN.',
      );
    }

    console.log(
      JSON.stringify(
        await listProfiles(token),
        null,
        2,
      ),
    );

    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(
    `Newsletter error: ${error.message}`,
  );
  process.exitCode = 1;
});
