
"use client"

import { Bell, LogOut, Search, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { query, collection, where } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function AdminTopBar() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()

  const pendingOrdersQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "orders"), where("status", "==", "pending"))
  }, [db])

  const { data: pendingOrders } = useCollection(pendingOrdersQuery)
  const hasPending = pendingOrders && pendingOrders.length > 0

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="rounded-xl bg-gray-50">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        <h1 className="font-black text-lg text-primary">أبشر</h1>
      </div>

      <div className="relative max-w-md w-full hidden md:block">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          placeholder="ابحث عن رقم طلب، عميل، أو متجر..." 
          className="w-full h-11 pr-12 pl-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border-l border-gray-100 pl-4">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/5 group">
            <Bell className={cn("h-5 w-5 text-gray-500 group-hover:text-primary transition-colors", hasPending && "animate-bounce text-primary")} />
            {hasPending && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none">الإدارة العليا</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1">{user?.phoneNumber}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <User className="h-5 w-5" />
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            size="icon" 
            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
