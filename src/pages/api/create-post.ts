import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to format date as YYYY-MM-DD
const getISODate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to create a slug from a title
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const { title, description, category } = await request.json();
    if (!title || !description || !category) {
      return new Response('Missing required fields', { status: 400 });
    }

    const slug = slugify(title);
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const dirPath = path.join(process.cwd(), 'src', 'content', 'blog', `${year}-${month}`, `${year}-${month}-${day}`);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `${slug}.mdx`);
    const pubDate = getISODate(now);

    const frontmatter = `---
title: '${title.replace(/'/g, "''")}'
description: '${description.replace(/'/g, "''")}'
pubDate: '${pubDate}'
heroImage: ''
category: '${category.replace(/'/g, "''")}'
---

# ${title}

Write your content here.
`;

    await fs.writeFile(filePath, frontmatter, 'utf-8');

    const newPostSlugForEdit = `${year}-${month}/${year}-${month}-${day}/${slug}`;

    return new Response(JSON.stringify({ editUrl: `/admin/edit/${newPostSlugForEdit}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error creating post', error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
