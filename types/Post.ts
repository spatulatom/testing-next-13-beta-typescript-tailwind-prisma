export type PostType = {
  id: string
  title: string
  createdAt: Date
  updatedAt?: string
  published: boolean
  userId: string
  user: {
    email: string
    id: string
    image: string
    name: string
  }
  comments: {
    createdAt?: Date
    id: string
    postId: string
    title: string
    userId: string
    user: {
      email: string
      id: string
      image: string
      name: string
    }
  }[]
}
