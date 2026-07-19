import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * 分类解析优先级（FS-003 / 04 文档）：
 *   frontmatter.category > blog 下直接父目录 > 未分类
 * 注意：collection entry 的 id 形如「随笔/2026-06-14-welcome.md」，
 * 父目录即默认分类。
 */
export function resolveCategory(post: Post): string {
  if (post.data.category && post.data.category.trim()) return post.data.category.trim();
  const parent = post.id.includes('/') ? post.id.split('/').slice(0, -1).join('/') : '';
  if (parent) return parent;
  // 兼容 tags[0] 旧结构
  if (post.data.tags?.[0]) return post.data.tags[0];
  return '未分类';
}

/**
 * 获取文章的独立标签：去空、去重，并排除主分类。
 */
export function resolveTags(post: Post): string[] {
  const category = resolveCategory(post);
  return [...new Set(
    (post.data.tags || [])
      .map((tag) => tag.trim())
      .filter((tag) => tag && tag !== category),
  )];
}

/**
 * 稳定 slug：优先 Astro 注入的 post.slug，缺省时取去除日期前缀的文件名。
 */
export function getSlug(post: Post): string {
  if ((post as any).slug) return (post as any).slug;
  return post.id
    .replace(/\.mdx?$/, '')
    .split('/')
    .pop()!
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/**
 * 是否包含草稿：受环境变量 CONTENT_INCLUDE_DRAFTS 控制（默认 false，正式构建排除草稿）
 */
function includeDrafts(): boolean {
  return process.env.CONTENT_INCLUDE_DRAFTS === 'true';
}

/**
 * 获取当前构建可见的文章（受草稿开关控制），按发布日期降序
 */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => includeDrafts() || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * 获取所有已发布文章（排除 draft），按发布日期降序
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * 主分类聚合（去重计数，按文章数降序）
 */
export async function getMainCategories(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  const result: Record<string, number> = {};
  posts.forEach((p) => {
    const cat = resolveCategory(p);
    result[cat] = (result[cat] || 0) + 1;
  });
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1]));
}

/**
 * 全部标签云聚合
 */
export async function getAllTags(): Promise<Record<string, number>> {
  const posts = await getAllPosts();
  const result: Record<string, number> = {};
  posts.forEach((post) => {
    resolveTags(post).forEach((tag) => {
      result[tag] = (result[tag] || 0) + 1;
    });
  });
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1]));
}

/**
 * 按主分类筛选
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => resolveCategory(p) === category);
}

/**
 * 按任意标签筛选
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => resolveTags(p).includes(tag));
}

/**
 * 按年月归档
 */
export async function getArchives(): Promise<Record<string, Post[]>> {
  const posts = await getAllPosts();
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
  const posts = await getAllPosts();
  const result: Record<string, number> = {};
  posts.forEach((p) => {
    const d = p.data.pubDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result[key] = (result[key] || 0) + 1;
  });
  return result;
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
