import fs from 'node:fs/promises';
import path from 'node:path';
import { TextDecoder } from 'node:util';

const DEFAULT_CACHE_PATH = '.astro/link-previews.json';
const DEFAULT_FETCH_TIMEOUT_MS = 1500;
const DEFAULT_FETCH_CONCURRENCY = 4;
const DEFAULT_MAX_DESCRIPTION_LENGTH = 160;
const DEFAULT_CHARSET_SNIFF_MAX_BYTES = 4096;

function isElement(node) {
  return node && typeof node === 'object' && node.type === 'element';
}

function isText(node) {
  return node && typeof node === 'object' && node.type === 'text';
}

function hasChildren(node) {
  return node && typeof node === 'object' && Array.isArray(node.children);
}

function element(tagName, properties, children) {
  return {
    type: 'element',
    tagName,
    properties: properties ?? {},
    children: children ?? [],
  };
}

function text(value) {
  return { type: 'text', value: String(value ?? '') };
}

function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength) {
  const normalized = normalizeWhitespace(value);
  if (!maxLength || normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function extractText(node) {
  if (isText(node)) return node.value;
  if (!hasChildren(node)) return '';
  return node.children.map(extractText).join('');
}

function getPropertyString(properties, key) {
  if (!properties || typeof properties !== 'object') return undefined;
  const val = properties[key];
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

function parseUrlSafe(href, base) {
  try {
    return new URL(href, base);
  } catch {
    return undefined;
  }
}

function isHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

function isEligibleHref(href) {
  if (!href) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:')) return false;
  if (href.startsWith('tel:')) return false;
  return true;
}

function isExternalUrl(url, site) {
  const resolved = parseUrlSafe(url, site);
  const base = parseUrlSafe(site, site);
  if (!resolved || !base) return false;
  return resolved.origin !== base.origin;
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function writeJson(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
  } catch {
    // Ignore cache write errors.
  }
}

async function withTimeout(promise, timeoutMs) {
  if (!timeoutMs) return promise;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

const NAMED_HTML_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeHtmlEntities(value) {
  return String(value ?? '').replace(
    /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g,
    (match, entity) => {
      if (entity.startsWith('#')) {
        const isHex = entity[1]?.toLowerCase() === 'x';
        const num = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        if (!Number.isFinite(num) || num < 0 || num > 0x10ffff) return match;
        try {
          return String.fromCodePoint(num);
        } catch {
          return match;
        }
      }

      const named = entity.toLowerCase();
      if (Object.hasOwn(NAMED_HTML_ENTITIES, named)) return NAMED_HTML_ENTITIES[named];
      return match;
    }
  );
}

function extractCharsetFromContentType(contentType) {
  const match = String(contentType ?? '').match(/charset\s*=\s*"?([^;\s"]+)"?/i);
  return match ? match[1] : undefined;
}

function normalizeEncodingLabel(label) {
  if (!label) return undefined;

  const raw = String(label).trim().toLowerCase();
  const token = raw.replace(/[\s_]/g, '-');
  const tokenNoDash = token.replace(/-/g, '');

  if (tokenNoDash === 'utf8' || tokenNoDash === 'unicode11utf8') return 'utf-8';
  if (tokenNoDash === 'shiftjis' || tokenNoDash === 'windows31j' || tokenNoDash === 'cp932') {
    return 'shift_jis';
  }
  if (tokenNoDash === 'ms932') return 'shift_jis';
  if (tokenNoDash === 'eucjp') return 'euc-jp';
  if (tokenNoDash === 'iso88591') return 'latin1';

  return raw;
}

function sniffCharsetFromHtmlBytes(bytes, sniffMaxBytes = DEFAULT_CHARSET_SNIFF_MAX_BYTES) {
  const sample = bytes.subarray(0, sniffMaxBytes);
  const sampleText = new TextDecoder('latin1', { fatal: false }).decode(sample);

  const metaCharsetMatch = sampleText.match(/<meta\s+[^>]*charset\s*=\s*["']?\s*([^"'\s/>;]+)/i);
  if (metaCharsetMatch) return metaCharsetMatch[1];

  const httpEquivMatch = sampleText.match(
    /<meta\s+[^>]*http-equiv\s*=\s*["']?\s*content-type\s*["']?[^>]*content\s*=\s*["'][^"']*charset\s*=\s*([^"';\s/>]+)/i
  );
  if (httpEquivMatch) return httpEquivMatch[1];

  return undefined;
}

function decodeHtmlFromBytes(bytes, { contentType } = {}) {
  const charsetFromHeader = extractCharsetFromContentType(contentType);
  const charsetFromMeta = charsetFromHeader ? undefined : sniffCharsetFromHtmlBytes(bytes);
  const encoding = normalizeEncodingLabel(charsetFromHeader || charsetFromMeta) || 'utf-8';

  const candidates = Array.from(new Set([encoding, 'utf-8']));
  for (const candidate of candidates) {
    try {
      return {
        html: new TextDecoder(candidate, { fatal: false, ignoreBOM: true }).decode(bytes),
        encoding: candidate,
      };
    } catch {
      // Fall through.
    }
  }

  return {
    html: new TextDecoder('latin1', { fatal: false }).decode(bytes),
    encoding: 'latin1',
  };
}

function stringLooksMojibake(value) {
  return typeof value === 'string' && value.includes('\uFFFD');
}

function previewLooksMojibake(preview) {
  if (!preview || typeof preview !== 'object') return false;
  return (
    stringLooksMojibake(preview.title) ||
    stringLooksMojibake(preview.description) ||
    stringLooksMojibake(preview.siteName)
  );
}

function extractMetaFromHtml(html) {
  const meta = new Map();
  const metaTags = html.match(/<meta\s+[^>]*?>/gi) ?? [];

  for (const tag of metaTags) {
    const attrs = {};
    const attrRegex = /([^\s=]+)\s*=\s*(['"])(.*?)\2/g;
    let match;
    while ((match = attrRegex.exec(tag)) !== null) {
      const [, rawKey, , rawVal] = match;
      attrs[String(rawKey).toLowerCase()] = rawVal;
    }

    const key =
      normalizeWhitespace(attrs.property).toLowerCase() ||
      normalizeWhitespace(attrs.name).toLowerCase();
    const content = decodeHtmlEntities(normalizeWhitespace(attrs.content));
    if (!key || !content) continue;

    if (!meta.has(key)) meta.set(key, content);
  }

  const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleTag = titleTagMatch
    ? decodeHtmlEntities(normalizeWhitespace(titleTagMatch[1]))
    : undefined;

  return {
    title: meta.get('og:title') || meta.get('twitter:title') || titleTag,
    description:
      meta.get('og:description') || meta.get('description') || meta.get('twitter:description'),
    image:
      meta.get('og:image:secure_url') ||
      meta.get('og:image') ||
      meta.get('twitter:image:src') ||
      meta.get('twitter:image'),
    siteName: meta.get('og:site_name'),
  };
}

async function fetchPreview(url, { timeoutMs, maxDescriptionLength, fetcher } = {}) {
  if (!isHttpUrl(url)) return undefined;
  if (typeof fetcher !== 'function') return undefined;

  const res = await withTimeout(
    async signal =>
      fetcher(url, {
        signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://github.com/)',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'ja,en;q=0.8',
        },
      }),
    timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS
  );

  if (!res.ok) return undefined;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) return undefined;

  const bytes = new Uint8Array(await res.arrayBuffer());
  const { html, encoding } = decodeHtmlFromBytes(bytes, { contentType });
  const meta = extractMetaFromHtml(html);

  const imageUrl = meta.image ? parseUrlSafe(meta.image, url)?.href : undefined;

  return {
    title: meta.title ? normalizeWhitespace(meta.title) : undefined,
    description: meta.description
      ? truncate(meta.description, maxDescriptionLength ?? DEFAULT_MAX_DESCRIPTION_LENGTH)
      : undefined,
    image: imageUrl,
    siteName: meta.siteName ? normalizeWhitespace(meta.siteName) : undefined,
    charset: encoding,
  };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let index = 0;

  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= values.length) return;
      results[current] = await mapper(values[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, values.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export default function rehypeLinkPreview(options = {}) {
  const site = options.site ?? '';
  const cachePath = options.cachePath ?? DEFAULT_CACHE_PATH;
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const fetchConcurrency = options.fetchConcurrency ?? DEFAULT_FETCH_CONCURRENCY;
  const maxDescriptionLength = options.maxDescriptionLength ?? DEFAULT_MAX_DESCRIPTION_LENGTH;
  const enableFetch = options.enableFetch ?? process.env.LINK_PREVIEW_FETCH !== '0';
  const fetcher = options.fetch ?? globalThis.fetch;

  const memoryCache = new Map();
  const inFlight = new Map();

  return async function transformer(tree) {
    const fileCache = (await readJson(cachePath)) ?? {};
    let cacheUpdated = false;

    const candidates = [];

    function walk(node, parent, indexInParent) {
      if (isElement(node) && node.tagName === 'p' && parent && typeof indexInParent === 'number') {
        const significantChildren = (node.children ?? []).filter(child => {
          if (isText(child)) return normalizeWhitespace(child.value) !== '';
          return true;
        });

        if (significantChildren.length === 1) {
          const only = significantChildren[0];
          if (isElement(only) && only.tagName === 'a') {
            const href = getPropertyString(only.properties, 'href');
            if (href && isEligibleHref(href)) {
              candidates.push({ parent, index: indexInParent, link: only, href });
            }
          }
        }
      }

      if (!hasChildren(node)) return;
      for (let i = 0; i < node.children.length; i += 1) {
        walk(node.children[i], node, i);
      }
    }

    walk(tree, null, null);

    const externalUrlsToFetch = Array.from(
      new Set(
        candidates.map(c => c.href).filter(href => isHttpUrl(href) && isExternalUrl(href, site))
      )
    );

    async function getPreview(url) {
      if (!isHttpUrl(url)) return undefined;

      if (memoryCache.has(url)) return memoryCache.get(url);

      const cached = fileCache[url];
      if (cached && (!enableFetch || !previewLooksMojibake(cached))) {
        memoryCache.set(url, cached);
        return cached;
      }

      if (!enableFetch) return cached;
      if (inFlight.has(url)) return inFlight.get(url);

      const promise = (async () => {
        try {
          const preview = await fetchPreview(url, { timeoutMs, maxDescriptionLength, fetcher });
          if (!preview) {
            if (cached) memoryCache.set(url, cached);
            return cached;
          }

          const nextCached = { ...preview, fetchedAt: new Date().toISOString() };
          fileCache[url] = nextCached;
          cacheUpdated = true;
          memoryCache.set(url, nextCached);
          return nextCached;
        } catch {
          if (cached) memoryCache.set(url, cached);
          return cached;
        }
      })();

      inFlight.set(url, promise);
      const result = await promise;
      inFlight.delete(url);
      return result;
    }

    await mapWithConcurrency(externalUrlsToFetch, fetchConcurrency, url => getPreview(url));

    if (cacheUpdated) await writeJson(cachePath, fileCache);

    for (const candidate of candidates) {
      const { parent, index, link, href } = candidate;

      const baseUrl = site || 'https://example.com';
      const resolved = parseUrlSafe(href, baseUrl);
      const host = resolved?.hostname || '';
      const linkText = normalizeWhitespace(extractText(link));

      const preview =
        isHttpUrl(href) && isExternalUrl(href, site) ? await getPreview(href) : undefined;

      const title = preview?.title || linkText || host || href;
      const description = preview?.description;
      const image = preview?.image;
      const displayUrl =
        preview?.siteName || (host ? host : resolved ? resolved.pathname || href : href);

      const external = isHttpUrl(href) && isExternalUrl(href, site);

      const anchorProps = {
        href,
        className: ['link-card', 'card'],
        ...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {}),
      };

      const bodyChildren = [element('div', { className: ['link-card__title'] }, [text(title)])];

      if (description) {
        bodyChildren.push(
          element('div', { className: ['link-card__description'] }, [text(description)])
        );
      }

      bodyChildren.push(element('div', { className: ['link-card__url'] }, [text(displayUrl)]));

      const anchorChildren = [element('div', { className: ['link-card__body'] }, bodyChildren)];

      if (image) {
        anchorChildren.push(
          element('div', { className: ['link-card__thumb'] }, [
            element(
              'img',
              {
                src: image,
                alt: '',
                loading: 'lazy',
                decoding: 'async',
                referrerpolicy: 'no-referrer',
              },
              []
            ),
          ])
        );
      }

      const wrapper = element('div', { className: ['link-preview', 'not-prose'] }, [
        element('a', anchorProps, anchorChildren),
      ]);

      parent.children[index] = wrapper;
    }
  };
}
