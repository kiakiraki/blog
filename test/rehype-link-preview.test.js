import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import rehypeLinkPreview from '../src/lib/rehype-link-preview.js';

function createCachePath() {
  return `.astro/test-link-previews-${randomUUID()}.json`;
}

function makeTreeWithParagraph(children) {
  return {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children,
      },
    ],
  };
}

function makeLink({ href, label }) {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href },
    children: [{ type: 'text', value: label }],
  };
}

test('単独リンクの段落をリンクカードに変換する', async () => {
  const tree = makeTreeWithParagraph([makeLink({ href: 'https://example.com', label: 'Example' })]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: false,
    cachePath: createCachePath(),
  })(tree);

  const wrapper = tree.children[0];
  assert.equal(wrapper.tagName, 'div');
  assert.deepEqual(wrapper.properties.className, ['link-preview', 'not-prose']);

  const anchor = wrapper.children[0];
  assert.equal(anchor.tagName, 'a');
  assert.deepEqual(anchor.properties.className, ['link-card', 'card']);
  assert.equal(anchor.properties.href, 'https://example.com');
  assert.equal(anchor.properties.target, '_blank');
  assert.equal(anchor.properties.rel, 'noreferrer noopener');

  const body = anchor.children[0];
  const title = body.children[0];
  assert.equal(title.tagName, 'div');
  assert.deepEqual(title.properties.className, ['link-card__title']);
  assert.equal(title.children[0].value, 'Example');
});

test('テキストを含む段落は変換しない', async () => {
  const tree = makeTreeWithParagraph([
    { type: 'text', value: 'see ' },
    makeLink({ href: 'https://example.com', label: 'Example' }),
  ]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: false,
    cachePath: createCachePath(),
  })(tree);

  assert.equal(tree.children[0].tagName, 'p');
});

test('mailto/tel は変換しない', async () => {
  const tree = makeTreeWithParagraph([
    makeLink({ href: 'mailto:test@example.com', label: 'Mail' }),
  ]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: false,
    cachePath: createCachePath(),
  })(tree);

  assert.equal(tree.children[0].tagName, 'p');
});

test('同一オリジンのリンクは target を付与しない', async () => {
  const tree = makeTreeWithParagraph([
    makeLink({ href: 'https://blog.kiakiraki.dev/blog', label: 'Blog' }),
  ]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: false,
    cachePath: createCachePath(),
  })(tree);

  const anchor = tree.children[0].children[0];
  assert.equal(anchor.properties.target, undefined);
  assert.equal(anchor.properties.rel, undefined);
});

test('Shift_JIS のページを文字化けせずに取得する', async () => {
  const href = 'https://example.com/sjis';

  const sjisTitle = new Uint8Array([0x82, 0xa0, 0x82, 0xa2]); // "あい"
  const prefix = Buffer.from('<!doctype html><html><head><title>', 'ascii');
  const suffix = Buffer.from('</title></head></html>', 'ascii');
  const body = new Uint8Array(prefix.length + sjisTitle.length + suffix.length);
  body.set(prefix, 0);
  body.set(sjisTitle, prefix.length);
  body.set(suffix, prefix.length + sjisTitle.length);

  const tree = makeTreeWithParagraph([makeLink({ href, label: 'Link' })]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: true,
    cachePath: createCachePath(),
    fetch: async url => {
      assert.equal(url, href);
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=Shift_JIS' },
      });
    },
  })(tree);

  const wrapper = tree.children[0];
  const anchor = wrapper.children[0];
  const bodyNode = anchor.children[0];
  const title = bodyNode.children[0];
  assert.equal(title.children[0].value, 'あい');
});

test('HTMLエンティティをデコードして表示する', async () => {
  const href = 'https://example.com/entities';
  const html =
    '<!doctype html><html><head>' +
    '<meta property="og:title" content="A&nbsp;|&nbsp;B" />' +
    '<meta property="og:description" content="C&amp;D" />' +
    '</head></html>';

  const tree = makeTreeWithParagraph([makeLink({ href, label: 'Link' })]);

  await rehypeLinkPreview({
    site: 'https://blog.kiakiraki.dev',
    enableFetch: true,
    cachePath: createCachePath(),
    fetch: async url => {
      assert.equal(url, href);
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    },
  })(tree);

  const wrapper = tree.children[0];
  const anchor = wrapper.children[0];
  const bodyNode = anchor.children[0];
  const title = bodyNode.children[0];
  const description = bodyNode.children[1];
  assert.equal(title.children[0].value, 'A | B');
  assert.equal(description.children[0].value, 'C&D');
});
