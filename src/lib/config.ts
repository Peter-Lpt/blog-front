/**
 * 站点配置常量
 */
export const SITE = {
  title: "PeterQs' Blog",
  description: '个人技术博客 · 前端 / 后端 / 工程实践',
  author: 'PeterQs',
  // 后端 API 地址（动态接口：评论/点赞/登录）
  // 默认同源 /api 前缀：dev 由 Vite 代理转发到后端并剥除前缀，生产由 nginx 反向代理 /api
  apiBaseUrl: import.meta.env.PUBLIC_API_BASE_URL || '/api',
  // 社交链接（按需填写）
  github: 'https://github.com/Peter-Lpt',
  email: '',
};

/**
 * 工具页主分类色板（无封面文章的渐变兜底，见 ADR-004 7.2）
 */
export const CATEGORY_COLORS: Record<string, [string, string]> = {
  前端: ['#667eea', '#764ba2'],
  后端: ['#11998e', '#38ef7d'],
  运维: ['#fc466b', '#3f5efb'],
  AI: ['#f093fb', '#f5576c'],
  工程实践: ['#fa709a', '#fee140'],
  随笔: ['#a8edea', '#fed6e3'],
};

export const DEFAULT_GRADIENT: [string, string] = ['#eee', '#ccc'];
