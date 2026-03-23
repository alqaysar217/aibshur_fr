"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Users, Truck, Store, MapPin, 
  Filter, ShoppingBag, Settings, ChevronLeft, ChevronRight,
  LogOut, PackageSearch
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (val: boolean) => void
}

const MENU_GROUPS = [
  { 
    label: "الرئيسية", 
    items: [
      { icon: LayoutDashboard, label: "لوحة القيادة", href: "/admin" },
    ]
  },
  { 
    label: "الإدارة التشغيلية", 
    items: [
      { icon: ShoppingBag, label: "الطلبات", href: "/admin/orders" },
      { icon: Users, label: "المستخدمين", href: "/admin/users" },
      { icon: Truck, label: "المندوبين", href: "/admin/drivers" },
      { icon: Store, label: "المتاجر والمنتجات", href: "/admin/stores" },
    ]
  },
  { 
    label: "إعدادات النظام", 
    items: [
      { icon: MapPin, label: "إدارة المحافظات", href: "/admin/cities" },
      { icon: Filter, label: "إدارة الفلاتر", href: "/admin/filters" },
      { icon: Settings, label: "الإعدادات العامة", href: "/admin/settings" },
    ]
  }
]

export function AdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  const sidebarClasses = cn(
    "fixed lg:relative inset-y-0 right-0 z-[110] bg-white border-l border-gray-100 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none",
    isCollapsed ? "lg:w-24" : "lg:w-72",
    isMobileOpen ? "translate-x-0 w-72" : "translate-x-full lg:translate-x-0"
  )

  return (
    <aside className={sidebarClasses}>
      {/* Header / Logo */}
      <div className={cn(
        "h-20 flex items-center border-b border-gray-50 px-6 shrink-0 transition-all",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="h-10 w-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
              <PackageSearch className="h-6 w-6 text-[#10B981]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-gray-900 leading-none">أبشر</span>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">المسؤول</span>
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20">
            <PackageSearch className="h-6 w-6 text-white" />
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex h-8 w-8 rounded-full bg-gray-50 text-gray-400 hover:text-[#10B981] hover:bg-[#10B981]/5 transition-colors border border-gray-100"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {MENU_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-3">
            {!isCollapsed && (
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 animate-in slide-in-from-right-2">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30 scale-[1.02] z-10" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-[#10B981]",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn(
                      "shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-[#10B981]",
                      "h-5 w-5"
                    )} />
                    
                    {!isCollapsed && (
                      <span className="font-bold text-sm truncate animate-in fade-in duration-300">
                        {item.label}
                      </span>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && !isCollapsed && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                    )}

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                      <div className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-red-500 hover:bg-red-50 group relative",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && (
            <span className="font-bold text-sm animate-in fade-in duration-300">تسجيل الخروج</span>
          )}
          {isCollapsed && (
            <div className="absolute right-full mr-4 bg-red-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              تسجيل الخروج
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
