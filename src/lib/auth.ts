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
  type StoredUser,
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
  // 同步给非订阅者（如 Header 的指令式 DOM 更新）
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('blog-auth-change'));
  }
}

// 跨标签页同步：其他标签页登录/登出/换头像时，本页实时跟随
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) {
      emit();
    }
  });
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
 * 支持 File 或压缩后的 Blob（前端压缩后上传）
 */
export async function uploadAvatar(file: Blob | File): Promise<{ ok: boolean; avatarUrl?: string }> {
  const token = getToken();
  if (!token) return { ok: false };
  try {
    const fd = new FormData();
    // Blob 无 name，需手动给文件名，否则后端拿不到扩展名
    const isFile = file instanceof File;
    const name = isFile ? file.name : `avatar-${Date.now()}.jpg`;
    fd.append('file', file, name);
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
 * 校验 token 有效性 + 全量刷新用户信息（role/昵称/头像以数据库为准，防止本地缓存过期）
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const data = await apiRequest<Partial<UserInfo>>('/user/verify');
    if (data && data.username) {
      // 后端 verify 返回权威用户信息，全量同步回本地缓存
      const user = getUser();
      setStoredSession(token, {
        userId: data.userId ?? user?.userId ?? 0,
        username: data.username || user?.username || '',
        nickname: data.nickname ?? user?.nickname,
        avatar: data.avatar ?? user?.avatar,
        role: data.role ?? user?.role ?? 'user',
        email: data.email ?? user?.email,
      });
      emit();
      return true;
    }
    clearSession();
    return false;
  } catch {
    return false;
  }
}

/**
 * 处理 OAuth 回调：URL 带 oauth_token / oauth_error 时的收尾处理
 * 1) 先从地址栏剥离 token，避免泄露
 * 2) 写入会话并拉取权威用户信息
 * 3) 通知 UI 更新（返回 true 表示本页确实处理了回调）
 */
export async function applyOAuthResult(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('oauth_token');
  const error = params.get('oauth_error');

  // 无论成败，剥离回调参数（token 不能留在地址栏）
  window.history.replaceState({}, '', window.location.pathname + window.location.hash);

  if (error) return true;
  if (!token) return false;

  // 先存 token（/user/info 需要 token）再拉取权威用户信息
  setStoredSession(token, { userId: 0, username: '', nickname: '', avatar: '', role: 'guest' } as StoredUser);
  try {
    const user = await apiRequest<UserInfo>('/user/info');
    setStoredSession(token, {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      email: user.email,
    });
  } catch {
    clearStoredSession();
    return true;
  }
  emit();
  return true;
}
