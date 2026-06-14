import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * 获取所有已发布文章（排除 draft），按发布日期降序
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * 主分类聚合：每篇文章的 tags[0]（见 ADR-008）
 */
export async function getMainCategories(): Promise<Record<string, number>> {
  const posts = await getPublishedPosts();
  const result: Record<string, number> = {};
  posts.forEach((p) => {
    const cat = p.data.tags?.[0];
    if (cat) result[cat] = (result[cat] || 0) + 1;
  });
  // 按文章数降序
  return Object.fromEntries(
    Object.entries(result).sort((a, b) => b[1] - a[1])
  );
}

/**
 * 全部标签云聚合
 */
export async function getAllTags(): Promise<Record<string, number>> {
  const posts = await getPublishedPosts();
  const result: Record<string, number> = {};
  posts.forEach((p) => {
    (p.data.tags || []).forEach((t) => {
      result[t] = (result[t] || 0) + 1;
    });
  });
  return Object.fromEntries(
    Object.entries(result).sort((a, b) => b[1] - a[1])
  );
}

/**
 * 按主分类筛选
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.tags?.[0] === category);
}

/**
 * 按任意标签筛选
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => (p.data.tags || []).includes(tag));
}

/**
 * 按年月归档
 */
export async function getArchives(): Promise<Record<string, Post[]>> {
  const posts = await getPublishedPosts();
  const groups: Record<string, Post[]> = {};
  posts.forEach((p) => {
    const d = p.data.pubDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    (groups[key] ||= []).push(p);
  });
  return groups;
}

/**
 * 按日统计文章数量（供日历归档用）
 */
export async function getArticleDatesByDay(): Promise<Record<string, number>> {
  const posts = await getPublishedPosts();
  const result: Record<string, number> = {};
  posts.forEach((p) => {
    const d = p.data.pubDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

/**
 * 文章 slug（去掉 .md 后缀）
 */
export function getSlug(post: Post): string {
  return post.id.replace(/\.md$/, '').replace(/\.mdx$/, '');
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
