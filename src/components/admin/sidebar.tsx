"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, Users, Truck, Store, MapPin, 
  Filter, ShoppingBag, Settings, LogOut, PackageSearch
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (val: boolean) => void
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة القيادة", href: "/admin" },
  { icon: Users, label: "المستخدمين", href: "/admin/users" },
  { icon: Truck, label: "المندوبين", href: "/admin/drivers" },
  { icon: Store, label: "المتاجر والمنتجات", href: "/admin/stores" },
  { icon: Filter, label: "إدارة الفلاتر", href: "/admin/filters" },
  { icon: MapPin, label: "إدارة المحافظات", href: "/admin/cities" },
  { icon: ShoppingBag, label: "الطلبات", href: "/admin/orders" },
  { icon: Settings, label: "الإعدادات", href: "/admin/settings" },
]

export function AdminSidebar({ isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const auth = useAuth()
  const router = useRouter()
  const [imgError, setImgError] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  const sidebarClasses = cn(
    "fixed lg:relative inset-y-0 right-0 z-[110] bg-white border-l border-gray-100 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none",
    isCollapsed ? "lg:w-[80px]" : "lg:w-[260px]",
    isMobileOpen ? "translate-x-0 w-[260px]" : "translate-x-full lg:translate-x-0"
  )

  return (
    <aside className={sidebarClasses}>
      {/* Premium Brand Section */}
      <div className={cn(
        "h-24 flex items-center border-b border-gray-50 shrink-0 transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "px-6 justify-start"
      )}>
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed ? "w-full justify-center" : "w-auto"
        )}>
          {/* Logo Image */}
          <div className={cn(
            "relative shrink-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300",
            isCollapsed ? "w-14 h-14" : "w-12 h-12"
          )}>
            <Image 
              src="/logo.png" 
              alt="Abshar Admin" 
              fill 
              className="object-cover"
              priority
              onError={() => setImgError(true)}
            />
          </div>

          {/* Brand Text - Only in Expanded Mode */}
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <span className="font-black text-xl text-[#10B981] whitespace-nowrap leading-none mb-1">
                أبشر للإدارة
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-lg shadow-[#10B981]/30 scale-[1.02]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#10B981]",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "shrink-0 transition-all duration-300 group-hover:scale-110",
                isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-gray-400 group-hover:text-[#10B981]",
                "h-5 w-5" // Approx 20px
              )} />
              
              {!isCollapsed && (
                <span className="font-bold text-sm truncate">
                  {item.label}
                </span>
              )}

              {/* Hover Indicator Border */}
              {!isActive && !isCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#10B981] rounded-l-full group-hover:h-6 transition-all duration-200" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 group relative",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && (
            <span className="font-bold text-sm">تسجيل الخروج</span>
          )}
        </button>
      </div>
    </aside>
  )
}
