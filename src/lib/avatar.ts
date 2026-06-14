/**
 * 默认头像生成（Identicon 风格）
 *
 * 基于用户名/ID hash 生成 SVG 网格头像，纯客户端计算，零依赖、零存储。
 * 用于本地注册用户（无 GitHub 头像）。
 *
 * 原理：7x7 对称网格，根据 hash 的 bit 决定每个格子是否填充，
 * 颜色取 hash 映射到 HSL。生成确定性头像（同用户名永远是同一张）。
 */

const COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
  ['#ffecd2', '#fcb69f'],
  ['#ff6a00', '#ee0979'],
];

/** 简单字符串 hash（djb2） */
function hashStr(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * 生成头像 data URL（SVG）
 * @param seed 种子（用户名/ID）
 */
export function generateAvatar(seed: string): string {
  const h = hashStr(seed || 'anonymous');
  const [c1, c2] = COLORS[h % COLORS.length];

  // 5x5 对称网格（左右对称 = 3 列独立 + 镜像）
  const grid: boolean[] = [];
  let bits = h;
  for (let i = 0; i < 15; i++) {
    grid.push((bits & 1) === 1);
    bits = bits >>> 1;
    if (i % 5 === 4) bits = (bits * 31 + h) | 0; // 补充熵
  }

  // 构建 SVG（10x10 单元，padding 1）
  const cell = 1;
  const size = 7; // 总宽 7 单元（5 + 2 padding）
  let rects = '';
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // 左右对称：col 映射
      const srcCol = col < 3 ? col : 4 - col;
      const idx = row * 5 + srcCol;
      if (grid[idx]) {
        const x = 1 + col * cell;
        const y = 1 + row * cell;
        rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="0.15"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    <g fill="rgba(255,255,255,0.9)">${rects}</g>
  </svg>`;

  const isBrowser = typeof window !== 'undefined';
  const encoded = isBrowser
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * 获取用户头像 URL
 * - 有 avatar 字段（如 GitHub 登录）→ 直接用
 * - 无 avatar → 生成 Identicon
 */
export function getAvatar(username: string, avatar?: string | null): string {
  if (avatar) return avatar;
  return generateAvatar(username);
}
