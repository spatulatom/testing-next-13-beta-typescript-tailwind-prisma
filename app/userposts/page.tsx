import { getServerSession } from "next-auth/next"
import { authOptions } from "../../pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"
import UserOwnPosts from "./UserOwnPosts"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mx-2">Check out your posts {session?.user?.name}!</h1>
      <UserOwnPosts />
    </main>
  )
}