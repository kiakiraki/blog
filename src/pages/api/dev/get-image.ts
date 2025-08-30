export const prerender = false;

import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'blog');

export const GET: APIRoute = async ({ url }) => {
  // 開発環境のみ
  if (import.meta.env.PROD) return new Response(null, { status: 404 });

  const publishDate = String(url.searchParams.get('publishDate') || '').trim();
  const relPath = String(url.searchParams.get('path') || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
    return new Response('Invalid publishDate', { status: 400 });
  }
  if (!relPath) return new Response('path is required', { status: 400 });

  try {
    const [y, m, d] = publishDate.split('-');
    const yearMonth = `${y}-${m}`;
    const safe = path
      .normalize(relPath)
      .replace(/^\/+|^\.<\//, '')
      .replace(/^\.\//, '');
    const baseDir = path.join(CONTENT_ROOT, yearMonth, `${y}-${m}-${d}`);
    const abs = path.resolve(path.join(baseDir, safe));
    const root = path.resolve(baseDir);
    if (!abs.startsWith(root)) return new Response('Invalid path', { status: 400 });

    const buf = await readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    const type = mimeType(ext);
    return new Response(buf, {
      status: 200,
      headers: {
        'content-type': type,
        'cache-control': 'no-store',
      },
    });
  } catch (e: any) {
    console.error(e); // Log for server-side debugging only.
    return new Response('Not found', { status: 404 }); // Generic message, no details exposed.
  }
};

function mimeType(ext: string) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
