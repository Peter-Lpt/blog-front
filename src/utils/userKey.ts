const STORAGE_KEY = 'blog_user_key'

export function getUserKey(): string {
  let key = localStorage.getItem(STORAGE_KEY)
  if (!key) {
    key = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem(STORAGE_KEY, key)
  }
  return key
}
