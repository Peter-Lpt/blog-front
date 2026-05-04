interface FriendLink {
  linkId: string
  name: string
  url: string
  logo: string
  description: string
  email: string
  status: number
  sort: number
  createTime: string
}

interface FriendLinkForm {
  linkId?: string
  name: string
  url: string
  logo?: string
  description?: string
  email?: string
  status?: number
  sort?: number
}
