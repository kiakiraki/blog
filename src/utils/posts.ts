import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type Category } from '../consts';
import { paginate, countByCategory } from './pagination';

let cachedPosts: CollectionEntry<'blog'>[] | null = null;

/**
 * Get all blog posts sorted by publication date (newest first).
 * Results are cached for the duration of the build process.
 */
export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (!cachedPosts) {
    cachedPosts = (await getCollection('blog')).sort(
      (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );
  }
  return cachedPosts;
}

/**
 * Get posts for a specific page with pagination.
 */
export async function getPostsForPage(
  page: number,
  postsPerPage: number
): Promise<{
  posts: CollectionEntry<'blog'>[];
  totalPosts: number;
  totalPages: number;
}> {
  const allPosts = await getAllPosts();
  const { items, totalItems, totalPages } = paginate(allPosts, page, postsPerPage);

  return {
    posts: items,
    totalPosts: totalItems,
    totalPages,
  };
}

/**
 * Get posts by category.
 */
export async function getPostsByCategory(category: string): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.data.category === category);
}

/**
 * Get the number of posts in each category.
 */
export async function getCategoryCounts(): Promise<Record<Category, number>> {
  const allPosts = await getAllPosts();
  return countByCategory(
    CATEGORIES,
    allPosts.map(post => post.data.category)
  );
}
