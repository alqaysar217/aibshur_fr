"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/" },
  { icon: Search, label: "البحث", href: "/search" },
  { icon: ShoppingBag, label: "طلباتي", href: "/orders" },
  { icon: Heart, label: "المفضلة", href: "/favorites" },
  { icon: User, label: "حسابي", href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hydration fix: Simple shell during SSR, clean text
  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t flex items-center justify-around h-16 safe-area-bottom z-50">
        {navItems.map((item) => (
          <div key={item.href} className="flex flex-col items-center justify-center w-full h-full space-y-1 opacity-20">
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t flex items-center justify-around h-16 safe-area-bottom z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}