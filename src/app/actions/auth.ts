"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { hashPassword, setSessionCookie, clearSessionCookie, getCurrentUser as getCurrentUserLib } from "@/lib/auth"

export interface AuthResponse {
  success: boolean
  error?: string
}

// FETCH CURRENT USER DETAILS
export async function getCurrentUser() {
  try {
    return await getCurrentUserLib()
  } catch (error) {
    return null
  }
}

// REGISTER USER
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return { success: false, error: "Email address already registered" }
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    })

    setSessionCookie(user.id)
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: error.message || "Failed to register account" }
  }
}

// LOGIN USER
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const hashedPassword = await hashPassword(password)
    if (user.password !== hashedPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    setSessionCookie(user.id)
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message || "Failed to log in" }
  }
}

// LOGOUT USER
export async function logoutUserAction(): Promise<AuthResponse> {
  try {
    clearSessionCookie()
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to log out" }
  }
}
