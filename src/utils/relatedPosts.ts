import type { CollectionEntry } from 'astro:content';
import { selectRelatedPosts, type ScorablePost } from './relatedScore';

type BlogPost = CollectionEntry<'blog'>;

function toScorablePost(post: BlogPost): ScorablePost {
  return {
    id: post.id,
    title: post.data.title,
    category: post.data.category,
    pubDate: post.data.pubDate,
  };
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
  const postsById = new Map(allPosts.map(post => [post.id, post]));

  const related = selectRelatedPosts(
    toScorablePost(currentPost),
    allPosts.map(toScorablePost),
    maxCount
  );

  return related.map(({ id }) => postsById.get(id)!);
}
