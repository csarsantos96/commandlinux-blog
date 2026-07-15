import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),

    // Existing posts remain Portuguese by default.
    language: z.enum(['pt', 'en']).default('pt'),

    // Used only by generated English versions.
    translationOf: z.string().optional(),
    sourceHash: z.string().optional(),

    // Optional grouping used to render previous/next navigation in a series.
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
  }),
});

export const collections = { posts };
