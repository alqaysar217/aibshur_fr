"use client"

import { Bell, Search, User, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { query, collection, where } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface TopBarProps {
  toggleMobile: () => void
  toggleDesktop: () => void
}

export function AdminTopBar({ toggleMobile, toggleDesktop }: TopBarProps) {
  const { user } = useUser()
  const db = useFirestore()

  const pendingOrdersQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "orders"), where("status", "==", "pending"))
  }, [db])

  const { data: pendingOrders } = useCollection(pendingOrdersQuery)
  const hasPending = pendingOrders && pendingOrders.length > 0

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Toggle Button for Mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobile}
          className="lg:hidden rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Toggle Button for Desktop (Optional addition to existing sidebar button) */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDesktop}
          className="hidden lg:flex rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="font-black text-lg text-[#10B981] hidden sm:block">أبشر لوحة الإدارة</h1>
      </div>

      {/* Global Search */}
      <div className="relative max-w-md w-full hidden lg:block">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
        <input 
          placeholder="ابحث عن رقم طلب، عميل، أو متجر..." 
          className="w-full h-11 pr-12 pl-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 border-l border-gray-100 pl-2 md:pl-4">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[#10B981]/5 group h-10 w-10">
            <Bell className={cn("h-5 w-5 text-gray-400 group-hover:text-[#10B981] transition-colors", hasPending && "animate-bounce text-[#10B981]")} />
            {hasPending && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 pr-1 md:pr-2">
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none">الإدارة العليا</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{user?.phoneNumber?.replace('+967', '') || '000000000'}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shadow-inner shrink-0">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
