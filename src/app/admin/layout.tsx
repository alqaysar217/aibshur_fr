"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Temporary Bypass for Development
  const [isAuthorized, setIsAuthorized] = useState(true); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthorized(true); // Always authorized in dev
  }, []);

  // حل مشكلة الـ Hydration: لا نعرض أي شيء حتى يكتمل تحميل الصفحة في المتصفح
  if (!mounted) return null;

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