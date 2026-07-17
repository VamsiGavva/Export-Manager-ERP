import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const prismaClientSingleton = () => {
  // Check if running on Cloudflare with a D1 database binding (configured in wrangler.toml/JSONC as DB)
  if (process.env.DB) {
    const adapter = new PrismaD1(process.env.DB as any)
    return new PrismaClient({ adapter })
  }
  
  // Local environment fallback to file-based SQLite (url = "file:./dev.db")
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
