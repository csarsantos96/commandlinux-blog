import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { redis } from '../lib/newsletter.mjs';
import { deliver, assertTestSegment } from './newsletter/delivery.mjs';
import { productionDeployment } from './newsletter/vercel-event.mjs';
import { publishProduction } from './newsletter/production.mjs';
import {
  parsePost,
} from './newsletter/posts.mjs';
import {
  renderNewsletter,
} from './newsletter/template.mjs';

const SITE =
  process.env.NEWSLETTER_SITE_URL ||
  'https://www.commandlinux.dev';

function usage() {
  console.log(
    [
      'Usage:',
      '  npm run newsletter:preview -- <post.md>',
      '  node scripts/newsletter.mjs test <post.md>',
      '  node scripts/newsletter.mjs publish --after <deployed-sha>',
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
      after: { type: 'string' },
    },
  });

  if (process.env.NEWSLETTER_ENABLED !== 'true') {
    console.log('Newsletter disabled; no sends.');
    return;
  }
  if (process.env.NEWSLETTER_MIGRATION_COMPLETE !== 'true') throw new Error('Complete migration before enabling sends');
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_EVENT_NAME !== 'repository_dispatch' || !process.env.GITHUB_EVENT_PATH) throw new Error('Vercel production deployment workflow required');
  const event = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (productionDeployment(event, process.env.NEWSLETTER_VERCEL_PROJECT_ID) !== values.after) throw new Error('Checkout SHA does not match deployed SHA');
  await publishProduction(values.after, redis(), { site: SITE, testMode: !!process.env.NEWSLETTER_TEST_EMAIL });
}

async function main() {
  const [command, ...args] =
    process.argv.slice(2);

  if (command === 'preview') {
    return preview(args[0]);
  }

  if (command === 'test') {
    // Separate Redis and segments are mandatory: this command never enables production.
    if (process.env.NEWSLETTER_ENABLED === 'true') throw new Error('Disable production sends for test');
    const file = args[0];
    if (!file) throw new Error('Provide a test article');
    const post = parsePost(file, await fs.readFile(file, 'utf8'), SITE);
    if (post.draft) throw new Error('Draft cannot be sent');
    await assertTestSegment(post.language);
    return deliver(post, redis());
  }

  if (command === 'publish') {
    return publish(args);
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
