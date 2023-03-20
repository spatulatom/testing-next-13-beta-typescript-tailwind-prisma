"use client"

import EditPost from "./DeletePost"
import { useQuery } from "react-query"
import axios from "axios"
import { 
  UserPosts } from "../../types/UserPosts"
import Comments from "./Comments"
  

const fetchAuthPosts = async () => {
  const response = await axios.get("/api/userposts")
  return response.data
}

export default function UserOwnPosts(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ["getAuthPosts"],
    queryFn: fetchAuthPosts}
  )
  // if (isLoading) return <h1>Posts are loading...</h1>
  if (data) console.log(data)
  const response: UserPosts = data; 
  return (
    <div>
      {response?.posts?.map((post) => (
        <>
        <EditPost
          id={post.id}
          key={post.id}
          avatar={response.image}
          name={response.name}
          title={post.title}
          comments={post.comments}
        />
        <Comments comments={post.comments}/>
        </>
      ))}
     
    </div>
  )
}
