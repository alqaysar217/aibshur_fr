"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronLeft, Utensils, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export default function OrdersPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "orders"),
      orderBy("createdAt", "desc")
    )
  }, [db, user])

  const { data: orders, isLoading: isCollectionLoading } = useCollection(ordersQuery)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار'
      case 'accepted': return 'تم القبول'
      case 'preparing': return 'جاري التحضير'
      case 'on_the_way': return 'في الطريق'
      case 'delivered': return 'تم التوصيل'
      default: return status
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 20
      case 'accepted': return 40
      case 'preparing': return 60
      case 'on_the_way': return 80
      case 'delivered': return 100
      default: return 0
    }
  }

  const formatOrderDate = (createdAt: any) => {
    if (!createdAt) return "الآن"
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
    return formatDistanceToNow(date, { addSuffix: true, locale: ar })
  }

  // Prevent Hydration error
  if (!mounted) return null

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/5">
        <div className="animate-pulse font-black text-primary">جاري التحميل</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
        <h1 className="text-xl font-bold">يرجى تسجيل الدخول</h1>
        <p className="text-muted-foreground text-center">يجب تسجيل الدخول لمشاهدة طلباتك</p>
        <Button onClick={() => router.push('/login')} className="w-full max-w-xs h-12 rounded-xl">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-40 flex items-center gap-4">
        <h1 className="text-xl font-bold">طلباتي</h1>
      </header>

      <div className="p-4 space-y-6">
        {isCollectionLoading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)
        ) : orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="border-none shadow-sm overflow-hidden rounded-[2rem]">
              <CardContent className="p-0">
                <div className="p-5 flex items-center justify-between border-b border-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">طلب من المتجر</h3>
                      <p className="text-[10px] text-muted-foreground">توقيت الطلب: {formatOrderDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'delivered' ? 'outline' : 'default'}
                    className={order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-accent text-accent-foreground border-none'}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="p-5 space-y-5">
                  {order.status !== 'delivered' && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="flex items-center gap-1 text-primary"><Clock className="h-3 w-3" /> حالة الطلب</span>
                        <span className="text-muted-foreground">{getStatusProgress(order.status)}%</span>
                      </div>
                      <Progress value={getStatusProgress(order.status)} className="h-2 rounded-full" />
                    </div>
                  )}

                  <div className="pt-3 flex justify-between items-center border-t border-secondary/30">
                    <div>
                      <p className="text-[10px] text-muted-foreground">الإجمالي</p>
                      <span className="font-black text-primary text-lg">{order.totalAmount} ر.س</span>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <button className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg">
                        التفاصيل <ChevronLeft className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="bg-secondary/20 p-8 rounded-full w-fit mx-auto">
              <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground font-bold">لا توجد طلبات سابقة</p>
            <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">ابدأ التسوق الآن</Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}