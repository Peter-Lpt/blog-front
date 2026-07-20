import { defineMiddleware } from 'astro:middleware';

// SPA fallback：/admin/* 路由刷新时返回 /admin/index.html
export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = new URL(ctx.request.url);
  
  // 开发模式下，/admin/* 非文件请求回退到 index.html
  if (url.pathname.startsWith('/admin/') && !url.pathname.includes('.')) {
    url.pathname = '/admin/index.html';
    return fetch(url);
  }
  
  return next();
});
