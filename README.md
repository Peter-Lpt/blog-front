# Blog Workspace

个人博客 Monorepo 工作区。

> `blog-admin/` 是唯一正式管理后台；Astro 前台保持静态生成，后端为独立 Spring Boot 仓库。

## 结构

```
blog-front/                    # 前台（Astro SSG）
├── src/
│   ├── content/               # 由外部 blog-content 仓库同步生成
│   ├── pages/                 # 路由：首页/文章/分类/标签/归档/工具/关于/友链/404
│   ├── components/            # Astro 组件 + islands/（Vue 岛）
│   ├── layouts/               # BaseLayout
│   ├── lib/                   # 站点配置 + 内容查询
│   └── styles/                # 主题 CSS 变量
├── blog-admin/                # 后台（Vue 3 SPA，独立构建）
│   └── src/views/             # LoginView / AdminLayout / CommentManage / FriendLinkManage
├── astro.config.mjs
└── public/                    # 静态资源 + robots.txt
```

后端代码位于另一仓库：`java/self/blog/`（Spring Boot）。

## 开发

### 前台（Astro）
```bash
cd blog-front
npm install
npm run dev          # http://localhost:4321
npm run build        # 构建到 dist/，并跑 Pagefind 索引
npm run preview      # 本地预览构建产物
npm run smoke        # 检查首页、文章、后台、RSS、sitemap 和 Pagefind 产物
```

### 后台（Vue admin）
```bash
cd blog-front/blog-admin
npm install
npm run dev          # http://localhost:3001/admin/
npm run build        # 构建到 dist/
```

### 后端（Spring Boot）
```bash
cd blog
mvn spring-boot:run -pl blog-spring-boot-starter    # http://localhost:8001
```

需要 MySQL（库名 blog_dev）+ JDK 17。SQL 初始化见 `blog/sql/`。

## 内容管理

### 新增文章
在外部 `blog-content/blog/` 创建 `YYYY-MM-DD-{slug}.md`，通过 `BLOG_CONTENT_DIR` 指向该仓库：
```markdown
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-06-14
slug: article-slug
category: 前端
tags: [Vue, 性能优化]
coverImage: /images/{slug}/cover.jpg   # 可选
draft: false
---
正文内容...
```

### 新增工具记录
在 `blog-front/src/content/tools/` 创建 `{slug}.md`：
```markdown
---
name: 工具名
url: https://example.com
category: 开发
icon: 🛠️
tags: [标签1, 标签2]
rating: 5
addedDate: 2026-06-14
---
使用记录...
```

### 发布流程
内容仓库 commit 后，在前端仓库执行 `npm run content:check && npm run content:sync && npm run build`。

## 文档

完整架构决策记录见 `java/self/docs/`：
- `ADR-001` Markdown 文件驱动选型
- `ADR-002` Astro 前台架构
- `ADR-003` Monorepo 组织
- `ADR-004` 图片方案
- `ADR-005` 评论审核引擎
- `ADR-006` 工具页面设计
- `ADR-007` GitHub OAuth 登录
- `ADR-008` 分类标签设计
- `ROADMAP-后续升级路线`
- `TECH_STACK-新技术引入清单`
- `TASK_CHECKLIST`（任务清单）

## 技术栈

| 层 | 技术 |
|---|---|
| 前台 | Astro 5 + MDX + Vue 3（岛屿） + Tailwind + Shiki + Pagefind |
| 后台 | Vue 3 + Element Plus + Pinia + Vue Router |
| 后端 | Spring Boot 2.6 + MyBatis-Plus + MySQL + JWT |
| 运行 | 本地 Markdown Git + 本地 Astro + 本地 Spring Boot |

## License

Private.
