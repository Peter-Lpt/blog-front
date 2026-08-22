/**
 * scripts/validate-content.mjs
 *
 * 内容校验（FS-003）：在同步和构建前校验路径、frontmatter、日期、slug、分类和资源引用。
 *
 * 读取 BLOG_CONTENT_DIR（默认回退 ../blog-content，再回退 ../../content/blog-content）。
 * 只校验 blog/ 与 tools/ 下的 .md/.mdx 文件。
 *
 * 退出码：0 通过；1 存在错误。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { load } from 'js-yaml';

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
const BLOG_DIR = join(ROOT, 'blog');
const TOOLS_DIR = join(ROOT, 'tools');
const ASSETS_DIR = join(ROOT, 'assets');
// AI 记录 / 提示词测试 / 提示词库（板块设计 v3）
const AI_DIR = join(ROOT, 'ai');
const LAB_DIR = join(ROOT, 'lab');
const PROMPTS_DIR = join(ROOT, 'prompts');

/** 解析环境变量中的内容仓库根目录，不写死绝对路径 */
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
  // 仍返回首个候选，便于打印明确错误
  return resolve(candidates.find(Boolean) || process.cwd());
}

/** 递归收集目录下的 .md/.mdx */
function collectMarkdown(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...collectMarkdown(full));
    else if (/\.(md|mdx)$/i.test(name)) out.push(full);
  }
  return out;
}

/** 解析 frontmatter，返回 { data, body, error } */
function parseFrontmatter(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: null, body: raw, error: '缺少 YAML frontmatter 包裹（---）' };
  try {
    const data = load(m[1]);
    if (typeof data !== 'object' || data === null) return { data: null, body: m[2], error: 'frontmatter 不是合法对象' };
    return { data, body: m[2], error: null };
  } catch (e) {
    return { data: null, body: m[2], error: `frontmatter YAML 解析失败：${e.message}` };
  }
}

/** 校验图片引用是否在 assets 内（不引用本地绝对路径） */
function checkImageRefs(file, body, errors) {
  const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  let mm;
  while ((mm = imgRe.exec(body))) {
    const src = mm[1].trim();
    if (/^(https?:)?\/\//i.test(src)) continue; // 远程图片允许
    if (/^[a-zA-Z]:[\\/]|^\/|[\\]/.test(src)) {
      errors.push(`${rel(file)}: 图片使用了本地绝对/反斜杠路径（禁止）: ${src}`);
      continue;
    }
    // 相对路径应落在 assets 目录内
    const abs = resolve(dirname(file), src);
    if (!abs.startsWith(ASSETS_DIR)) {
      errors.push(`${rel(file)}: 图片路径不在 assets/ 内: ${src}`);
    }
  }
}

function dirname(p) {
  return p.split(sep).slice(0, -1).join(sep);
}
function rel(p) {
  return relative(ROOT, p).split(sep).join('/');
}

const errors = [];
const slugMap = new Map();
let fileCount = 0;

// ── blog 文章 ──
for (const file of collectMarkdown(BLOG_DIR)) {
  fileCount++;
  const { data, body, error } = parseFrontmatter(file);
  if (error) {
    errors.push(`${rel(file)}: ${error}`);
    continue;
  }
  // 必填
  if (!data.title || typeof data.title !== 'string') errors.push(`${rel(file)}: 缺少必填字段 title`);
  if (!data.pubDate) errors.push(`${rel(file)}: 缺少必填字段 pubDate`);
  else if (isNaN(Date.parse(String(data.pubDate)))) errors.push(`${rel(file)}: pubDate 不是合法日期: ${data.pubDate}`);
  if (!data.slug || typeof data.slug !== 'string') errors.push(`${rel(file)}: 缺少必填字段 slug`);
  if (typeof data.draft !== 'boolean') errors.push(`${rel(file)}: draft 必须是布尔值`);
  // slug 全局唯一
  if (data.slug) {
    const prev = slugMap.get(data.slug);
    if (prev) errors.push(`slug 重复「${data.slug}」: ${prev} 与 ${rel(file)}`);
    else slugMap.set(data.slug, rel(file));
  }
  // 分类优先级：frontmatter.category > 目录名
  if (data.category && typeof data.category !== 'string') errors.push(`${rel(file)}: category 必须是字符串`);
  checkImageRefs(file, body, errors);
}

// ── tools 工具 ──
for (const file of collectMarkdown(TOOLS_DIR)) {
  fileCount++;
  const { data, error } = parseFrontmatter(file);
  if (error) {
    errors.push(`${rel(file)}: ${error}`);
    continue;
  }
  if (!data.name) errors.push(`${rel(file)}: 缺少必填字段 name`);
  if (!data.url) errors.push(`${rel(file)}: 缺少必填字段 url`);
  if (!data.addedDate) errors.push(`${rel(file)}: 缺少必填字段 addedDate`);
  else if (isNaN(Date.parse(String(data.addedDate)))) errors.push(`${rel(file)}: addedDate 不是合法日期`);
  if (!data.slug) errors.push(`${rel(file)}: tools 建议提供 slug 字段`);
  if (data.slug) {
    const prev = slugMap.get(data.slug);
    if (prev) errors.push(`slug 重复「${data.slug}」: ${prev} 与 ${rel(file)}`);
    else slugMap.set(data.slug, rel(file));
  }
}

// ── ai 记录条目 ──
for (const file of collectMarkdown(AI_DIR)) {
  fileCount++;
  const { data, error } = parseFrontmatter(file);
  if (error) {
    errors.push(`${rel(file)}: ${error}`);
    continue;
  }
  const slug = rel(file).replace(/^ai\//, '').replace(/\.(md|mdx)$/i, '');
  if (!data.title) errors.push(`${rel(file)}: 缺少必填字段 title`);
  if (!data.category || typeof data.category !== 'string') errors.push(`${rel(file)}: 缺少必填字段 category`);
  if (!data.date) errors.push(`${rel(file)}: 缺少必填字段 date`);
  else if (isNaN(Date.parse(String(data.date)))) errors.push(`${rel(file)}: date 不是合法日期`);
  if (typeof data.draft !== 'undefined' && typeof data.draft !== 'boolean') errors.push(`${rel(file)}: draft 必须是布尔值`);
  if (slugMap.has(slug)) errors.push(`ai slug 重复「${slug}」`);
}

// ── lab 测试记录 ──
for (const file of collectMarkdown(LAB_DIR)) {
  fileCount++;
  const { data, error } = parseFrontmatter(file);
  if (error) {
    errors.push(`${rel(file)}: ${error}`);
    continue;
  }
  if (!data.title) errors.push(`${rel(file)}: 缺少必填字段 title`);
  if (!data.model) errors.push(`${rel(file)}: 缺少必填字段 model`);
  if (!data.agent) errors.push(`${rel(file)}: 缺少必填字段 agent`);
  if (!data.prompt) errors.push(`${rel(file)}: 缺少必填字段 prompt`);
  if (!data.date) errors.push(`${rel(file)}: 缺少必填字段 date`);
  else if (isNaN(Date.parse(String(data.date)))) errors.push(`${rel(file)}: date 不是合法日期`);
  if (typeof data.draft !== 'undefined' && typeof data.draft !== 'boolean') {
    errors.push(`${rel(file)}: draft 必须是布尔值`);
  }
}

// ── prompts 提示词库 ──
for (const file of collectMarkdown(PROMPTS_DIR)) {
  fileCount++;
  const { data, error } = parseFrontmatter(file);
  if (error) {
    errors.push(`${rel(file)}: ${error}`);
    continue;
  }
  if (!data.title) errors.push(`${rel(file)}: 缺少必填字段 title`);
  if (!data.date) errors.push(`${rel(file)}: 缺少必填字段 date`);
  else if (isNaN(Date.parse(String(data.date)))) errors.push(`${rel(file)}: date 不是合法日期`);
}

console.log(`[content:check] 内容仓库: ${ROOT}`);
console.log(`[content:check] 校验文件数: ${fileCount}，slug 数: ${slugMap.size}`);

if (errors.length) {
  console.error('\n❌ 内容校验失败：');
  for (const e of errors) console.error('  - ' + e);
  console.error(`\n共 ${errors.length} 处错误。`);
  process.exit(1);
}
console.log('✅ 内容校验通过。');
process.exit(0);
