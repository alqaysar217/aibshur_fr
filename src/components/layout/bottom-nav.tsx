
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ClipboardList, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "الرئيسية", href: "/" },
  { icon: Search, label: "البحث", href: "/search" },
  { icon: ClipboardList, label: "طلباتي", href: "/orders" },
  { icon: Heart, label: "المفضلة", href: "/favorites" },
  { icon: User, label: "حسابي", href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around h-18 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[60] rounded-t-[1.5rem]" dir="rtl">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full py-3 transition-all duration-300 relative group",
              isActive ? "text-primary" : "text-[#6B7280] hover:text-primary/60"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-300",
              isActive ? "bg-primary/10" : "bg-transparent"
            )}>
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            </div>
            <span className={cn(
              "text-[10px] font-bold mt-1 transition-all duration-300",
              isActive ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
            )}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full animate-in fade-in zoom-in" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
