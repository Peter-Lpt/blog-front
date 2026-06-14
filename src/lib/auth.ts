/**
 * 前台认证工具（Astro 岛组件用）
 *
 * 轻量实现：基于 localStorage + fetch，不依赖 Pinia（岛屿架构下 Pinia 状态隔离）
 * 岛组件通过事件总线协调登录态变化。
 *
 * 后端接口：
 * - POST /user/login      用户名密码登录
 * - POST /user/register   注册
 * - GET  /user/info       当前用户信息（需 token）
 * - GET  /user/verify     校验 token（需 token）
 * - POST /user/logout     退出
 */

import { SITE } from '@/lib/config';

export const TOKEN_KEY = 'blog_token';
export const USER_KEY = 'blog_user';

export interface UserInfo {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  email?: string;
}

/** SSR 安全：构建时（无 window）返回 null，不访问 localStorage */
const isBrowser = typeof window !== 'undefined';

/** 简单事件订阅（岛组件间同步登录态） */
type Listener = () => void;
const listeners = new Set<Listener>();
export function onAuthChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((fn) => fn());
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): UserInfo | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}

function setSession(token: string, user: UserInfo) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emit();
}

export function clearSession() {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emit();
}

export async function login(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${SITE.apiBaseUrl}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      setSession(data.data.token, {
        userId: data.data.userId,
        username: data.data.username,
        nickname: data.data.nickname,
        avatar: data.data.avatar,
        role: data.data.role,
      });
      return { ok: true };
    }
    return { ok: false, message: data.message || '登录失败' };
  } catch {
    return { ok: false, message: '网络异常' };
  }
}

export async function register(
  username: string,
  password: string,
  nickname?: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${SITE.apiBaseUrl}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname }),
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      setSession(data.data.token, {
        userId: data.data.userId,
        username: data.data.username,
        nickname: data.data.nickname,
        avatar: data.data.avatar,
        role: data.data.role,
      });
      return { ok: true };
    }
    return { ok: false, message: data.message || '注册失败' };
  } catch {
    return { ok: false, message: '网络异常' };
  }
}

export async function logout() {
  const token = getToken();
  if (token) {
    fetch(`${SITE.apiBaseUrl}/user/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearSession();
}

/**
 * 校验 token 有效性 + 刷新 role（防止本地缓存的 role 过期）
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${SITE.apiBaseUrl}/user/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const data = await res.json();
    if (data.success) {
      // 同步 role（后端 verify 返回的 role 为准）
      const user = getUser();
      if (user && data.data?.role && user.role !== data.data.role) {
        user.role = data.data.role;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        emit();
      }
      return true;
    }
    clearSession();
    return false;
  } catch {
    return false;
  }
}
