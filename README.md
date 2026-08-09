# Blog Workspace

个人博客前端工作区：**Astro 前台（SSG）+ Vue 后台（SPA）**。后端为独立仓库（Spring Boot，见 blog 仓库）。

## 结构

```
blog-front/
├── src/
│   ├── content/               # 文章内容（由外部 blog-content 仓库同步生成）
│   ├── pages/                 # 首页/文章/分类/标签/归档/工具/关于/友链/404
│   ├── components/            # Astro 组件 + islands/（Vue 岛）
│   ├── layouts/               # BaseLayout
│   ├── lib/                   # 站点配置 + 内容查询
│   └── styles/                # 主题 CSS 变量
├── blog-admin/                # 后台（Vue 3 + Element Plus，独立构建）
├── public/                    # 静态资源 + robots.txt
└── astro.config.mjs
```

## 开发

```bash
# 前台（Astro）
cd blog-front
npm install
npm run dev          # http://localhost:4321
npm run build        # 构建到 dist/ + Pagefind 搜索索引

# 后台（Vue admin）
cd blog-front/blog-admin
npm run dev          # http://localhost:3001/admin/
npm run build
```

依赖 MySQL（库名 `blog_dev`）+ JDK 17，SQL 初始化见 blog 仓库 `sql/`。

## 内容管理

文章由独立仓库 [blog-content](https://github.com/Peter-Lpt/blog-content) 管理，通过 `BLOG_CONTENT_DIR` 环境变量指向（见 `.env.content`）。

**新增文章**：在内容仓库 `blog/blog/` 创建 `YYYY-MM-DD-{slug}.md`：
```markdown
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-06-14
slug: article-slug
category: 前端
tags: [Vue, 性能优化]
draft: false
---
正文内容...
```

**新增工具记录**：在内容仓库 `tools/` 创建 `{slug}.md`。

**发布**：内容仓库 commit 推送后，在前端执行：
```bash
npm run content:sync && npm run build
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前台 | Astro + MDX + Vue 3（岛屿）+ Shiki + Pagefind |
| 后台 | Vue 3 + Element Plus + Pinia + Vue Router |
| 搜索 | Pagefind（构建时生成静态索引） |

## License

[MIT](LICENSE)
