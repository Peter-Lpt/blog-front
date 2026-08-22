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
  /**
   * AI 记录（板块设计 v3）：扁平目录 blog-content/ai/*.md，slug 即文件名。
   * category 自由字符串，chips 与分节自动生成；
   * 正文为空的条目不生成详情页、列表中不可点击（简介即全部信息）。
   */
  ai: {
    type: 'content',
    schema: z.object({
      title: z.string(),
      category: z.string(),
      // 官网链接（单个或多个）
      official: z.union([z.string().url(), z.array(z.string().url())]).optional(),
      brief: z.string().optional(),
      // 引用的博客文章 slug / 相关记录 slug
      articles: z.array(z.string()).default([]),
      related: z.array(z.string()).default([]),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
  },
  /**
   * 提示词测试记录（专栏二主体）：每测一次「模型 × 提示词」一条。
   * model / prompt 都是自由文本或 slug，无任何状态字段。
   */
  lab: {
    type: 'content',
    schema: z.object({
      title: z.string(),
      model: z.string(),
      // 跑测试用的 agent/cli（如 dsh、claude-code），第三个筛选维度
      agent: z.string().default(''),
      // 指向提示词库（prompts 集合）的 slug
      prompt: z.string(),
      date: z.coerce.date(),
      // 产出物入口页（挂载到沙箱 iframe），如 /artifacts/heavy-hole-gargantua/index.html
      artifact: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
  },
  /** 提示词库：一份提示词一个 md，多版本用围栏上下叠放写在正文。 */
  prompts: {
    type: 'content',
    schema: z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
  },
};
