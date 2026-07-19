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

import { apiRequest } from '@/lib/api';
import {
  TOKEN_KEY,
  USER_KEY,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from '@/lib/session';

export { TOKEN_KEY, USER_KEY };

export interface UserInfo {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  email?: string;
}

/** SSR 安全：构建时（无 window）返回 null，不访问 localStorage */
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
  return getStoredToken();
}

export function getUser(): UserInfo | null {
  return getStoredUser<UserInfo>();
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}

function setSession(token: string, user: UserInfo) {
  setStoredSession(token, user);
  emit();
}

export function clearSession() {
  clearStoredSession();
  emit();
}

export async function login(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const data = await apiRequest<any>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data?.token) {
      setSession(data.token, {
        userId: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role,
      });
      return { ok: true };
    }
    return { ok: false, message: '登录失败' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '网络异常' };
  }
}

export async function register(
  username: string,
  password: string,
  nickname?: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const data = await apiRequest<any>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    });
    if (data?.token) {
      setSession(data.token, {
        userId: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role,
      });
      return { ok: true };
    }
    return { ok: false, message: '注册失败' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '网络异常' };
  }
}

export async function logout() {
  const token = getToken();
  if (token) {
    apiRequest('/user/logout', {
      method: 'POST',
    }).catch(() => undefined);
  }
  clearSession();
}

/**
 * 上传用户头像
 * POST /user/avatar  multipart/form-data
 */
export async function uploadAvatar(file: File): Promise<{ ok: boolean; avatarUrl?: string }> {
  const token = getToken();
  if (!token) return { ok: false };
  try {
    const fd = new FormData();
    fd.append('file', file);
    const data = await apiRequest<{ avatar?: string }>('/user/avatar', {
      method: 'POST',
      body: fd,
    });
    if (data?.avatar) {
      return { ok: true, avatarUrl: data.avatar };
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

/**
 * 校验 token 有效性 + 刷新 role（防止本地缓存的 role 过期）
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const data = await apiRequest<any>('/user/verify');
    if (data) {
      // 同步 role（后端 verify 返回的 role 为准）
      const user = getUser();
      if (user && data.role && user.role !== data.role) {
        user.role = data.role;
        setStoredSession(token, user);
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
