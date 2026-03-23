"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  const adminSettingsRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "admin_settings", "settings")
  }, [db])

  const { data: adminSettings, isLoading: isSettingsLoading } = useDoc(adminSettingsRef)

  useEffect(() => {
    if (!isUserLoading) {
      console.log("Current User Auth:", user);
      
      if (!user) {
        console.warn("Admin Layout: No user authenticated, redirecting to login...");
        router.replace("/login")
        return
      }

      // أرقام هواتف المسؤولين المعتمدة (Nuclear Fact)
      const allowedPhones = ['+967775258830', '+967770636008', '775258830', '770636008'];
      const userPhone = user.phoneNumber || "";
      
      const isAllowedByPhone = allowedPhones.some(phone => 
        userPhone.includes(phone) || (userPhone.startsWith('+967') && userPhone.replace('+967', '').includes(phone))
      );

      if (isAllowedByPhone) {
        console.log("Admin Layout: Authorization successful for phone:", userPhone);
        setIsAuthorized(true)
      } else {
        console.error("Admin Layout: Unauthorized access attempt by phone:", userPhone);
        router.replace("/")
      }
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-primary">جاري التحقق من الصلاحيات الإدارية...</p>
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