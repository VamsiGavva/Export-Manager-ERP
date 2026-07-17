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
import { useState } from "react"
import ThemeToggle from "./ThemeToggle"

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
  const [isOpen, setIsOpen] = useState(false)

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

          {/* Footer Theme Toggle */}
          <div className="hidden items-center justify-between border-t p-4 lg:flex bg-muted/40">
            <span className="text-xs text-muted-foreground">© 2026 ERP Inc.</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
