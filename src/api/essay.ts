import service from './request'

export function getEssayPage(params: PageParams) {
  return service.get('/essay/findPage', { params })
}

export function getEssayDetail(essayId: string) {
  return service.get('/essay/detail', { params: { essayId } })
}

export function getEssayList(params: any) {
  return service.get('/essay/findList', { params })
}

export function addEssay(data: EssayForm) {
  return service.post('/essay/add', data)
}

export function editEssay(data: EssayForm) {
  return service.post('/essay/edit', data)
}

export function deleteEssay(essayId: string) {
  return service.post('/essay/delete', { essayId })
}
