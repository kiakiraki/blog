import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateRelatedScore,
  calculateTitleSimilarity,
  selectRelatedPosts,
  type ScorablePost,
} from '../src/utils/relatedScore.ts';

function makePost(overrides: Partial<ScorablePost> = {}): ScorablePost {
  return {
    id: 'post-1',
    title: 'タイトル',
    category: '技術',
    pubDate: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

test('calculateTitleSimilarity: 完全一致は1', () => {
  assert.equal(calculateTitleSimilarity('同じタイトル', '同じタイトル'), 1);
});

test('calculateTitleSimilarity: 共通文字なしは0', () => {
  assert.equal(calculateTitleSimilarity('abc', 'xyz'), 0);
});

test('calculateTitleSimilarity: 共通文字ありは0と1の間', () => {
  const similarity = calculateTitleSimilarity('東京旅行記', '東京観光記録');
  assert.ok(similarity > 0 && similarity < 1);
});

test('calculateTitleSimilarity: 空白は無視される', () => {
  assert.equal(calculateTitleSimilarity('a b c', 'abc'), 1);
});

test('calculateRelatedScore: カテゴリ一致で50点加算される', () => {
  const current = makePost({ category: '競馬', title: '', pubDate: new Date('2025-01-01') });
  const sameCategory = makePost({ category: '競馬', title: '', pubDate: new Date('2025-01-01') });
  const diffCategory = makePost({ category: '旅行', title: '', pubDate: new Date('2025-01-01') });

  const scoreSame = calculateRelatedScore(current, sameCategory);
  const scoreDiff = calculateRelatedScore(current, diffCategory);

  assert.equal(scoreSame - scoreDiff, 50);
});

test('calculateRelatedScore: pubDate差0日で時系列スコアは満点(30点)', () => {
  const current = makePost({ category: 'A', title: '', pubDate: new Date('2025-06-01T00:00:00Z') });
  const target = makePost({ category: 'B', title: '', pubDate: new Date('2025-06-01T00:00:00Z') });

  // カテゴリ不一致・タイトル類似度0なので時系列スコアのみが乗る
  assert.equal(calculateRelatedScore(current, target), 30);
});

test('calculateRelatedScore: pubDate差30日で時系列スコアは0点(境界)', () => {
  const current = makePost({ category: 'A', title: '', pubDate: new Date('2025-06-01T00:00:00Z') });
  const target = makePost({ category: 'B', title: '', pubDate: new Date('2025-07-01T00:00:00Z') });

  assert.equal(calculateRelatedScore(current, target), 0);
});

test('calculateRelatedScore: pubDate差が30日を超えても時系列スコアは負にならない(下限0)', () => {
  const current = makePost({ category: 'A', title: '', pubDate: new Date('2025-01-01T00:00:00Z') });
  const target = makePost({ category: 'B', title: '', pubDate: new Date('2026-01-01T00:00:00Z') });

  assert.equal(calculateRelatedScore(current, target), 0);
});

test('calculateRelatedScore: カテゴリ・時系列・タイトル類似度の合算(タイトル完全一致で満点)', () => {
  const current = makePost({
    category: '競馬',
    title: '同じタイトル',
    pubDate: new Date('2025-06-01T00:00:00Z'),
  });
  const target = makePost({
    category: '競馬',
    title: '同じタイトル',
    pubDate: new Date('2025-06-01T00:00:00Z'),
  });

  // 50(カテゴリ) + 30(時系列) + 20(タイトル完全一致) = 100
  assert.equal(calculateRelatedScore(current, target), 100);
});

test('selectRelatedPosts: 自記事(同一id)は候補から除外される', () => {
  const current = makePost({ id: 'a' });
  const results = selectRelatedPosts(current, [current, makePost({ id: 'b' })]);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.id, 'b');
});

test('selectRelatedPosts: スコア降順に並び、maxCountで打ち切られる', () => {
  const current = makePost({
    id: 'current',
    category: '競馬',
    title: 'テスト記事タイトル',
    pubDate: new Date('2025-06-15T00:00:00Z'),
  });

  const high = makePost({
    id: 'high',
    category: '競馬',
    title: 'テスト記事タイトル',
    pubDate: new Date('2025-06-15T00:00:00Z'),
  }); // 満点想定
  const mid = makePost({
    id: 'mid',
    category: '競馬',
    title: '全く異なる単語列',
    pubDate: new Date('2025-05-01T00:00:00Z'),
  });
  const low = makePost({
    id: 'low',
    category: '旅行',
    title: 'zzz',
    pubDate: new Date('2020-01-01T00:00:00Z'),
  });

  const results = selectRelatedPosts(current, [low, mid, high], 2);

  assert.equal(results.length, 2);
  assert.equal(results[0]?.id, 'high');
  assert.equal(results[1]?.id, 'mid');
});

test('selectRelatedPosts: 候補が自記事のみの場合は空配列を返す', () => {
  const current = makePost({ id: 'only' });
  const results = selectRelatedPosts(current, [current]);

  assert.deepEqual(results, []);
});

test('selectRelatedPosts: 候補が0件の場合は空配列を返す', () => {
  const current = makePost({ id: 'only' });
  const results = selectRelatedPosts(current, []);

  assert.deepEqual(results, []);
});

test('selectRelatedPosts: 候補数がmaxCount未満でも保有分だけ返す', () => {
  const current = makePost({ id: 'current' });
  const other = makePost({ id: 'other' });

  const results = selectRelatedPosts(current, [current, other], 3);

  assert.equal(results.length, 1);
  assert.equal(results[0]?.id, 'other');
});
