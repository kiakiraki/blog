export const prerender = false;

import type { APIRoute } from 'astro';
import { writeFile, mkdir, access } from 'node:fs/promises';
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

    const baseDirResolved = path.resolve(baseDir);
    await mkdir(baseDirResolved, { recursive: true });

    const files: Array<{ name: string }> = [];

    for (const [key, value] of form.entries()) {
      if (key !== 'file') continue;
      const file = value as unknown as File;
      const arrayBuf = await file.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      const { fileName, resolvedPath } = await buildUniqueFilePath(
        baseDirResolved,
        file.name || `image-${Date.now()}.png`
      );
      await writeFile(resolvedPath, buf);
      files.push({ name: fileName });
    }

    return json({ ok: true, files, publishDate, yearMonth });
  } catch (err: any) {
    console.error('Upload image failed:', err);
    return json({ ok: false, error: 'サーバーエラーが発生しました' }, 500);
  }
};

function sanitizeFileName(name: string) {
  // 半角英数と .-_ のみ許可
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function buildUniqueFilePath(baseDirResolved: string, rawName: string) {
  const sanitized = sanitizeFileName(rawName);
  const { name, ext } = path.parse(sanitized);
  const base = name || 'image';
  const extension = ext || '.png';

  let counter = 0;
  // 衝突を避けるため既存ファイルを確認し、存在する場合は連番を付与
  while (true) {
    const candidate = counter === 0 ? `${base}${extension}` : `${base}-${counter}${extension}`;
    const outPath = path.join(baseDirResolved, candidate);
    const resolved = path.resolve(outPath);
    if (!resolved.startsWith(baseDirResolved)) {
      throw new Error('Invalid path');
    }
    try {
      await access(resolved);
      counter += 1;
    } catch {
      return { fileName: candidate, resolvedPath: resolved };
    }
  }
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
