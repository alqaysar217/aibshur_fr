
"use client"

import { usePathname } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"
import { FloatingCart } from "@/components/layout/floating-cart"

export function LayoutSelector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  // إذا كان المستخدم في لوحة الإدارة، نعرض المحتوى بكامل الشاشة وبدون عناصر واجهة العميل
  if (isAdmin) {
    return (
      <div className="w-full h-screen bg-[#F8FAFB] overflow-hidden flex flex-col">
        {children}
      </div>
    )
  }

  // إذا كان في واجهة العميل، نلتزم بمقاسات الهاتف والحاوية المعتادة
  return (
    <div className="mobile-container h-screen relative flex flex-col overflow-hidden shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F5F7F6]">
        {children}
      </main>
      <FloatingCart />
      <BottomNav />
    </div>
  )
}
