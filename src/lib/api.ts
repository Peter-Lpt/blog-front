import { SITE } from '@/lib/config';
import {
  clearStoredSession,
  getStoredToken,
} from '@/lib/session';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function safeMessage(message: unknown, fallback: string): string {
  if (typeof message !== 'string' || !message.trim()) return fallback;
  if (/([A-Za-z]:\\|\\\\|\/Users\/|\/home\/|Exception| at )/i.test(message)) return fallback;
  return message.trim().slice(0, 240);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${SITE.apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('网络异常，请稍后重试', 0);
  }

  let payload: { success?: boolean; data?: T; message?: string } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    clearStoredSession();
    document.dispatchEvent(new CustomEvent('blog-auth-expired'));
    throw new ApiError('登录已过期，请重新登录', 401);
  }
  if (response.status === 403) {
    throw new ApiError('权限不足', 403);
  }
  if (!response.ok || !payload?.success) {
    throw new ApiError(safeMessage(payload?.message, '请求失败，请稍后重试'), response.status);
  }
  return payload.data as T;
}
