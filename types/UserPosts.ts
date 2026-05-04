type PostType = {
  id: string
  title: string
  createdAt: Date
  updatedAt?: Date
  published?: boolean
  userId: string
  comments: {
    createdAt?: Date | string
    id: string
    postId: string
    title: string
    userId: string
    user: {
      email: string | null
      id: string
      image: string | null
      name: string | null
    }
  }[]
}
  

export type UserPosts={
    id: string,
    name: string | null,
    email: string | null,
    emailVerified: Date | null,
    image: string | null,
    posts: PostType[]
}
