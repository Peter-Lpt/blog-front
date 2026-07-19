import service from './request'

export type ContentStatus = 'VALIDATING' | 'COMMITTED' | 'BUILDING' | 'PREVIEWABLE' | 'FAILED'

export interface ContentNode {
  name: string
  path: string
  directory: boolean
  size: number
  updatedAt?: string
  category?: string
  draft?: boolean
  slug?: string
  status?: ContentStatus
  children: ContentNode[]
}

export interface ContentFile {
  path: string
  content: string
}

export interface FrontMatter {
  title?: string
  description?: string
  pubDate?: string
  updatedDate?: string
  slug?: string
  category?: string
  tags?: string[]
  coverImage?: string
  draft?: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  frontMatter?: FrontMatter
  resolvedCategory?: string
}

export interface ContentFileResponse {
  path: string
  commitId: string
  status: 'COMMITTED'
}

export interface BuildStatus {
  status: ContentStatus
  message?: string
  updatedAt?: string
  output?: string
  lastCommitId?: string
  lastCommitMessage?: string
  dirty: boolean
  branch?: string
}

export function getContentTree(): Promise<ContentNode[]> {
  return service.get('/admin/content/tree')
}

export function getContentFile(path: string): Promise<ContentFile> {
  return service.get('/admin/content/file', { params: { path } })
}

export function validateContent(payload: { path?: string; content: string }): Promise<ValidationResult> {
  return service.post('/admin/content/validate', payload)
}

export function createContentFile(payload: { path: string; content: string; message: string }): Promise<ContentFileResponse> {
  return service.post('/admin/content/file', payload)
}

export function updateContentFile(payload: { path: string; content: string; message: string }): Promise<ContentFileResponse> {
  return service.put('/admin/content/file', payload)
}

export function deleteContentFile(path: string, message?: string): Promise<ContentFileResponse> {
  return service.delete('/admin/content/file', { params: { path, message } })
}

export function triggerBuild(): Promise<BuildStatus> {
  return service.post('/admin/content/build')
}

export function getBuildStatus(): Promise<BuildStatus> {
  return service.get('/admin/content/status')
}
