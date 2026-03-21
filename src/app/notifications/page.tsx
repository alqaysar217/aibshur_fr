"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Bell, BellOff, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

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

  const { data: notifications, isLoading } = useCollection(notificationsQuery)

  const markAsRead = async (notificationId: string) => {
    if (!user || !db) return
    const notifRef = doc(db, "users", user.uid, "notifications", notificationId)
    await updateDoc(notifRef, { isRead: true })
  }

  if (!mounted) return null

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">التنبيهات</h1>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <Card 
              key={notif.id} 
              className={`border-none shadow-sm rounded-2xl overflow-hidden transition-all ${notif.isRead ? 'opacity-70' : 'ring-1 ring-primary/20 bg-primary/5'}`}
              onClick={() => markAsRead(notif.id)}
            >
              <CardContent className="p-4 flex gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-secondary' : 'bg-primary/20'}`}>
                  {notif.type === 'order_status_update' ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Info className="h-6 w-6 text-primary" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm">{notif.title}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true, locale: ar }) : 'الآن'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.body}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 space-y-4 opacity-30">
            <BellOff className="h-16 w-16 mx-auto" />
            <p className="font-bold">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
