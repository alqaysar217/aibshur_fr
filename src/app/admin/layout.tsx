"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    // التحقق البسيط من وجود مستخدم مسجل
    if (!user) {
      router.replace("/login")
      return
    }
  }, [user, isUserLoading, router, mounted])

  // حل مشكلة الـ Hydration: لا نعرض أي شيء حتى يكتمل تحميل الصفحة في المتصفح
  if (!mounted) return null;

  if (isUserLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-primary animate-pulse text-sm">جاري جلب البيانات...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFB] font-body" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}