import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { GoogleGenAI } from '@google/genai';
import matter from 'gray-matter';

const POSTS_DIR = path.resolve('src/content/posts');
const ENGLISH_DIR = path.join(POSTS_DIR, 'en');
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;

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
    body: {
      type: 'string',
      description: 'English translation of the Markdown body only.',
    },
  },
  required: ['title', 'description', 'body'],
};

function sourceHash(content) {
  return createHash('sha256').update(content).digest('hex');
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
  if (
    !data ||
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.body !== 'string'
  ) {
    throw new Error(`Invalid translation response for ${sourceFile}.`);
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

async function requestTranslation({ title, description, body, sourceFile }) {
  const prompt = `
Translate this Brazilian Portuguese technical blog post into natural English.

Return only the JSON requested by the schema.

Rules:
- Translate the title, description, headings, paragraphs, lists, tables, and image alt text.
- Preserve Markdown structure.
- Do not add explanations, notes, apologies, or frontmatter.
- Do not translate fenced code blocks.
- Do not translate inline code.
- Do not change shell commands, file paths, URLs, identifiers, API names, YAML keys, JSON keys, Dockerfiles, Kubernetes manifests, Mermaid code, or code comments.
- Keep technical terms such as Docker, Kubernetes, Pod, cgroup, namespace, inode, Terraform, Linux, GitHub Actions, and CI/CD when appropriate.
- Keep the author's tone practical and direct.

Source file: ${sourceFile}

Title:
${title}

Description:
${description}

Markdown body:
${body}
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

      return parseModelJson(response.output_text);
    } catch (error) {
      lastError = error;

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

  const sourceFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.md'),
  );

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

      if (existing.data.sourceHash === hash) {
        console.log(`Skipped: ${entry.name} is already up to date.`);
        skippedCount += 1;
        continue;
      }
    }

    console.log(`Translating: ${entry.name}`);

    const translation = await requestTranslation({
      title: source.data.title,
      description: source.data.description,
      body: source.content,
      sourceFile: entry.name,
    });

    validateTranslation(translation, entry.name);

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