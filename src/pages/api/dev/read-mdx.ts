export const prerender = false;

import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'blog');

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  const rel = url.searchParams.get('path') || '';
  try {
    if (!rel) return json({ ok: false, error: 'path is required' }, 400);
    const safe = path.normalize(rel).replace(/^\/+/, '');
    const abs = path.resolve(path.join(CONTENT_ROOT, safe));
    if (!abs.startsWith(path.resolve(CONTENT_ROOT)))
      return json({ ok: false, error: 'Invalid path' }, 400);
    const content = await readFile(abs, 'utf-8');
    return json({ ok: true, path: rel, content });
  } catch (e: any) {
    console.error('Error in read-mdx API:', e);
    return json({ ok: false, error: 'Internal server error' }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
