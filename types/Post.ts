export type PostType = {
  id: string
  title: string
  createdAt: string
  updatedAt?: string
  published: Boolean
  userId: string
  user: {
    email: string
    id: string
    image: string
    name: string
  }
  comments: {
    createdAt?: string
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
