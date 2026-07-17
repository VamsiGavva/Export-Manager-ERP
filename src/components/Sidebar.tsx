"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  Users,
  Ship,
  TrendingUp,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
import { getCurrentUser, logoutUserAction } from "@/app/actions/auth"
import { LogOut } from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cities", href: "/cities", icon: MapPin },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Shipments", href: "/shipments", icon: Ship },
  { name: "Agent Sales", href: "/agent-sales", icon: TrendingUp },
  { name: "Statements", href: "/statements", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setUser(u)
    })
  }, [pathname])

  const handleLogout = async () => {
    const res = await logoutUserAction()
    if (res.success) {
      router.push("/login")
      router.refresh()
    }
  }

  // Don't show sidebar navigation on the login page
  if (pathname === "/login") return null

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden bg-background">
        <div className="flex items-center space-x-2">
          <Ship className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Export Manager</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 hover:bg-muted border"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed bottom-0 top-0 z-40 w-64 border-r bg-background transition-transform lg:sticky lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Logo Section */}
            <div className="hidden h-16 items-center border-b px-6 lg:flex">
              <Link href="/" className="flex items-center space-x-2">
                <Ship className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Export Manager
                </span>
              </Link>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1 px-4 py-6">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-blue-500/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer with User info & logout */}
          <div className="flex flex-col border-t bg-muted/20">
            {user && (
              <div className="px-4 pt-4 pb-2 border-b flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-muted/40">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-[10px] text-muted-foreground">Theme</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

