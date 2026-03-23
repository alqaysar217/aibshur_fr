"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Wait for hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch current user data from Firestore
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    if (!user) {
      console.warn("Admin Layout: No user found, redirecting...");
      router.replace("/login")
      return
    }

    // Detailed Report for Debugging
    console.log("--- Admin Auth Report ---");
    console.log("Current Auth User:", user);
    console.log("Firestore User Data:", userData);
    console.log("UID:", user.uid);
    console.log("-------------------------");

    // Master List of Debug UIDs (Bypass)
    const debugUIDs = ['mV7AQV2Mm6MDRpe5eSxskxNRVn73', 'Dn5QW71UUNVTo5XmOlfBrCfCmFO2'];
    
    if (debugUIDs.includes(user.uid)) {
      console.log("Admin Layout: Auth Bypass triggered for debug UID");
      setIsAuthorized(true)
      return;
    }

    const isAuthorizedByType = userData?.type === "admin" || userData?.role === "admin";
    const isAdminPhone = ['+967775258830', '+967770636008'].some(p => user.phoneNumber?.includes(p));

    if (isAuthorizedByType || isAdminPhone) {
      setIsAuthorized(true)
    } else {
      if (isUserDataLoading || (!userData && retryCount < 10)) {
        const timer = setTimeout(() => setRetryCount(prev => prev + 1), 800);
        return () => clearTimeout(timer);
      }
      
      console.error("Admin Layout: Unauthorized access attempt.");
      setIsAuthorized(false)
      setTimeout(() => router.replace("/"), 3000);
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, retryCount, mounted])

  if (!mounted) return null;

  if (isUserLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold">{retryCount}</span>
          </div>
        </div>
        <p className="font-black text-primary animate-pulse">التحقق من الصلاحيات (محاولة {retryCount}/10)...</p>
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white p-10 text-center gap-4" dir="rtl">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">دخول غير مصرح به</h1>
        <p className="text-gray-500 font-bold max-w-xs">عذراً، لم يتم العثور على صلاحيات مسؤول لهذا الحساب.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="rounded-xl">العودة للرئيسية</Button>
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