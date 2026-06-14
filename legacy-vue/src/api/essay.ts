import service from './request'

export function getEssayPage(params: PageParams) {
    return service.get('/essay/findPage', {params})
}

export function getEssayDetail(essayId: string) {
    return service.get('/essay/detail', {params: {essayId}})
}

export function getEssayEditInfo(essayId: string) {
    return service.get('/essay/editInfo', {params: {essayId}})
}

export function addEssay(data: EssayForm) {
    return service.post('/essay/add', data)
}

export function editEssay(data: EssayForm) {
    return service.post('/essay/edit', data)
}

export function deleteEssay(essayId: string) {
    return service.post('/essay/delete', {essayId})
}

export function importMarkdown(data: {
    content: string
    status?: number
    categoryId?: string
    tagId?: string
}) {
    return service.post('/essay/importMarkdown', data)
}

export function importMarkdownBatch(data: {
    files: { filename: string; content: string; status?: number; categoryId?: string; tagId?: string }[]
    defaultStatus?: number
    defaultCategoryId?: string
    defaultTagId?: string
}) {
    return service.post('/essay/importMarkdownBatch', data)
}

/**
 * 获取所有文章日期数据（按日期聚合）
 * 优先尝试后端 /essay/dates 接口；若不可用则从分页接口聚合
 */
export async function getEssayDates(): Promise<Record<string, number>> {
  try {
    // 尝试调用后端独立接口
    const res = await service.get('/essay/dates') as unknown as Record<string, number> | { data: Record<string, number> }
    // 兼容直接返回对象或 { data: ... } 包装
    return (res && typeof res === 'object' && 'data' in res)
      ? (res as { data: Record<string, number> }).data
      : res as Record<string, number>
  } catch {
    // 接口不存在时，通过大分页聚合
    return aggregateDatesFromPage()
  }
}

/**
 * 从分页接口聚合日期数据
 */
async function aggregateDatesFromPage(): Promise<Record<string, number>> {
  const dateMap: Record<string, number> = {}
  let pageNo = 1
  const pageSize = 100

  while (true) {
    const data = await getEssayPage({ pageNo, pageSize, status: 1 }) as unknown as PageResult<Essay>
    const records = data.records || []
    for (const essay of records) {
      if (essay.createTime) {
        // 提取 YYYY-MM-DD 部分
        const dateStr = essay.createTime.slice(0, 10)
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
      }
    }
    if (records.length < pageSize || pageNo >= (data.pageTotal || 1)) break
    pageNo++
  }

  return dateMap
}
