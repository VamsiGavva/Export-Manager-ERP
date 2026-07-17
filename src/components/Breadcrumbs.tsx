"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  if (pathname === "/") return null

  const paths = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex items-center space-x-1.5 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center space-x-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`
        const isLast = index === paths.length - 1
        const label = path
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())

        return (
          <div key={href} className="flex items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground select-none" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
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
