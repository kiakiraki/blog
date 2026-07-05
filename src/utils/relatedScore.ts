/**
 * astro:content に依存しない、関連記事スコアリングの純粋ロジック。
 * CollectionEntry ではなく最低限のプレーンなデータを受け取る。
 */
export interface ScorablePost {
  id: string;
  title: string;
  category: string;
  pubDate: Date;
}

interface RelatedScore<T extends ScorablePost> {
  post: T;
  score: number;
}

/**
 * 現在の記事を除いた候補の中から関連度スコア順に上位 maxCount 件を返す。
 * @param currentPost 現在の記事
 * @param candidates 候補記事一覧（currentPost を含んでいてもよい。id が一致するものは除外される）
 * @param maxCount 最大取得件数（デフォルト: 3）
 */
export function selectRelatedPosts<T extends ScorablePost>(
  currentPost: T,
  candidates: T[],
  maxCount: number = 3
): T[] {
  const otherPosts = candidates.filter(post => post.id !== currentPost.id);

  if (otherPosts.length === 0) return [];

  const scoredPosts: RelatedScore<T>[] = otherPosts.map(post => ({
    post,
    score: calculateRelatedScore(currentPost, post),
  }));

  const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score).slice(0, maxCount);

  return sortedPosts.map(({ post }) => post);
}

/**
 * 関連度スコアを計算
 * @param currentPost 現在の記事
 * @param targetPost 対象記事
 * @returns 関連度スコア（0-100）
 */
export function calculateRelatedScore(currentPost: ScorablePost, targetPost: ScorablePost): number {
  let score = 0;

  // カテゴリ一致（50点）
  if (currentPost.category === targetPost.category) {
    score += 50;
  }

  // 時系列近接度（最大30点）
  const daysDiff =
    Math.abs(currentPost.pubDate.getTime() - targetPost.pubDate.getTime()) / (1000 * 60 * 60 * 24); // 日数差

  // 0日差で30点、30日差で0点になるようにスケール
  const timeScore = Math.max(0, 30 - daysDiff); // 30日で0点
  score += timeScore;

  // タイトル類似度（最大20点） - 簡易版：共通文字数
  const titleSimilarity = calculateTitleSimilarity(currentPost.title, targetPost.title);
  score += titleSimilarity * 20;

  return Math.round(score);
}

/**
 * タイトル類似度を計算（簡易版）
 * @param title1 タイトル1
 * @param title2 タイトル2
 * @returns 類似度（0-1）
 */
export function calculateTitleSimilarity(title1: string, title2: string): number {
  // 簡易版：文字の重複率を計算
  const chars1 = new Set(title1.replace(/\s/g, ''));
  const chars2 = new Set(title2.replace(/\s/g, ''));

  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}
