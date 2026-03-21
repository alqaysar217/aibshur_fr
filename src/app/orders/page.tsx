"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronLeft, Utensils, ShoppingBag, ArrowRight } from "lucide-react"
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
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    const updateCart = () => {
      const savedCart = localStorage.getItem('absher_cart')
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0))
      } else {
        setCartCount(0)
      }
    }
    updateCart()
    window.addEventListener('cart-updated', updateCart)
    return () => window.removeEventListener('cart-updated', updateCart)
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

  if (!mounted) return null

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/5">
        <div className="animate-pulse font-black text-primary">جاري التحميل...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
        <h1 className="text-xl font-bold text-primary">يرجى تسجيل الدخول</h1>
        <Button onClick={() => router.push('/login')} className="w-full max-w-xs h-12 rounded-[10px]">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-bold text-primary">طلباتي</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-4">
        {isCollectionLoading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[10px] animate-pulse" />)
        ) : orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="border-none shadow-sm overflow-hidden rounded-[10px]">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between border-b border-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">طلب من المتجر</h3>
                      <p className="text-[10px] text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'delivered' ? 'outline' : 'default'}
                    className={order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-primary text-white border-none'}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="p-4 space-y-4">
                  {order.status !== 'delivered' && (
                    <div className="space-y-2">
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
                      <button className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-md">
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
            <p className="text-muted-foreground font-bold">لا توجد طلبات سابقة</p>
            <Button onClick={() => router.push('/')} variant="outline" className="rounded-[10px]">ابدأ التسوق الآن</Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
