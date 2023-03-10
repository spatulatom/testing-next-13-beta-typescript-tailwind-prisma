import React from 'react'

const fetchAuthPosts = async () => {
    const response = await fetch(process.env.URL +"/userposts/api")
    const data = await response.json()
    return data
  }
export default async function UserPosts() {

    const posts = await fetchAuthPosts()
    console.log('POSTS', posts)
  return (
    <div>UserPosts</div>
  )
}
