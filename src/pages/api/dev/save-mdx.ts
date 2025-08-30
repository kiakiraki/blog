export const prerender = false;

import type { APIRoute } from 'astro';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'blog');

export const POST: APIRoute = async ({ request }) => {
  // 開発環境のみ許可
  if (import.meta.env.PROD) return new Response(null, { status: 404 });

  try {
    const isJSON = (request.headers.get('content-type') || '').includes('application/json');
    const payload = isJSON
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const publishDate = String(payload.publishDate || '').trim();
    const filenameRaw = String(payload.filename || '').trim();
    const content = String(payload.content || '');
    const overwrite = String(payload.overwrite || '').toLowerCase() === 'true';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
      return json({ ok: false, error: 'publishDate が不正です (YYYY-MM-DD)' }, 400);
    }
    if (!content) return json({ ok: false, error: 'content が空です' }, 400);

    const filename = sanitizeSlug(filenameRaw || 'article') + '.mdx';

    const [year, month, day] = publishDate.split('-');
    const yearMonth = `${year}-${month}`;
    const dir = path.join(CONTENT_ROOT, yearMonth, `${year}-${month}-${day}`);
    await mkdir(dir, { recursive: true });
    const abs = path.resolve(path.join(dir, filename));
    if (!abs.startsWith(path.resolve(dir))) return json({ ok: false, error: 'Invalid path' }, 400);

    // 既存時の扱い
    const data = new TextEncoder().encode(content);
    if (!overwrite) {
      // Try unique suffix if exists
      let final = abs;
      let i = 1;
      const { access } = await import('node:fs/promises');
      try {
        await access(final);
        // exists → add suffix
        const base = filename.replace(/\.mdx$/i, '');
        while (true) {
          const alt = path.join(dir, `${base}-${i}.mdx`);
          try {
            await access(alt);
            i += 1;
          } catch {
            final = alt;
            break;
          }
        }
      } catch {
        // not exists
      }
      await writeFile(final, data, { encoding: 'utf-8' as any });
      return json({ ok: true, path: toRel(final) });
    }

    await writeFile(abs, data, { encoding: 'utf-8' as any });
    return json({ ok: true, path: toRel(abs) });
  } catch (e: any) {
    // Log the error and stack trace for debugging, but do not expose to client
    console.error('Error in save-mdx API:', e && e.stack ? e.stack : e);
    return json({ ok: false, error: 'Internal Server Error' }, 500);
  }
};

function sanitizeSlug(input: string) {
  // ひらがな・カタカナ等は省略し、半角英数とハイフンのみ。
  const ascii = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|/g, '');
  return ascii || 'article';
}

function toRel(abs: string) {
  return path.relative(CONTENT_ROOT, abs).split(path.sep).join('/');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
