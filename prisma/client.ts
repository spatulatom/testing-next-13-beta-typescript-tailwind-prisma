// import { PrismaClient } from "@prisma/client"

// const client = globalThis.prisma || new PrismaClient()
// if (process.env.NODE_ENV !== "production") globalThis.prisma = client

// export default client
// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL
//     }
//   }
// })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// export default prisma
import { PrismaClient } from '@prisma/client'

// Declare prisma as a global variable to cache the PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, we want to recreate the Prisma Client for each request
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma