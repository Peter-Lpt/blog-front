// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

// 构建前把管理后台（blog-admin）产物同步进 public/admin/，供 Astro 原样拷贝到 dist/admin/
// 仅「唯一正式后台」blog-admin 作为后台入口，Astro /admin 仅做跳转。
function copyAdminDist() {
  const src = resolve(process.cwd(), 'blog-admin', 'dist');
  const dest = resolve(process.cwd(), 'dist', 'admin');
  if (!existsSync(src)) return;
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  /**
   * @param {string} s
   * @param {string} d
   */
  const walk = (s, d) => {
    for (const name of readdirSync(s)) {
      const sp = join(s, name);
      const dp = join(d, name);
      if (statSync(sp).isDirectory()) {
        mkdirSync(dp, { recursive: true });
        walk(sp, dp);
      } else {
        copyFileSync(sp, dp);
      }
    }
  };
  walk(src, dest);
}

function syncAdminBuild() {
  console.log('[astro.config] building blog-admin...');
  execSync('npm run build:admin', { stdio: 'inherit', cwd: process.cwd() });
  copyAdminDist();
}

// https://astro.build/config
export default defineConfig({
  // TODO: 上线前替换为正式域名（影响 sitemap/RSS 绝对 URL）
  site: 'https://example.com',
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
    vue(),
    {
      name: 'sync-admin-build',
      hooks: {
       'astro:build:done': syncAdminBuild,
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
