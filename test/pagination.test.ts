import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePageSlice, paginate, countByCategory } from '../src/utils/pagination.ts';

test('calculatePageSlice: 1ページ目の範囲', () => {
  const result = calculatePageSlice(1, 10, 25);
  assert.deepEqual(result, { start: 0, end: 10, totalPages: 3 });
});

test('calculatePageSlice: 中間ページの範囲', () => {
  const result = calculatePageSlice(2, 10, 25);
  assert.deepEqual(result, { start: 10, end: 20, totalPages: 3 });
});

test('calculatePageSlice: 最終ページは端数になる', () => {
  const result = calculatePageSlice(3, 10, 25);
  assert.equal(result.start, 20);
  assert.equal(result.end, 30);
  assert.equal(result.totalPages, 3);
});

test('calculatePageSlice: 総数0の場合totalPagesは0', () => {
  const result = calculatePageSlice(1, 10, 0);
  assert.equal(result.totalPages, 0);
});

test('calculatePageSlice: postsPerPageが総数を上回る場合totalPagesは1', () => {
  const result = calculatePageSlice(1, 100, 5);
  assert.equal(result.totalPages, 1);
});

test('paginate: 1ページ目', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const result = paginate(items, 1, 10);

  assert.deepEqual(result.items, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(result.totalItems, 25);
  assert.equal(result.totalPages, 3);
});

test('paginate: 中間ページ', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const result = paginate(items, 2, 10);

  assert.deepEqual(result.items, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
});

test('paginate: 最終ページは端数分のみ返す', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const result = paginate(items, 3, 10);

  assert.deepEqual(result.items, [20, 21, 22, 23, 24]);
  assert.equal(result.totalPages, 3);
});

test('paginate: 範囲外ページ(存在しないページ)は空配列を返す', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const result = paginate(items, 4, 10);

  assert.deepEqual(result.items, []);
  assert.equal(result.totalItems, 25);
  assert.equal(result.totalPages, 3);
});

test('paginate: postsPerPageが総数より大きい場合は全件が1ページに収まる', () => {
  const items = [1, 2, 3];
  const result = paginate(items, 1, 100);

  assert.deepEqual(result.items, [1, 2, 3]);
  assert.equal(result.totalPages, 1);
});

test('paginate: 総数0件の場合', () => {
  const result = paginate([], 1, 10);

  assert.deepEqual(result.items, []);
  assert.equal(result.totalItems, 0);
  assert.equal(result.totalPages, 0);
});

test('countByCategory: 各カテゴリの件数を集計する', () => {
  const categories = ['写真', '旅行', '競馬'] as const;
  const itemCategories = ['旅行', '競馬', '競馬', '旅行', '競馬'];

  const result = countByCategory(categories, itemCategories);

  assert.deepEqual(result, { 写真: 0, 旅行: 2, 競馬: 3 });
});

test('countByCategory: アイテムが0件の場合は全カテゴリ0になる', () => {
  const categories = ['A', 'B'] as const;
  const result = countByCategory(categories, []);

  assert.deepEqual(result, { A: 0, B: 0 });
});
