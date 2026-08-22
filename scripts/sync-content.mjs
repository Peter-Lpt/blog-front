/**
 * scripts/sync-content.mjs
 *
 * 内容同步（FS-002）：从独立 Markdown Git 仓库同步到 Astro 构建输入目录。
 *
 * 同步关系（详见 04/05 文档）：
 *   blog-content/blog   -> src/content/blog
 *   blog-content/tools  -> src/content/tools
 *   blog-content/assets -> public/images
 *
 * .content 是生成目录，不提交到前端 Git 仓库。
 * 只同步允许的目录与扩展名；不删除目标目录中其它文件（保留手写产物安全）。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

loadEnvFile();

/** 读取 .env.content（若存在），仅用于本地内容仓库路径，不提交 */
function loadEnvFile() {
  const f = resolve(process.cwd(), '.env.content');
  if (!existsSync(f)) return;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const ROOT = resolveContentDir();
const SRC_BLOG = join(ROOT, 'blog');
const SRC_TOOLS = join(ROOT, 'tools');
const SRC_ASSETS = join(ROOT, 'assets');
// AI 记录 / 提示词测试 / 提示词库 / 产出物挂载件（AI 板块设计 v3）
const SRC_AI = join(ROOT, 'ai');
const SRC_LAB = join(ROOT, 'lab');
const SRC_PROMPTS = join(ROOT, 'prompts');
const SRC_ARTIFACTS = join(ROOT, 'artifacts');

const DEST_BLOG = resolve(process.cwd(), 'src', 'content', 'blog');
const DEST_TOOLS = resolve(process.cwd(), 'src', 'content', 'tools');
const DEST_AI = resolve(process.cwd(), 'src', 'content', 'ai');
const DEST_LAB = resolve(process.cwd(), 'src', 'content', 'lab');
const DEST_PROMPTS = resolve(process.cwd(), 'src', 'content', 'prompts');
const DEST_IMAGES = resolve(process.cwd(), 'public', 'images');
const DEST_ARTIFACTS = resolve(process.cwd(), 'public', 'artifacts');

const ALLOWED_EXT = /\.(md|mdx)$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

function resolveContentDir() {
  const fromEnv = process.env.BLOG_CONTENT_DIR;
  const candidates = [
    fromEnv,
    resolve(process.cwd(), '..', 'blog-content'),
    resolve(process.cwd(), '..', '..', 'content', 'blog-content'),
    resolve(process.cwd(), 'blog-content'),
  ].filter(Boolean);
  for (const c of candidates) {
    if (c && existsSync(c) && existsSync(join(c, 'blog'))) return resolve(c);
  }
  console.error(`[content:sync] 未找到内容仓库。请设置 BLOG_CONTENT_DIR 或把仓库放在 ${candidates[1]} 等位置。`);
  process.exit(1);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** 复制文件，文本类（md/mdx）统一规范为 LF 换行，避免 CRLF 破坏 frontmatter 解析 */
function copyNormalized(sp, dp) {
  if (ALLOWED_EXT.test(sp)) {
    const text = readFileSync(sp, 'utf8').replace(/\r\n/g, '\n');
    writeFileSync(dp, text, 'utf8');
  } else {
    copyFileSync(sp, dp);
  }
}

/** 全量覆盖式同步一个目录（清空目标后复制，保证与源一致） */
function syncDir(src, dest, filter) {
  if (!existsSync(src)) {
    console.log(`[content:sync] 源目录不存在，跳过: ${relative(process.cwd(), src)}`);
    return 0;
  }
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  ensureDir(dest);
  let count = 0;
  const walk = (s, d) => {
    for (const name of readdirSync(s)) {
      const sp = join(s, name);
      const dp = join(d, name);
      const st = statSync(sp);
      if (st.isDirectory()) {
        ensureDir(dp);
        walk(sp, dp);
      } else if (!filter || filter(name)) {
        copyNormalized(sp, dp);
        count++;
      }
    }
  };
  walk(src, dest);
  return count;
}

/** assets 增量同步到 public/images（保留 public 下其它文件） */
function syncImages() {
  if (!existsSync(SRC_ASSETS)) {
    console.log('[content:sync] 源 assets 不存在，跳过图片同步');
    return 0;
  }
  ensureDir(DEST_IMAGES);
  let count = 0;
  const walk = (s, d) => {
    for (const name of readdirSync(s)) {
      const sp = join(s, name);
      const dp = join(d, name);
      const st = statSync(sp);
      if (st.isDirectory()) {
        ensureDir(dp);
        walk(sp, dp);
      } else if (IMAGE_EXT.test(name)) {
        copyNormalized(sp, dp);
        count++;
      }
    }
  };
  walk(SRC_ASSETS, DEST_IMAGES);
  return count;
}

console.log(`[content:sync] 内容仓库: ${ROOT}`);

const blogN = syncDir(SRC_BLOG, DEST_BLOG, (n) => ALLOWED_EXT.test(n));
const toolsN = syncDir(SRC_TOOLS, DEST_TOOLS, (n) => ALLOWED_EXT.test(n));
const aiN = syncDir(SRC_AI, DEST_AI, (n) => ALLOWED_EXT.test(n));
const labN = syncDir(SRC_LAB, DEST_LAB, (n) => ALLOWED_EXT.test(n));
const promptsN = syncDir(SRC_PROMPTS, DEST_PROMPTS, (n) => ALLOWED_EXT.test(n));
const imgN = syncImages();
// artifacts 整目录同步（多文件产出物项目：html/css/js 等全类型），供沙箱 iframe 挂载
const artN = syncDir(SRC_ARTIFACTS, DEST_ARTIFACTS);

console.log(`[content:sync] 同步文章 ${blogN} 篇，工具 ${toolsN} 篇，AI 条目 ${aiN} 条，测试记录 ${labN} 条，提示词 ${promptsN} 份，图片 ${imgN} 张，产出物文件 ${artN} 个`);
console.log('✅ 内容同步完成。');
process.exit(0);
