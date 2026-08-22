/**
 * AI 记录板块共享工具（板块设计 v3）
 * category 是自由字符串：标签映射只做美化，未知分类原样显示。
 */
export const AI_CATEGORY_LABELS: Record<string, string> = {
  agent: 'Agent',
  cli: 'CLI',
  mcp: 'MCP',
  skill: 'Skill',
  'pi-plugin': 'PI 插件',
};

export function aiCategoryLabel(c: string): string {
  return AI_CATEGORY_LABELS[c] ?? c;
}

/** 常用分类排前面，其余按字母序 */
const PREFERRED_ORDER = ['agent', 'cli', 'mcp', 'skill', 'pi-plugin'];
export function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ia = PREFERRED_ORDER.indexOf(a);
    const ib = PREFERRED_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    }
    return a.localeCompare(b);
  });
}

/** 集合 id（如 "dsh.md"）→ 详情页 slug（"dsh"） */
export function slugOf(id: string): string {
  return id.replace(/\.(md|mdx)$/i, '');
}

/** 正文为空（只有 frontmatter）的条目不生成详情页、列表中不可点击 */
export function hasBody(doc: { body?: string }): boolean {
  return !!doc.body && doc.body.trim().length > 0;
}

/** official 字段归一化为数组（frontmatter 里可能是单字符串或数组） */
export function officialList(o: unknown): string[] {
  if (!o) return [];
  return Array.isArray(o) ? (o as string[]) : [String(o)];
}
