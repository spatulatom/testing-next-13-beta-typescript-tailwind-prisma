"use client"

import DeletePost from "./DeletePost"
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
  const { data, error, isLoading } = useQuery({
    queryKey: ["getAuthPosts"],
    queryFn: fetchAuthPosts}
  )
  if (isLoading) return <h1 className="m-4 text-center">Posts are loading...</h1>
  if (error) {console.log('Error', error)}
  if (error) throw new Error('Error while getting user posts. We are sorry!')
  const response: UserPosts = data; 
  return (
    <div>
      {response?.posts?.map((post) => (
        <>
        <DeletePost
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