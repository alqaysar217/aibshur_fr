
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Users, Truck, Store, MapPin, 
  Filter, ShoppingBag, Wallet, Settings, ChevronLeft,
  PackageSearch
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const MENU_ITEMS = [
  { group: "الرئيسية", items: [
    { icon: LayoutDashboard, label: "لوحة القيادة", href: "/admin" },
  ]},
  { group: "الإدارة التشغيلية", items: [
    { icon: ShoppingBag, label: "الطلبات", href: "/admin/orders" },
    { icon: Store, label: "المتاجر والمنتجات", href: "/admin/stores" },
    { icon: Truck, label: "المندوبين", href: "/admin/drivers" },
    { icon: Users, label: "المستخدمين", href: "/admin/users" },
  ]},
  { group: "الإعدادات والنظام", items: [
    { icon: MapPin, label: "إدارة المحافظات", href: "/admin/cities" },
    { icon: Filter, label: "إدارة الفلاتر", href: "/admin/filters" },
    { icon: Wallet, label: "المالية والـ VIP", href: "/admin/finance" },
    { icon: Settings, label: "الإعدادات", href: "/admin/settings" },
  ]}
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 bg-white border-l border-gray-100 flex flex-col shrink-0 hidden lg:flex">
      <div className="p-8 border-b border-gray-50 flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <PackageSearch className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-black text-xl text-gray-900 leading-none">أبشر</h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">لوحة التحكم</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-8">
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">{group.group}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-[15px] transition-all group",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", isActive ? "" : "opacity-70 group-hover:opacity-100")} />
                      <span className="font-black text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronLeft className="h-4 w-4" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <div className="bg-gray-50 p-4 rounded-[20px] flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase">النظام</p>
            <p className="text-xs font-bold text-gray-700 truncate">متصل ومستقر</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
