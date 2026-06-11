import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, AUTHOR_NAME } from '../consts';

export const prerender = true;

export async function GET(context) {
  const posts = await getCollection('blog');

  // Sort posts by publication date (newest first)
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: sortedPosts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      guid: `/blog/${post.id}/`,
      categories: [post.data.category],
      author: AUTHOR_NAME,
    })),
    customData: `
			<language>ja</language>
			<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
			<ttl>60</ttl>
		`,
    stylesheet: '/rss-styles.xsl',
  });
}
