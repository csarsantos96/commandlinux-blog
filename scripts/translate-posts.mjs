import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';

const POSTS_DIR = path.resolve('src/content/posts');
const ENGLISH_DIR = path.join(POSTS_DIR, 'en');
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;
const TRANSLATION_POST = process.env.TRANSLATION_POST?.trim();
const TRANSLATION_VERSION = '2';



if (!API_KEY) {
  console.error('GEMINI_API_KEY is missing.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const translationSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'English translation of the article title.',
    },
    description: {
      type: 'string',
      description: 'English translation of the article description.',
    },
    series: {
      type: 'string',
      description: 'English translation of the series name, or an empty string when there is no series.',
    },
    body: {
      type: 'string',
      description: 'English translation of the Markdown body only.',
    },
  },
  required: ['title', 'description', 'series', 'body'],
  additionalProperties: false,
};

function sourceHash(content) {
  return createHash('sha256')
    .update(`${TRANSLATION_VERSION}\n${content}`)
    .digest('hex');
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function validateTranslation(data, sourceFile) {
  const isValid =
    data &&
    typeof data.title === 'string' &&
    data.title.trim() &&
    typeof data.description === 'string' &&
    data.description.trim() &&
    typeof data.series === 'string' &&
    typeof data.body === 'string' &&
    data.body.trim();

  if (!isValid) {
    const keys =
      data && typeof data === 'object'
        ? Object.keys(data).join(', ') || 'none'
        : typeof data;

    throw new Error(
      `Invalid translation response for ${sourceFile}. Received keys: ${keys}`,
    );
  }
}

function parseModelJson(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  const json =
    firstBrace !== -1 && lastBrace !== -1
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  return JSON.parse(json);
}

function protectFencedCodeBlocks(markdown) {
  const blocks = [];

  const text = markdown.replace(/```([^\n]*)\n[\s\S]*?```/g, (block, infoString) => {
    const language = infoString.trim().split(/\s+/)[0].toLowerCase();

    // Prose diagrams need translation, but their Markdown fences and spacing
    // must remain intact.
    if (['text', 'txt', 'plaintext'].includes(language)) {
      return block;
    }

    const token = `@@CODE_BLOCK_${blocks.length}@@`;

    blocks.push({
      token,
      block,
    });

    return token;
  });

  return { text, blocks };
}

function restoreFencedCodeBlocks(markdown, blocks, sourceFile) {
  let restored = markdown;

  for (const { token, block } of blocks) {
    const occurrences = restored.split(token).length - 1;

    if (occurrences !== 1) {
      throw new Error(
        `Code block placeholder ${token} was changed or removed in ${sourceFile}.`,
      );
    }

    restored = restored.replace(token, block);
  }

  return restored;
}

async function requestTranslation({ title, description, series, body, sourceFile }) {
  const { text: protectedBody, blocks } = protectFencedCodeBlocks(body);

  const prompt = `
Translate this Brazilian Portuguese technical blog post into natural English.

Return only one valid JSON object with exactly these keys:

{
  "title": "translated title",
  "description": "translated description",
  "series": "translated series name or empty string",
  "body": "translated Markdown body"
}

Rules:
- All four keys are mandatory. Title, description, and body must contain non-empty strings.
- Translate the series name when provided. If Series is empty, return an empty string for "series".
- Translate titles, descriptions, headings, paragraphs, lists, tables, image alt text, and natural-language labels inside text/txt/plaintext fenced blocks.
- Preserve the spacing, borders, arrows, tree characters, and alignment of text diagrams.
- Preserve Markdown structure.
- Do not add frontmatter.
- Do not add explanations, notes, apologies, or text outside the JSON object.
- Placeholder tokens such as @@CODE_BLOCK_0@@ represent protected code blocks.
- Copy every placeholder exactly once, unchanged, and do not wrap it in backticks.
- Except for text/txt/plaintext diagrams, do not translate fenced code blocks, inline code, commands, file paths, URLs, identifiers, API names, YAML keys, JSON keys, Dockerfiles, Kubernetes manifests, Mermaid code, or code comments.
- Keep technical terms such as Docker, Kubernetes, Pod, cgroup, namespace, inode, Terraform, Linux, GitHub Actions, and CI/CD when appropriate.
- Keep the author's practical and direct tone.

Source file: ${sourceFile}

Title:
${title}

Description:
${description}

Series:
${series ?? ''}

Markdown body:
${protectedBody}
`.trim();

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await ai.interactions.create({
        model: MODEL,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: translationSchema,
        },
      });

      const translation = parseModelJson(response.output_text);

      validateTranslation(translation, sourceFile);

      translation.body = restoreFencedCodeBlocks(
        translation.body,
        blocks,
        sourceFile,
      );

      return translation;
    } catch (error) {
      lastError = error;

      console.log(
        `Attempt ${attempt}/3 failed for ${sourceFile}: ${error.message}`,
      );

      if (attempt < 3) {
        const waitMs = attempt * 2000;

        console.log(
          `Retrying ${sourceFile} in ${waitMs / 1000}s...`,
        );

        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}

async function main() {
  await fs.mkdir(ENGLISH_DIR, { recursive: true });

  const entries = await fs.readdir(POSTS_DIR, {
    withFileTypes: true,
  });

  let sourceFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.md'),
  );

  if (TRANSLATION_POST) {
    const requestedPost = path.basename(TRANSLATION_POST);

    if (requestedPost !== TRANSLATION_POST || !requestedPost.endsWith('.md')) {
      throw new Error(
        'TRANSLATION_POST must be a Markdown filename without a directory.',
      );
    }

    sourceFiles = sourceFiles.filter((entry) => entry.name === requestedPost);

    if (sourceFiles.length === 0) {
      throw new Error(`Post not found: ${requestedPost}`);
    }

    console.log(`Selected post: ${requestedPost}`);
  }

  if (sourceFiles.length === 0) {
    console.log('No Portuguese posts found.');
    return;
  }

  let translatedCount = 0;
  let skippedCount = 0;

  for (const entry of sourceFiles) {
    const sourcePath = path.join(POSTS_DIR, entry.name);
    const targetPath = path.join(ENGLISH_DIR, entry.name);

    const sourceContent = await fs.readFile(sourcePath, 'utf8');
    const source = matter(sourceContent);
    const hash = sourceHash(sourceContent);

    if (!source.data.title || !source.data.description) {
      throw new Error(
        `${entry.name} must have title and description in its frontmatter.`,
      );
    }

    if (await fileExists(targetPath)) {
      const existing = matter(await fs.readFile(targetPath, 'utf8'));

      const hasCopiedPortugueseSeries =
        source.data.series && existing.data.series === source.data.series;

      if (existing.data.sourceHash === hash && !hasCopiedPortugueseSeries) {
        console.log(`Skipped: ${entry.name} is already up to date.`);
        skippedCount += 1;
        continue;
      }
    }

    console.log(`Translating: ${entry.name}`);

    const translation = await requestTranslation({
      title: source.data.title,
      description: source.data.description,
      series: source.data.series,
      body: source.content,
      sourceFile: entry.name,
    });

    const sourceSlug = entry.name.replace(/\.md$/, '');

    const englishPost = matter.stringify(`${translation.body.trim()}\n`, {
      title: translation.title.trim(),
      description: translation.description.trim(),
      date: normalizeDate(source.data.date),
      category: source.data.category,
      tags: source.data.tags ?? [],
      draft: Boolean(source.data.draft),
      language: 'en',
      translationOf: sourceSlug,
      sourceHash: hash,
      ...(source.data.series ? { series: translation.series.trim() } : {}),
      ...(source.data.part ? { part: source.data.part } : {}),
      ...(source.data.totalParts ? { totalParts: source.data.totalParts } : {}),
      ...(source.data.seriesOrder ? { seriesOrder: source.data.seriesOrder } : {}),
    });

    await fs.writeFile(targetPath, englishPost, 'utf8');

    translatedCount += 1;
    console.log(`Created: en/${entry.name}`);
  }

  console.log(
    `Done. ${translatedCount} translated, ${skippedCount} already current.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
