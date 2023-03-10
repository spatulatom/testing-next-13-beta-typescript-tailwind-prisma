import prisma from "../../../prisma/client"

import { NextRequest } from "next/server";
// import { authOptions } from "pages/api/auth/[...nextauth]"
import { NextResponse } from 'next/server'


  export async function GET(request: NextRequest) {
    const data = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        hearts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
      
      return NextResponse.json({ data })
    
  }
