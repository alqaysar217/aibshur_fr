
"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch current user data from Firestore
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  useEffect(() => {
    // Wait until Auth is determined
    if (isUserLoading) return;

    if (!user) {
      console.warn("Admin Layout: No session found, redirecting...");
      router.replace("/login")
      return
    }

    // Master List of Admin Phones
    const adminPhones = ['+967775258830', '+967770636008', '775258830', '770636008'];
    
    // Check points of truth
    const authPhone = user.phoneNumber || "";
    const firestorePhone = userData?.phone || "";
    const userType = userData?.type || "";
    
    // Session hint from local storage (helps with sync lag)
    const sessionHint = typeof window !== 'undefined' ? localStorage.getItem('absher_admin_session') : null;

    const isAuthorizedByPhone = adminPhones.some(p => 
      (authPhone && authPhone.includes(p)) || 
      (firestorePhone && firestorePhone.includes(p)) ||
      (sessionHint && sessionHint.includes(p))
    );

    const isAuthorizedByType = userType === "admin";

    if (isAuthorizedByPhone || isAuthorizedByType) {
      setIsAuthorized(true)
    } else {
      // If we are still loading or the document is missing (newly created), wait a bit
      if (isUserDataLoading || (!userData && retryCount < 10)) {
        const timer = setTimeout(() => setRetryCount(prev => prev + 1), 500);
        return () => clearTimeout(timer);
      }
      
      console.error("Admin Layout: Unauthorized access attempt. Context:", { authPhone, firestorePhone, userType, sessionHint });
      setIsAuthorized(false)
      // Small delay before redirect to show error state if any
      setTimeout(() => router.replace("/"), 2000);
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, retryCount])

  if (isUserLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold">{retryCount}</span>
          </div>
        </div>
        <p className="font-black text-primary animate-pulse">جاري التحقق من صلاحيات المسؤول...</p>
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white p-10 text-center gap-4" dir="rtl">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">وصول غير مصرح به</h1>
        <p className="text-gray-500 font-bold max-w-xs">عذراً، هذا الحساب لا يملك صلاحيات إدارية. سيتم توجيهك للرئيسية...</p>
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
