
"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowRight, Bell, ShoppingBag, Tag, Info, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

const FILTERS = [
  { id: "all", label: "الكل", icon: Bell },
  { id: "order_status", label: "الطلبات", icon: ShoppingBag },
  { id: "promotion", label: "العروض", icon: Tag },
  { id: "system", label: "النظام", icon: Info },
]

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    )
  }, [db, user])

  const { data: realNotifications, isLoading } = useCollection(notificationsQuery)

  const mockNotifications = [
    { id: "mock-1", title: "تم قبول طلبك", body: "مطعم مذاقي بدأ في تحضير طلبك الآن", type: "order_status", isRead: false, createdAt: { toDate: () => new Date() } },
    { id: "mock-2", title: "عرض خاص!", body: "خصم 20% على كافة الحلويات اليوم فقط", type: "promotion", isRead: true, createdAt: { toDate: () => new Date(Date.now() - 3600000) } },
    { id: "mock-3", title: "تحديث النظام", body: "تم تحسين واجهة التتبع لتجربة أفضل", type: "system", isRead: true, createdAt: { toDate: () => new Date(Date.now() - 86400000) } },
  ]

  const displayNotifications = useMemo(() => {
    const combined = [...(realNotifications || []), ...mockNotifications]
    if (activeFilter === "all") return combined
    return combined.filter(n => n.type === activeFilter)
  }, [realNotifications, activeFilter])

  const markAsRead = async (notificationId: string) => {
    if (!user || !db || notificationId.startsWith('mock-')) return
    const notifRef = doc(db, "users", user.uid, "notifications", notificationId)
    await updateDoc(notifRef, { isRead: true })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_status': return <ShoppingBag className="h-4 w-4" />
      case 'promotion': return <Tag className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-10 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 bg-white/95 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-lg font-black text-primary">الإشعارات</h1>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => {
            const Icon = f.icon
            const isActive = activeFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-[10px] font-black border",
                  isActive 
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                    : "bg-[#F9FAFB] text-gray-400 border-transparent"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "fill-current" : "")} />
                <span>{f.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)
        ) : displayNotifications.length > 0 ? (
          displayNotifications.map((notif: any) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-3 rounded-[15px] transition-all active:scale-[0.98] flex gap-3 items-start",
                notif.isRead ? "bg-white/50 border border-transparent" : "bg-white shadow-sm border border-primary/5 ring-1 ring-primary/5"
              )}
              onClick={() => markAsRead(notif.id)}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                notif.isRead ? "bg-secondary/50 text-gray-400" : "bg-primary/10 text-primary"
              )}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h3 className={cn("text-[13px] truncate", notif.isRead ? "font-bold text-gray-500" : "font-black text-gray-900")}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && <div className="h-2 w-2 bg-primary rounded-full shrink-0" />}
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed">
                  {notif.body}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-gray-300 font-bold pt-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>
                    {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true, locale: ar }) : 'الآن'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 space-y-4 opacity-30">
            <Bell className="h-16 w-16 mx-auto text-primary" />
            <p className="font-black text-primary">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
