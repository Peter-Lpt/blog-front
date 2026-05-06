import service from './request'

export function toggleLike(essayId: string, userKey: string) {
    return service.post('/like/toggle', {essayId, userKey})
}
