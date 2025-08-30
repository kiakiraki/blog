export const prerender = false;

import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();

export const POST: APIRoute = async ({ request }) => {
  // 開発環境のみ許可
  if (import.meta.env.PROD) {
    return new Response(null, { status: 404 });
  }

  try {
    const form = await request.formData();
    const publishDate = String(form.get('publishDate') || '').trim();
    const subdirRaw = String(form.get('subdir') ?? 'images');
    const subdir = normalizeSubdir(subdirRaw);
    if (!publishDate || !/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
      return json({ ok: false, error: 'publishDate が不正です (YYYY-MM-DD)' }, 400);
    }

    const [year, month, day] = publishDate.split('-');
    const yearMonth = `${year}-${month}`;
    let baseDir = path.join(
      PROJECT_ROOT,
      'src',
      'content',
      'blog',
      yearMonth,
      `${year}-${month}-${day}`
    );
    if (subdir) baseDir = path.join(baseDir, subdir);

    await mkdir(baseDir, { recursive: true });

    const files: Array<{ name: string }> = [];

    for (const [key, value] of form.entries()) {
      if (key !== 'file') continue;
      const file = value as unknown as File;
      const arrayBuf = await file.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      const sanitized = sanitizeFileName(file.name || `image-${Date.now()}.png`);
      const outPath = path.join(baseDir, sanitized);
      // ディレクトリトラバーサル対策
      const resolved = path.resolve(outPath);
      if (!resolved.startsWith(path.resolve(baseDir))) {
        return json({ ok: false, error: 'Invalid path' }, 400);
      }
      await writeFile(resolved, buf);
      files.push({ name: sanitized });
    }

    return json({ ok: true, files, publishDate, yearMonth });
  } catch (err: any) {
    console.error('Upload image failed:', err);
    return json({ ok: false, error: "サーバーエラーが発生しました" }, 500);
  }
};

function sanitizeFileName(name: string) {
  // 半角英数と .-_ のみ許可
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function normalizeSubdir(input: string) {
  // 空文字 or 'images' のみ許容（任意の相対パスは不可）
  if (!input || input === '.' || input === 'root') return '';
  return input === 'images' ? 'images' : 'images';
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
