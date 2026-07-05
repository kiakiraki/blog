import assert from 'node:assert/strict';
import test from 'node:test';
import { truncateGraphemes } from '../src/utils/truncate.ts';

test('truncateGraphemes: 切り詰め不要な短い文字列はそのまま返す', () => {
  assert.equal(truncateGraphemes('短いタイトル', 50), '短いタイトル');
});

test('truncateGraphemes: 最大長ちょうどの文字列は省略記号を付けない', () => {
  assert.equal(truncateGraphemes('あ'.repeat(50), 50), 'あ'.repeat(50));
});

test('truncateGraphemes: 通常の日本語タイトルは指定文字数で切り詰めて省略記号を付ける', () => {
  const title = 'あ'.repeat(60);
  assert.equal(truncateGraphemes(title, 50), 'あ'.repeat(50) + '…');
});

test('truncateGraphemes: 切り詰め境界のサロゲートペア絵文字を破壊しない', () => {
  // '🐴' はサロゲートペア（UTF-16で2コードユニット）。
  // 49文字 + '🐴' で substring(0, 50) だと上位サロゲートだけが残り文字化けする。
  const title = 'あ'.repeat(49) + '🐴' + '以降は切り捨てられる部分';
  const truncated = truncateGraphemes(title, 50);
  assert.equal(truncated, 'あ'.repeat(49) + '🐴…');
  // substring ベースの旧実装では末尾が孤立サロゲートになっていたことの対比
  assert.notEqual(truncated, title.substring(0, 50) + '…');
});

test('truncateGraphemes: ZWJ合成絵文字を1文字として数え、分解しない', () => {
  // 👨‍👩‍👧‍👦 は4つの絵文字をZWJで結合した1書記素（UTF-16で11コードユニット）
  const family = '👨‍👩‍👧‍👦';
  const title = 'あ'.repeat(49) + family + '以降は切り捨てられる部分';
  assert.equal(truncateGraphemes(title, 50), 'あ'.repeat(49) + family + '…');
});

test('truncateGraphemes: ZWJ合成絵文字が境界を超える場合は丸ごと落とす', () => {
  const family = '👨‍👩‍👧‍👦';
  const title = 'あ'.repeat(50) + family;
  assert.equal(truncateGraphemes(title, 50), 'あ'.repeat(50) + '…');
});

test('truncateGraphemes: 省略記号を指定できる', () => {
  assert.equal(truncateGraphemes('abcdef', 3, '...'), 'abc...');
});
