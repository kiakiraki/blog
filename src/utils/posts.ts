import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type Category } from '../consts';

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
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  return {
    posts: allPosts.slice(start, end),
    totalPosts,
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
  return CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = allPosts.filter(post => post.data.category === category).length;
      return acc;
    },
    {} as Record<Category, number>
  );
}
