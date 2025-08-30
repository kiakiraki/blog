export const prerender = false;

import type { APIRoute } from 'astro';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

export const GET: APIRoute = async ({ url }) => {
  // 開発環境のみ
  if (import.meta.env.PROD) return json({ ok: false, error: 'not found' }, 404);

  const publishDate = String(url.searchParams.get('publishDate') || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
    return json({ ok: false, error: 'publishDate が不正です (YYYY-MM-DD)' }, 400);
  }

  try {
    const [y, m, d] = publishDate.split('-');
    const baseDir = path.join(PROJECT_ROOT, 'src', 'content', 'blog', `${y}-${m}`, `${y}-${m}-${d}`);
    const base = path.resolve(baseDir);

    const files: string[] = [];
    await walk(base, base, files);
    // 画像拡張子のみ
    const images = files.filter(p => IMAGE_EXT.has(path.extname(p).toLowerCase()));
    images.sort();
    return json({ ok: true, files: images });
  } catch (e: any) {
    console.error('list-images failed:', e);
    return json({ ok: false, error: 'サーバーエラーが発生しました' }, 500);
  }
};

async function walk(root: string, current: string, out: string[]) {
  const ents = await readdir(current, { withFileTypes: true });
  for (const ent of ents) {
    const abs = path.join(current, ent.name);
    const rel = path.relative(root, abs);
    if (ent.isDirectory()) {
      await walk(root, abs, out);
    } else if (ent.isFile()) {
      // 安全のためルート外は除外
      const resolved = path.resolve(abs);
      if (resolved.startsWith(path.resolve(root))) {
        // パス区切りは常に /
        out.push(rel.split(path.sep).join('/'));
      }
    }
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

