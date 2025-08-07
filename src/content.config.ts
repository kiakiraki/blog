import { defineCollection, z } from 'astro:content';
import { CATEGORIES } from './consts';

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      category: z.enum(CATEGORIES),
    }),
});

export const collections = { blog };
