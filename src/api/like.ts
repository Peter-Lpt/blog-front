import service from './request'

export function toggleLike(essaySlug: string, userKey: string) {
    return service.post('/like/toggle', {essaySlug, userKey})
}
