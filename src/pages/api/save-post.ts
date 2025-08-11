import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const { slug, content } = await request.json();
    if (!slug || typeof content !== 'string') {
      return new Response('Missing slug or content', { status: 400 });
    }

    // Prevent directory traversal
    if (slug.includes('..')) {
      return new Response('Invalid slug', { status: 400 });
    }

    // Construct the file path relative to the project root
    const mdxPath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.mdx`);

    await fs.writeFile(mdxPath, content, 'utf-8');

    return new Response(JSON.stringify({ message: 'File saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'Error saving file', error: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
