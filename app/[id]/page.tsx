

import Post from "../Post"
import AddComment from "./AddComment"
import Image from "next/image"

import { PostType } from '../../types/Post';



type URL = {
  params: {
    id: string
  }
  // searchParams: string
}
type Post = {data:PostType}

const fetchDetails = async (id: string) => {
  const data  = await fetch(`${process.env.URL}/${id}/api/${id}`, { cache: 'no-store' })
  const response = await data.json()
  return response.data
}

// url below equals to router().query.parans
export default async function PostDetail(url: URL) {
 
  const response: PostType  = await fetchDetails(url.params.id)
  return (
    <div>
      <Post
        id={response?.id}
        name={response?.user.name}
        avatar={response?.user.image}
        postTitle={response?.title}
        comments={response?.comments}
      />
      <AddComment id={response?.id} />
      {response?.comments?.map((comment) => (
        <div
        >
          <div className="flex items-center gap-2">
            <Image
              width={24}
              height={24}
              src={comment.user?.image}
              alt="avatar"
            />
            <h3 className="font-bold">{comment?.user?.name}</h3>
            <h2 className="text-sm">{comment.createdAt}</h2>
          </div>
          <div className="py-4">{comment.title}</div>
        </div>
      ))}
        
    </div>
  )
}