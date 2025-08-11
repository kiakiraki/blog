import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const slug = formData.get('slug') as string;

    if (!file || !slug) {
      return new Response('Missing image or slug', { status: 400 });
    }

    if (slug.includes('..')) {
      return new Response('Invalid slug', { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const imagePath = path.join(process.cwd(), 'src', 'content', 'blog', slug, '..', file.name);

    await fs.writeFile(imagePath, Buffer.from(buffer));

    // Return the path relative to the mdx file for importing
    const relativePath = `./${file.name}`;

    return new Response(JSON.stringify({ path: relativePath }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error uploading file', error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
