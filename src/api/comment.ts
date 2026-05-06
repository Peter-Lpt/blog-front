import service from './request'

export function getCommentByEssayId(essayId: string) {
    return service.get('/comment/findByEssayId', {params: {essayId}})
}

export function getCommentPage(params: PageParams) {
    return service.get('/comment/findPage', {params})
}

export function getCommentPageWithEssay(params: PageParams) {
    return service.get('/comment/findPageWithEssay', {params})
}

export function addComment(data: CommentForm) {
    return service.post('/comment/add', data)
}

export function auditComment(data: { commentId: string; status: number }) {
    return service.post('/comment/audit', data)
}

export function deleteComment(commentId: string) {
    return service.post('/comment/delete', {commentId})
}
