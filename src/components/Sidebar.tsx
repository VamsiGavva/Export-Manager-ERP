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
  X,
  LogOut,
  Package2,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
import { getCurrentUser, logoutUserAction } from "@/app/actions/auth"

const menuItems = [
  { name: "Dashboard",    href: "/",            icon: LayoutDashboard, section: "main" },
  { name: "Cities",       href: "/cities",       icon: MapPin,          section: "main" },
  { name: "Agents",       href: "/agents",       icon: Users,           section: "main" },
  { name: "Shipments",    href: "/shipments",    icon: Ship,            section: "operations" },
  { name: "Agent Sales",  href: "/agent-sales",  icon: TrendingUp,      section: "operations" },
  { name: "Statements",   href: "/statements",   icon: BookOpen,        section: "operations" },
  { name: "Reports",      href: "/reports",      icon: BarChart3,       section: "analytics" },
  { name: "Settings",     href: "/settings",     icon: Settings,        section: "analytics" },
]

const sections = [
  { key: "main",       label: "Overview" },
  { key: "operations", label: "Operations" },
  { key: "analytics",  label: "Analytics" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    getCurrentUser().then((u) => { if (u) setUser(u) })
  }, [pathname])

  const handleLogout = async () => {
    const res = await logoutUserAction()
    if (res.success) { router.push("/login"); router.refresh() }
  }

  if (pathname === "/login") return null

  const SidebarContent = () => (
    <div className="flex h-full flex-col sidebar-dark">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
          <Package2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight leading-none">Export Manager</p>
          <p className="text-[10px] text-white/35 mt-0.5">ERP Platform</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => {
          const items = menuItems.filter((m) => m.section === section.key)
          return (
            <div key={section.key}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                    >
                      <item.icon className="nav-icon" />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-white/6 px-3 py-3 space-y-2">
        {user && (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
            <Package2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Export Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 hover:bg-muted border"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed bottom-0 top-0 z-50 w-[260px] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
