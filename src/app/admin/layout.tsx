
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

  // Fetch current user data from Firestore as a fallback for anonymous sessions
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  useEffect(() => {
    // Only check authorization when BOTH Auth and Firestore user data are loaded
    if (!isUserLoading && !isUserDataLoading) {
      console.log("Admin Layout - Auth State:", user);
      console.log("Admin Layout - Firestore Data:", userData);
      
      if (!user) {
        console.warn("Admin Layout: No user authenticated, redirecting to login...");
        router.replace("/login")
        return
      }

      // Allowed Admin Phone Numbers (Master List)
      const allowedPhones = ['+967775258830', '+967770636008', '775258830', '770636008'];
      
      // Check phone from Auth object OR from Firestore document (fallback for anonymous login)
      const authPhone = user.phoneNumber || "";
      const firestorePhone = userData?.phone || "";
      
      const isAllowedByPhone = allowedPhones.some(phone => 
        (authPhone && authPhone.includes(phone)) || 
        (firestorePhone && firestorePhone.includes(phone))
      );

      // Also check explicitly by account type if phone matches
      const isAdminType = userData?.type === "admin";

      if (isAllowedByPhone || isAdminType) {
        console.log("Admin Layout: Authorization successful.");
        setIsAuthorized(true)
      } else {
        console.error("Admin Layout: Unauthorized access attempt. Phone:", authPhone || firestorePhone);
        router.replace("/")
      }
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router])

  if (isUserLoading || isUserDataLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
          </div>
        </div>
        <p className="font-black text-primary animate-pulse">جاري التحقق من الصلاحيات الإدارية...</p>
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
