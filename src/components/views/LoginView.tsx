"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Mail, Lock, User, CheckCircle, ArrowRight, Package2, Zap, BarChart3, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loginUser, registerUser } from "@/app/actions/auth"

const features = [
  { icon: BarChart3, text: "Real-time profit & loss analytics" },
  { icon: BookOpen,  text: "Automated agent ledger statements" },
  { icon: Zap,       text: "Break-even price calculation" },
]

export default function LoginView() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErrorMsg(null); setSuccessMsg(null)

    if (!form.email || !form.password || (isSignUp && !form.name)) {
      setErrorMsg("Please fill out all required fields.")
      setLoading(false); return
    }

    try {
      if (isSignUp) {
        const res = await registerUser(form.name, form.email, form.password)
        if (res.success) {
          setSuccessMsg("Account created! Redirecting…")
          setTimeout(() => { router.push("/"); router.refresh() }, 1200)
        } else { setErrorMsg(res.error || "Failed to register account") }
      } else {
        const res = await loginUser(form.email, form.password)
        if (res.success) {
          setSuccessMsg("Welcome back! Redirecting…")
          setTimeout(() => { router.push("/"); router.refresh() }, 1200)
        } else { setErrorMsg(res.error || "Invalid email or password") }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 via-indigo-800 to-violet-900 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Package2 className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">Export Manager</p>
              <p className="text-white/50 text-[10px] mt-0.5">ERP Platform</p>
            </div>
          </div>

          <div className="relative space-y-6 my-auto py-8">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                Run your export<br />business smarter
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed mt-3 max-w-xs">
                Track shipments, calculate profits, manage agents and ledger statements — all in one place.
              </p>
            </div>

            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-blue-200" />
                  </div>
                  <span className="text-sm text-blue-100">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-1.5 text-xs text-blue-300/70">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure session authentication · Cloudflare D1 Database</span>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col justify-center p-8 md:p-10 bg-white dark:bg-zinc-900">
          <div className="mb-7">
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
                <Package2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm">Export Manager ERP</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp
                ? "Register to start managing your export business."
                : "Sign in to access your ERP dashboard."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
              <span className="mt-0.5">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Company / User Name
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
                  <User className="h-4 w-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. GMR Exports"
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-400"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="email"
                  placeholder="you@domain.com"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-400"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
                <Lock className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-400"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </span>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In to Dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null) }}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              {isSignUp ? "Sign In" : "Register"}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
