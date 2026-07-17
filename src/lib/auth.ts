import { cookies } from "next/headers"
import prisma from "./prisma"

// Hash password using native Web Crypto (compatible with both Node.js & Cloudflare Workers)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

// Get the authenticated user ID from cookies
export function getSessionUserId(): string | null {
  const cookieStore = cookies()
  const session = cookieStore.get("erp_session")
  return session?.value || null
}

// Get the current logged-in user details
export async function getCurrentUser() {
  const userId = getSessionUserId()
  if (!userId) return null
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })
    return user
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

// Set login session cookie
export function setSessionCookie(userId: string) {
  const cookieStore = cookies()
  cookieStore.set("erp_session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
}

// Clear login session cookie
export function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete("erp_session")
}
