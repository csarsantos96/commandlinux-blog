import { execFileSync } from 'node:child_process';

import { slug as githubSlug } from 'github-slugger';
import matter from 'gray-matter';

export const POSTS_DIR = 'src/content/posts/';

export function parsePost(file, source, site) {
  if (!file.startsWith(POSTS_DIR) || !file.endsWith('.md')) {
    throw new Error('Expected a Markdown post path.');
  }

  const { data } = matter(source);
  const language = data.language ?? 'pt';

  if (!['pt', 'en'].includes(language)) {
    throw new Error(`Invalid language: ${file}`);
  }

  if (
    data.draft !== undefined &&
    typeof data.draft !== 'boolean'
  ) {
    throw new Error(`Invalid draft flag: ${file}`);
  }

  for (const field of ['title', 'description']) {
    if (
      typeof data[field] !== 'string' ||
      !data[field].trim()
    ) {
      throw new Error(`Missing ${field}: ${file}`);
    }
  }

  if (
    typeof data.category !== 'string' ||
    !data.category.trim()
  ) {
    throw new Error(`Missing category: ${file}`);
  }

  if (
    data.tags !== undefined &&
    !Array.isArray(data.tags)
  ) {
    throw new Error(`Invalid tags: ${file}`);
  }

  const date = new Date(data.date);

  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid date: ${file}`);
  }

  // Match Astro's default glob loader, including /index handling.
  const id = data.slug || file
    .slice(POSTS_DIR.length, -3)
    .split('/')
    .map(githubSlug)
    .join('/')
    .replace(/\/index$/, '');

  if (
    typeof id !== 'string' ||
    !id ||
    id.split('/').some(
      (segment) =>
        !segment ||
        segment === '.' ||
        segment === '..',
    )
  ) {
    throw new Error(`Invalid slug: ${file}`);
  }

  const slug =
    language === 'en'
      ? id.replace(/^en\//, '')
      : id;

  const encodedSlug = slug
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  const ogSlug = id
    .replace(/^en\//, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  const seriesName =
    typeof data.series === 'string'
      ? data.series.trim()
      : '';

  const hasCompleteSeriesNumbers =
    Number.isInteger(data.part) &&
    data.part > 0 &&
    Number.isInteger(data.totalParts) &&
    data.totalParts > 0;

  return {
    file,
    language,
    id,
    date,
    draft: data.draft ?? false,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category.trim(),
    tags: (data.tags ?? [])
      .filter(
        (tag) =>
          typeof tag === 'string' &&
          tag.trim(),
      )
      .map((tag) => tag.trim()),
    url: new URL(
      `${language === 'en' ? '/en' : ''}/posts/${encodedSlug}/`,
      site,
    ).href,
    image: new URL(
      `/og/${language}/${ogSlug}.png`,
      site,
    ).href,
    logo: new URL('/logo.svg', site).href,
    series: seriesName
      ? {
          name: seriesName,
          part: hasCompleteSeriesNumbers
            ? data.part
            : null,
          totalParts: hasCompleteSeriesNumbers
            ? data.totalParts
            : null,
        }
      : null,
  };
}

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
}

export function detectPosts({
  before,
  after,
  site,
  cwd = process.cwd(),
}) {
  // A branch-creation event has no reliable base and must not
  // announce the entire archive retroactively.
  if (/^0{40}$/.test(before ?? '')) {
    console.warn(
      'Skipping newsletter detection: this push has no reliable base commit.',
    );

    return [];
  }

  for (const sha of [before, after]) {
    if (!/^[a-f0-9]{40}$/.test(sha ?? '')) {
      throw new Error(
        'Provide valid before/after commit SHAs.',
      );
    }

    git(['cat-file', '-e', `${sha}^{commit}`], cwd);
  }

  const changes = git(
    [
      'diff',
      '--name-status',
      '-z',
      '--find-renames',
      before,
      after,
      '--',
      POSTS_DIR,
    ],
    cwd,
  ).split('\0');

  const posts = [];

  for (
    let index = 0;
    index < changes.length && changes[index];
  ) {
    const status = changes[index++];
    const oldFile = changes[index++];
    const file = /^[RC]/.test(status)
      ? changes[index++]
      : oldFile;

    if (
      !file.endsWith('.md') ||
      !/^[AMR]/.test(status)
    ) {
      continue;
    }

    const post = parsePost(
      file,
      git(['show', `${after}:${file}`], cwd),
      site,
    );

    if (post.draft) continue;

    if (status !== 'A') {
      const previous = matter(
        git(['show', `${before}:${oldFile}`], cwd),
      ).data;

      // Edits and renames of already-published posts do not
      // create another campaign. Publishing a draft does.
      if (previous.draft !== true) continue;
    }

    posts.push(post);
  }

  const urls = new Set();

  for (const post of posts) {
    if (urls.has(post.url)) {
      throw new Error(
        `Duplicate article URL: ${post.url}`,
      );
    }

    urls.add(post.url);
  }

  return posts;
}
