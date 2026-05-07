import { defineCollection, z } from 'astro:content';

const baseFields = {
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  cover: z.string().optional(),
  url: z.string().url().optional(),
  repo: z.string().url().optional(),
  status: z.enum(['active', 'archived', 'wip']).default('active'),
  date: z.string(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
};

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    ...baseFields,
    category: z.enum(['website', 'app', 'game', 'data', 'art', 'agent', 'tool', 'other']),
  }),
});

const blogs = defineCollection({
  type: 'content',
  schema: z.object({ ...baseFields }),
});

const apps = defineCollection({
  type: 'content',
  schema: z.object({ ...baseFields }),
});

export const collections = { projects, blogs, apps };
