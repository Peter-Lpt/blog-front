---
name: Astro
url: https://astro.build
category: 开发
icon: 🚀
slug: astro
tags: [SSG, 框架, 前端]
rating: 5
cost: free
platform: [mac, windows, linux]
addedDate: 2026-06-14
draft: false
---

## 我怎么用的

本博客前台就是用 Astro 构建的。从 Vue SPA 迁移过来，主要看中它的：

- 默认零 JS 输出，性能极佳
- 岛屿架构，需要交互的部分才加载 JS
- 原生支持 Markdown/MDX 内容集合
- 生态完善（sitemap、rss、mdx、vue 集成）

## 技巧

- `client:load` / `client:idle` / `client:visible` 控制岛组件水合时机
- `getCollection('blog')` 获取内容，配合 zod schema 类型安全
- Shiki 内置代码高亮，支持双主题

## 踩过的坑

- 多级嵌套的动态路由 `getStaticPaths` 要小心 paginate 的组合
- `public/` 下的文件原样复制，路径以 `/` 开头
