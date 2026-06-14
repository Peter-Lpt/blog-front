/**
 * Admin API 模块（复用 auth.ts 的 getToken 做认证）
 */
import { SITE } from '@/lib/config';
import { getToken } from '@/lib/auth';

const BASE = SITE.apiBaseUrl;

async function request<T = any>(
  method: 'GET' | 'POST',
  path: string,
  body?: any,
  params?: Record<string, any>,
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('未登录');

  let url = BASE + path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const qsStr = qs.toString();
    if (qsStr) url += '?' + qsStr;
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // token 过期，清除登录态并跳转
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
    window.location.href = '/admin/login';
    throw new Error('登录已过期');
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.message || '请求失败');
  return data.data;
}

// ── 评论 ──
export const getCommentPage = (params: any) =>
  request('GET', '/comment/findPageWithEssay', null, params);

export const auditComment = (body: { commentId: string; status: number }) =>
  request('POST', '/comment/audit', body);

export const deleteComment = (commentId: string) =>
  request('POST', '/comment/delete', { commentId });

// ── 友链 ──
export const getFriendLinkPage = (params: any) =>
  request('GET', '/friendlink/findPage', null, params);

export const addFriendLink = (body: any) =>
  request('POST', '/friendLink/add', body);

export const editFriendLink = (body: any) =>
  request('POST', '/friendLink/edit', body);

export const deleteFriendLink = (linkId: string) =>
  request('POST', '/friendLink/delete', { linkId });
