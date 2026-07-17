"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === "/" || pathname === "/login") return null

  const paths = pathname.split("/").filter(Boolean)

  return (
    <nav
      className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 px-1"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-accent"
      >
        <Home className="h-3 w-3" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`
        const isLast = index === paths.length - 1
        const label = path
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            {isLast ? (
              <span
                className="font-semibold text-foreground rounded-md px-2 py-1 bg-accent text-accent-foreground select-none"
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="rounded-md px-2 py-1 hover:bg-accent hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
