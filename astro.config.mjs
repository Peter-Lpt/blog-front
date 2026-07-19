// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { execSync } from 'node:child_process';

// 构建前把管理后台（blog-admin）产物同步进 public/admin/，供 Astro 原样拷贝到 dist/admin/
// 仅「唯一正式后台」blog-admin 作为后台入口，Astro /admin 仅做跳转。
function syncAdminBuild() {
  try {
    console.log('[astro.config] building blog-admin...');
    execSync('npm run build:admin', { stdio: 'inherit', cwd: process.cwd() });
  } catch (e) {
    console.warn('[astro.config] blog-admin build 失败，跳过 public/admin 同步：', e.message);
  }
}

// https://astro.build/config
export default defineConfig({
  // TODO: 上线前替换为正式域名（影响 sitemap/RSS 绝对 URL）
  site: 'https://example.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
    vue(),
    {
      name: 'sync-admin-build',
      hooks: {
        'astro:build:start': syncAdminBuild,
      },
    },
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
});
