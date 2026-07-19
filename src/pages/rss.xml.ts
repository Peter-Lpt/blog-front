import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/lib/config';
import { getPublishedPosts, getSlug, resolveCategory, resolveTags } from '@/lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || '',
      pubDate: post.data.pubDate,
      link: `/blog/${getSlug(post)}/`,
      categories: [resolveCategory(post), ...resolveTags(post)],
    })),
    customData: `<language>zh-CN</language>`,
  });
}
