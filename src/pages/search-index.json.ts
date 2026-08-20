import type { APIRoute } from 'astro';
import { getAllPosts, getSlug, resolveCategory, resolveTags, getPostDescription, formatDate } from '@/lib/posts';

/**
 * 全局搜索索引：把全部已发布文章序列化为轻量 JSON，
 * 供 SearchDialog 在前端离线检索（无需依赖 Pagefind 客户端装配）。
 */
export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const index = posts.map((post) => {
    const slug = getSlug(post);
    const tags = resolveTags(post);
    return {
      title: post.data.title,
      url: `/blog/${slug}/`,
      category: resolveCategory(post),
      date: formatDate(post.data.pubDate),
      tags,
      summary: getPostDescription(post, 120),
    };
  });
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
