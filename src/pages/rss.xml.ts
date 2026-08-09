import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/lib/config';
import { getPublishedPosts, getPostDescription, getSlug, resolveCategory, resolveTags } from '@/lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      // frontmatter.description 缺省时自动从正文提取摘要，保证 RSS 描述不为空
      description: getPostDescription(post),
      pubDate: post.data.pubDate,
      link: `/blog/${getSlug(post)}/`,
      categories: [resolveCategory(post), ...resolveTags(post)],
    })),
    customData: `<language>zh-CN</language>`,
  });
}
