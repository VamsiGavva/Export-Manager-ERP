import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const prismaClientSingleton = () => {
  // Check if running on Cloudflare with a D1 database binding
  if (process.env.DB) {
    const adapter = new PrismaD1(process.env.DB as any)
    return new PrismaClient({ adapter })
  }
  
  // Allow next build imports to compile without throwing
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV === 'production' ||
    process.argv.some(arg => arg.includes('next') && arg.includes('build'))
  ) {
    return new PrismaClient({
      datasources: {
        db: {
          url: 'file:./non-existent.db'
        }
      }
    })
  }

  throw new Error(
    "Cloudflare D1 Database binding 'DB' is missing. " +
    "Local fallback to SQLite files (dev.db) is disabled. " +
    "Please run your development server with Wrangler or make sure environment bindings are set."
  )
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
