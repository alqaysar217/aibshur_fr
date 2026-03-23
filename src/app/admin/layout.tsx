
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
    if (!isUserLoading && !isSettingsLoading) {
      if (!user) {
        router.replace("/login")
        return
      }

      if (adminSettings && adminSettings.allowedAdmins) {
        const phone = user.phoneNumber || ""
        const isAllowed = adminSettings.allowedAdmins.some((adminPhone: string) => 
          phone.includes(adminPhone) || phone.replace('+967', '').includes(adminPhone)
        )
        
        if (isAllowed) {
          setIsAuthorized(true)
        } else {
          router.replace("/")
        }
      } else {
        // Fallback for development if settings doc doesn't exist yet
        setIsAuthorized(true)
      }
    }
  }, [user, isUserLoading, adminSettings, isSettingsLoading, router])

  if (isUserLoading || isSettingsLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-primary">جاري التحقق من الصلاحيات...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFB] font-body" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
