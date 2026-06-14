import service from './request'

export function getCommentPage(params: any) {
  return service.get('/comment/findPageWithEssay', { params })
}

export function auditComment(data: { commentId: string; status: number }) {
  return service.post('/comment/audit', data)
}

export function deleteComment(commentId: string) {
  return service.post('/comment/delete', { commentId })
}
