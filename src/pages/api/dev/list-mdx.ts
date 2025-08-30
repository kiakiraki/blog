export const prerender = false;

import type { APIRoute } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'blog');

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) return new Response(null, { status: 404 });
  try {
    const files = await walkMdx(CONTENT_ROOT);
    const enriched = await Promise.all(
      files.map(async abs => {
        const rel = path.relative(CONTENT_ROOT, abs).split(path.sep).join('/');
        let title: string | undefined;
        let pubDate: string | undefined;
        try {
          const buf = await readFile(abs, { encoding: 'utf-8' });
          const fm = buf.match(/^---\n([\s\S]*?)\n---/);
          if (fm) {
            const body = fm[1];
            const t = body.match(/^title:\s*(.*)$/m);
            const d = body.match(/^pubDate:\s*(.*)$/m);
            title = t ? stripQuotes(t[1].trim()) : undefined;
            pubDate = d ? stripQuotes(d[1].trim()) : undefined;
          }
        } catch {}
        return { path: rel, title, pubDate };
      })
    );
    return json({ ok: true, files: enriched });
  } catch (e: any) {
    console.error("Error in list-mdx API:", e);
    return json({ ok: false, error: "Internal server error" }, 500);
  }
};

async function walkMdx(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(p);
      } else if (ent.isFile() && /\.mdx$/i.test(ent.name)) {
        out.push(p);
      }
    }
  }
  await walk(root);
  return out.sort();
}

function stripQuotes(s: string) {
  return s.replace(/^['"]|['"]$/g, '');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
