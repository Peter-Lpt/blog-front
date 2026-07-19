import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const requiredFiles = [
  'index.html',
  'blog/welcome/index.html',
  'rss.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'pagefind/pagefind-entry.json',
  'admin/index.html',
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  console.error(`[smoke] 缺少构建产物: ${missing.join(', ')}`);
  process.exit(1);
}

const adminIndex = readFileSync(resolve(root, 'admin/index.html'), 'utf8');
if (!adminIndex.includes('<div id="app"></div>') || adminIndex.includes('window.location.replace')) {
  console.error('[smoke] 管理后台入口不是可加载的 Vue 应用首页');
  process.exit(1);
}

const articleIndex = readFileSync(resolve(root, 'blog/welcome/index.html'), 'utf8');
if (!articleIndex.includes('欢迎使用我的博客')) {
  console.error('[smoke] 中文文章页面未生成');
  process.exit(1);
}

console.log(`[smoke] 构建产物检查通过（${requiredFiles.length} 项）`);
