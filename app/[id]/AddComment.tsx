'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { PostType } from '../../types/Post';
import { useRouter } from 'next/navigation';

type Comment = {
  postId?: string;
  title: string;
};
type PostProps = {
  id: string;
};
export default function AddComment({ id }: PostProps) {
  const router = useRouter();
  let commentToastId: string;
  console.log(id);
  const [title, setTitle] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const addComment = async(arg1:string, arg2:string)=>{
    const param = {
      title: arg1,
      id: arg2
    }
    try{
      const response = await fetch("/api/addcomment",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
      })
      const data = await response.json()
      if(response){
        router.refresh()
        setTitle('')
        setIsDisabled(false)
        toast.success('Added your comment', { id: commentToastId });
      }
      console.log('DATA', data)}catch(err){
        console.log(err)
      }
  }



  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisabled(true);
    commentToastId = toast.loading('Adding your comment', {
      id: commentToastId,
    });
    addComment( title, id);
    
  };
  return (
    <form onSubmit={submitPost} className="my-8">
      <h3 className="text-xl">Add a comment</h3>

      <div className="flex flex-col my-2">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          type="text"
          name="title"
          className="p-4 text-lg rounded-md my-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={isDisabled}
          className=" text-sm bg-teal-600 text-white py-2 px-6 rounded-xl disabled:opacity-25"
          type="submit"
        >
          Add Comment 🚀
        </button>
        <p
          className={`font-bold  ${
            title.length > 300 ? 'text-red-700' : 'text-gray-700'
          } `}
        >{`${title.length}/300`}</p>
      </div>
    </form>
  );
}
