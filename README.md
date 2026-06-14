# Blog Workspace

个人博客 Monorepo 工作区。

> 当前为过渡结构：`blog-front/`（Astro 前台）与 `blog-front/blog-admin/`（Vue 后台）位于同一仓库；后端为独立仓库（待后续整合为完整 Monorepo）。

## 结构

```
blog-front/                    # 前台（Astro SSG）
├── src/
│   ├── content/
│   │   ├── blog/              # 文章 Markdown（扁平，分类走 frontmatter tags）
│   │   └── tools/             # 工具记录 Markdown
│   ├── pages/                 # 路由：首页/文章/分类/标签/归档/工具/关于/友链/404
│   ├── components/            # Astro 组件 + islands/（Vue 岛）
│   ├── layouts/               # BaseLayout
│   ├── lib/                   # 站点配置 + 内容查询
│   └── styles/                # 主题 CSS 变量
├── blog-admin/                # 后台（Vue 3 SPA，独立构建）
│   └── src/views/             # LoginView / AdminLayout / CommentManage / FriendLinkManage
├── legacy-vue/                # 旧 Vue SPA 源码（参考用，可删）
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
在 `blog-front/src/content/blog/` 创建 `YYYY-MM-DD-{slug}.md`：
```markdown
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-06-14
tags: [前端, Vue, 性能优化]   # 第一个 tag 为主分类
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
`git push` → GitHub Actions 自动构建部署（main 分支）。

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
| 部署 | GitHub Actions + GitHub Pages（前台）/ 服务器（后端） |

## License

Private.
