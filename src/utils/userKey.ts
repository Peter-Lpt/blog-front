/** 用户标识（点赞防刷，IP/Cookie 组合，纯客户端生成） */
export function getUserKey(): string {
  const KEY = 'blog_user_key';
  let key = localStorage.getItem(KEY);
  if (!key) {
    key = `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, key);
  }
  return key;
}
