"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Mail, Lock, User, CheckCircle, Ship, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginUser, registerUser } from "@/app/actions/auth"

export default function LoginView() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!form.email || !form.password || (isSignUp && !form.name)) {
      setErrorMsg("Please fill out all required fields.")
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const res = await registerUser(form.name, form.email, form.password)
        if (res.success) {
          setSuccessMsg("Registration successful! Redirecting...")
          setTimeout(() => {
            router.push("/")
            router.refresh()
          }, 1500)
        } else {
          setErrorMsg(res.error || "Failed to register account")
        }
      } else {
        const res = await loginUser(form.email, form.password)
        if (res.success) {
          setSuccessMsg("Logged in successfully! Redirecting...")
          setTimeout(() => {
            router.push("/")
            router.refresh()
          }, 1500)
        } else {
          setErrorMsg(res.error || "Invalid email or password")
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border bg-background">
        
        {/* Left Side Pane: Marketing/Identity */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
          {/* Decorative backdrop blobs */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-lg">Export Manager ERP</span>
          </div>

          <div className="space-y-4 my-auto">
            <h2 className="text-3xl font-extrabold leading-tight">
              Streamline Outbound Shipments & Ledgers
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Maintain dynamic agent statement registries, automate transport break-even price metrics, and track profits with instant reporting tools.
            </p>
          </div>

          <div className="text-xs text-blue-200/80 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Secure Session Authentication Enabled
          </div>
        </div>

        {/* Right Side Pane: Login/Signup Forms */}
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isSignUp ? "Create a Business Account" : "Sign In to ERP Portal"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              {isSignUp 
                ? "Register below to create a multi-tenant business space." 
                : "Enter your credentials to access your secure ledger dashboard."
              }
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Company / User Name</label>
                <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
                  <User className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Gavva Vamsi"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
              <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
                <Mail className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder="vamsi@domain.com"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Password</label>
              <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
                <Lock className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full shadow-md flex items-center justify-center gap-1">
              {loading ? (
                "Processing Request..."
              ) : (
                <>
                  {isSignUp ? "Register Account" : "Access ERP Dashboard"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className="text-primary hover:underline font-bold"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
