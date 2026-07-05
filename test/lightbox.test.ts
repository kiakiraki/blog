import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLightboxItemData,
  computeScaledDimensions,
  parseSrcsetMaxWidthUrl,
} from '../src/utils/lightbox.ts';

test('parseSrcsetMaxWidthUrl: 通常のsrcsetから最大幅のURLを選ぶ', () => {
  const srcset = 'a.webp 640w, b.webp 960w, c.webp 1200w';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'c.webp');
});

test('parseSrcsetMaxWidthUrl: 記述順が逆でも最大幅のURLを選ぶ', () => {
  const srcset = 'c.webp 1200w, a.webp 640w, b.webp 960w';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'c.webp');
});

test('parseSrcsetMaxWidthUrl: エントリが1件のみでもそれを返す', () => {
  assert.equal(parseSrcsetMaxWidthUrl('only.webp 800w'), 'only.webp');
});

test('parseSrcsetMaxWidthUrl: 前後・区切りの余分な空白を許容する', () => {
  const srcset = '  a.webp   640w  ,   b.webp 960w  ';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'b.webp');
});

test('parseSrcsetMaxWidthUrl: nullやundefinedはundefinedを返す', () => {
  assert.equal(parseSrcsetMaxWidthUrl(null), undefined);
  assert.equal(parseSrcsetMaxWidthUrl(undefined), undefined);
});

test('parseSrcsetMaxWidthUrl: 空文字列はundefinedを返す', () => {
  assert.equal(parseSrcsetMaxWidthUrl(''), undefined);
});

test('parseSrcsetMaxWidthUrl: wディスクリプタが無いエントリは無視する', () => {
  const srcset = 'a.webp, b.webp 960w';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'b.webp');
});

test('parseSrcsetMaxWidthUrl: 不正なディスクリプタ（xやpx等）のエントリは無視する', () => {
  const srcset = 'a.webp 2x, b.webp 960w, c.webp abcw';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'b.webp');
});

test('parseSrcsetMaxWidthUrl: 全エントリが不正なら undefined を返す', () => {
  assert.equal(parseSrcsetMaxWidthUrl('a.webp, b.webp 2x'), undefined);
});

test('parseSrcsetMaxWidthUrl: 幅が0や負の値のエントリは無視する', () => {
  const srcset = 'a.webp 0w, b.webp -100w, c.webp 500w';
  assert.equal(parseSrcsetMaxWidthUrl(srcset), 'c.webp');
});

test('computeScaledDimensions: 有効なwidth/height属性からアスペクト比を保って計算する', () => {
  // 元画像が 800x400（アスペクト比 0.5）で、候補幅が1200の場合 -> 高さ600
  const result = computeScaledDimensions(1200, 800, 400);
  assert.deepEqual(result, { width: 1200, height: 600 });
});

test('computeScaledDimensions: 文字列のwidth/height属性も受け付ける', () => {
  const result = computeScaledDimensions(640, '320', '240');
  assert.deepEqual(result, { width: 640, height: 480 });
});

test('computeScaledDimensions: 端数は四捨五入する', () => {
  // アスペクト比 100/300 = 0.333... -> 640 * 0.333... = 213.33... -> 213
  const result = computeScaledDimensions(640, 300, 100);
  assert.deepEqual(result, { width: 640, height: 213 });
});

test('computeScaledDimensions: width属性が欠落していればundefinedを返す', () => {
  assert.equal(computeScaledDimensions(640, undefined, 400), undefined);
});

test('computeScaledDimensions: height属性が欠落していればundefinedを返す', () => {
  assert.equal(computeScaledDimensions(640, 800, null), undefined);
});

test('computeScaledDimensions: width/height属性が不正な文字列ならundefinedを返す', () => {
  assert.equal(computeScaledDimensions(640, 'abc', '400'), undefined);
});

test('computeScaledDimensions: width/height属性が0や負の値ならundefinedを返す', () => {
  assert.equal(computeScaledDimensions(640, 0, 400), undefined);
  assert.equal(computeScaledDimensions(640, 800, -1), undefined);
});

test('computeScaledDimensions: candidateWidthが0や負の値ならundefinedを返す', () => {
  assert.equal(computeScaledDimensions(0, 800, 400), undefined);
  assert.equal(computeScaledDimensions(-100, 800, 400), undefined);
});

test('buildLightboxItemData: srcsetがあればその最大幅候補をsrcに使い、寸法も計算する', () => {
  const result = buildLightboxItemData('a.webp 640w, b.webp 1200w', 'fallback.webp', '800', '400');
  assert.deepEqual(result, { src: 'b.webp', width: 1200, height: 600 });
});

test('buildLightboxItemData: srcsetが無ければsrcにフォールバックし、寸法はundefined', () => {
  const result = buildLightboxItemData(undefined, 'plain.webp', '800', '400');
  assert.deepEqual(result, { src: 'plain.webp', width: undefined, height: undefined });
});

test('buildLightboxItemData: srcsetがパース不能でもsrcにフォールバックする', () => {
  const result = buildLightboxItemData('broken-entry', 'plain.webp', '800', '400');
  assert.deepEqual(result, { src: 'plain.webp', width: undefined, height: undefined });
});

test('buildLightboxItemData: width/height属性が不正ならsrcsetのURLは使うが寸法はundefined', () => {
  const result = buildLightboxItemData('a.webp 1200w', 'fallback.webp', undefined, undefined);
  assert.deepEqual(result, { src: 'a.webp', width: undefined, height: undefined });
});

test('buildLightboxItemData: srcsetもsrcも無ければ空文字列を返す', () => {
  const result = buildLightboxItemData(undefined, undefined, undefined, undefined);
  assert.deepEqual(result, { src: '', width: undefined, height: undefined });
});
