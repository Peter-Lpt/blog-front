import { z } from 'astro:content';

/**
 * 内容集合定义（FS-003）
 * - blog：文章。统一 frontmatter：slug（稳定唯一）、category、tags、draft 等。
 * - tools：工具记录。
 *
 * 分类优先级：frontmatter.category > blog 下直接父目录 > 未分类（见 posts.ts resolveCategory）。
 */
export const collections = {
  blog: {
    type: 'content',
    schema: z.object({
      title: z.string(),
      // 注意：slug 是 Astro 内容集合的保留字段，由 frontmatter.slug 或文件名自动注入，
      // 不能放入 zod schema（否则会被剥离导致校验失败）。统一通过 posts.ts getSlug() 读取。
      description: z.string().default(''),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // 主分类：frontmatter.category 优先；缺省时由目录名推导（见 resolveCategory）
      category: z.string().optional(),
      // 兼容旧结构：tags[0] 曾作为主分类
      tags: z.array(z.string()).default([]),
      coverImage: z.string().optional(),
      draft: z.boolean().default(false),
    }),
  },
  tools: {
    type: 'content',
    schema: z.object({
      name: z.string(),
      slug: z.string().optional(),
      url: z.string().url(),
      category: z.string(),
      icon: z.string().optional(),
      tags: z.array(z.string()).default([]),
      rating: z.number().min(0).max(5).optional(),
      cost: z.enum(['free', 'freemium', 'paid']).optional(),
      platform: z.array(z.string()).default([]),
      addedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().default(false),
    }),
  },
};
