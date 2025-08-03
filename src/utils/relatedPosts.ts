import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

interface RelatedPostScore {
  post: BlogPost;
  score: number;
}

/**
 * 関連記事を取得する
 * @param currentPost 現在の記事
 * @param allPosts 全記事一覧
 * @param maxCount 最大取得件数（デフォルト: 3）
 * @returns 関連度順の記事配列
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  maxCount: number = 3
): BlogPost[] {
  // 現在の記事を除外
  const otherPosts = allPosts.filter(post => post.id !== currentPost.id);

  if (otherPosts.length === 0) return [];

  // 関連度スコアを計算
  const scoredPosts: RelatedPostScore[] = otherPosts.map(post => ({
    post,
    score: calculateRelatedScore(currentPost, post),
  }));

  // スコア順でソート（降順）
  const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score).slice(0, maxCount);

  return sortedPosts.map(({ post }) => post);
}

/**
 * 関連度スコアを計算
 * @param currentPost 現在の記事
 * @param targetPost 対象記事
 * @returns 関連度スコア（0-100）
 */
function calculateRelatedScore(currentPost: BlogPost, targetPost: BlogPost): number {
  let score = 0;

  // カテゴリ一致（50点）
  if (currentPost.data.category === targetPost.data.category) {
    score += 50;
  }

  // 時系列近接度（最大30点）
  const daysDiff =
    Math.abs(currentPost.data.pubDate.getTime() - targetPost.data.pubDate.getTime()) /
    (1000 * 60 * 60 * 24); // 日数差

  const timeScore = Math.max(0, 30 - daysDiff / 30); // 30日で0点
  score += timeScore;

  // タイトル類似度（最大20点） - 簡易版：共通文字数
  const titleSimilarity = calculateTitleSimilarity(currentPost.data.title, targetPost.data.title);
  score += titleSimilarity * 20;

  return Math.round(score);
}

/**
 * タイトル類似度を計算（簡易版）
 * @param title1 タイトル1
 * @param title2 タイトル2
 * @returns 類似度（0-1）
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  // 簡易版：文字の重複率を計算
  const chars1 = new Set(title1.replace(/\s/g, ''));
  const chars2 = new Set(title2.replace(/\s/g, ''));

  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}
