import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(process.cwd(), 'blog-admin', 'dist');
const destination = resolve(process.cwd(), 'public', 'admin');

if (!existsSync(source)) {
  console.error('[sync:admin] 未找到 blog-admin/dist，请先运行 npm run build:admin。');
  process.exit(1);
}

if (existsSync(destination)) {
  rmSync(destination, { recursive: true, force: true });
}
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });

console.log('[sync:admin] 管理后台已同步到 public/admin。');
