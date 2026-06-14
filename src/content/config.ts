import type { ContentConfig } from 'astro';
import { defineCollection, z } from 'astro:content';

/**
 * 内容集合定义
 * - blog：文章（扁平目录，分类信息走 frontmatter tags）
 * - tools：工具记录
 *
 * 详见 docs/ADR-001（Markdown 文件驱动）、ADR-006（工具页面）、ADR-008（分类标签设计）
 */
export const collections: ContentConfig['collections'] = {
  blog: {
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // 第一个 tag 视作主分类（见 ADR-008）
      tags: z.array(z.string()).default([]),
      coverImage: z.string().optional(),
      draft: z.boolean().default(false),
    }),
  },
  tools: {
    type: 'content',
    schema: z.object({
      name: z.string(),
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
