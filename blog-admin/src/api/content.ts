/**
 * 内容管理 API（FS-005/006/007）
 *
 * 契约见 04/07 文档：/api/admin/content/*
 * 后端 BE-005/006/007 实现前，前端按此契约完成；接口未就绪时请求会失败，
 * UI 以友好提示兜底，不影响其它后台功能。
 *
 * 统一响应：{ success, data, message }
 */
import service from './request'

/** 内容树节点 */
export interface ContentNode {
  name: string
  path: string
  type: 'dir' | 'file'
  category?: string
  draft?: boolean
  slug?: string
  updatedAt?: string
  status?: ContentStatus
  children?: ContentNode[]
}

/** 发布状态（04 文档 9 节） */
export type ContentStatus = 'VALIDATING' | 'COMMITTED' | 'BUILDING' | 'PREVIEWABLE' | 'FAILED'

/** 文件详情 */
export interface ContentFile {
  path: string
  content: string
  status?: ContentStatus
  commitId?: string
  lastMessage?: string
}

/** 校验结果项 */
export interface ValidationIssue {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

/** 构建/发布状态 */
export interface BuildStatus {
  status: ContentStatus
  message?: string
  updatedAt?: string
}

export function getContentTree(): Promise<any> {
  return service.get('/admin/content/tree')
}

export function getContentFile(path: string): Promise<any> {
  return service.get('/admin/content/file', { params: { path } })
}

export function validateContent(payload: { path?: string; content?: string }): Promise<any> {
  return service.post('/admin/content/validate', payload)
}

export function createContentFile(payload: { path: string; content: string; message: string }): Promise<any> {
  return service.post('/admin/content/file', payload)
}

export function updateContentFile(payload: { path: string; content: string; message: string }): Promise<any> {
  return service.put('/admin/content/file', payload)
}

export function deleteContentFile(path: string): Promise<any> {
  return service.post('/admin/content/file/delete', { path })
}

export function triggerBuild(): Promise<any> {
  return service.post('/admin/content/build')
}

export function getBuildStatus(): Promise<any> {
  return service.get('/admin/content/status')
}
