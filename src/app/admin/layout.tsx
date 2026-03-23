"use client"

import { ReactNode, useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopBar } from "@/components/admin/top-bar"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  useEffect(() => {
    if (!mounted || isUserLoading) return;

    if (!user) {
      router.replace("/login")
      return
    }

    // MASTER LOGGING FOR DEBUGGING
    console.log("Admin Check - Current Auth User:", {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      isAnonymous: user.isAnonymous
    });
    console.log("Admin Check - Firestore User Data:", userData);

    // Master List of Debug UIDs (Bypass for testing)
    const debugUIDs = ['mV7AQV2Mm6MDRpe5eSxskxNRVn73', 'Dn5QW71UUNVTo5XmOlfBrCfCmFO2'];
    
    if (debugUIDs.includes(user.uid)) {
      console.log("Admin Check - Access Granted via Debug UID Bypass");
      setIsAuthorized(true)
      return;
    }

    // Wait for Firestore data if not a debug UID
    if (isUserDataLoading) return;

    const hasAdminRole = userData?.role === "admin" || userData?.type === "admin";

    if (hasAdminRole) {
      console.log("Admin Check - Access Granted via Firestore Role/Type");
      setIsAuthorized(true)
    } else if (userData !== undefined) {
      console.error("Admin Check - Access Denied. Role/Type mismatch or missing.");
      setIsAuthorized(false)
      setTimeout(() => router.replace("/"), 3000)
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router, mounted])

  if (!mounted) return null;

  if (isUserLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-primary animate-pulse text-sm">جاري التحقق من صلاحيات المسؤول...</p>
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
        <p className="text-gray-500 font-bold max-w-xs">عذراً، هذا الحساب لا يمتلك صلاحيات الإدارة العليا.</p>
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