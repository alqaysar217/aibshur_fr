
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
import { cn } from "@/lib/utils"

// بيانات تجريبية لتوضيح حالات الطلب المختلفة
const MOCK_ORDERS = [
  {
    id: "mock-1",
    storeName: "مطعم مذاقي",
    totalAmount: 4500,
    status: "delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // أمس
    itemsCount: 3
  },
  {
    id: "mock-2",
    storeName: "سوبر ماركت الخليج",
    totalAmount: 1200,
    status: "on_the_way",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // قبل 30 دقيقة
    itemsCount: 5
  },
  {
    id: "mock-3",
    storeName: "كافيه بن علي",
    totalAmount: 2800,
    status: "preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // قبل 45 دقيقة
    itemsCount: 2
  },
  {
    id: "mock-4",
    storeName: "صيدلية السلام",
    totalAmount: 3500,
    status: "accepted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // قبل ساعة
    itemsCount: 2
  },
  {
    id: "mock-5",
    storeName: "عسل حضرمي",
    totalAmount: 15000,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // قبل 10 دقائق
    itemsCount: 1
  }
]

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

  const { data: realOrders, isLoading: isCollectionLoading } = useCollection(ordersQuery)

  // دمج الطلبات الحقيقية مع الطلبات التجريبية للعرض فقط في مرحلة التطوير
  // سنعرض الطلبات التجريبية إذا لم يكن هناك طلبات حقيقية، حتى للزوار
  const displayOrders = (realOrders && realOrders.length > 0) ? realOrders : MOCK_ORDERS

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

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">طلباتي</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </header>

      <div className="p-5 space-y-5">
        {/* تنبيه في حال كان المستخدم يتصفح كزائر */}
        {!user && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-[15px] flex items-center justify-between mb-2">
            <div className="text-right">
              <p className="text-[11px] font-black text-blue-900 leading-none">أنت تظهر طلبات تجريبية</p>
              <p className="text-[9px] font-bold text-blue-700 mt-1">سجل دخولك لمتابعة طلباتك الحقيقية</p>
            </div>
            <Button onClick={() => router.push('/login')} size="sm" className="h-8 rounded-md bg-blue-600 text-[10px] font-black">دخول</Button>
          </div>
        )}

        {isCollectionLoading && !realOrders ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[20px] animate-pulse" />)
        ) : displayOrders.map((order: any) => (
          <Card key={order.id} className="border-none shadow-sm overflow-hidden rounded-[20px] bg-white transition-all active:scale-[0.98]">
            <CardContent className="p-0">
              {/* ترويسة الطلب */}
              <div className="p-4 flex items-center justify-between border-b border-secondary/30 bg-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-secondary">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900">{order.storeName || "طلب من أبشر"}</h3>
                    <p className="text-[10px] text-gray-400 font-bold">{formatOrderDate(order.createdAt)}</p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border-none",
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-primary text-white'
                  )}
                >
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              {/* حالة التقدم */}
              <div className="p-5 space-y-5">
                {order.status !== 'delivered' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Clock className="h-3.5 w-3.5 animate-pulse" /> حالة التجهيز
                      </span>
                      <span className="text-gray-400">{getStatusProgress(order.status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(order.status)} className="h-2 rounded-full bg-secondary" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <p className="text-[11px] font-black">وصل طلبك، بالهناء والشفاء!</p>
                  </div>
                )}

                {/* تفاصيل السعر والتحويل */}
                <div className="pt-4 flex justify-between items-center border-t border-secondary/30">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">إجمالي الحساب</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-primary text-xl">{order.totalAmount}</span>
                      <span className="text-[10px] font-bold text-gray-400">ر.س</span>
                    </div>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <button className="text-xs font-black text-primary flex items-center gap-1 bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
                      تفاصيل الطلب <ChevronLeft className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isCollectionLoading && displayOrders.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-30" />
            </div>
            <p className="text-muted-foreground font-black text-lg">لا توجد طلبات سابقة</p>
            <Button onClick={() => router.push('/')} variant="outline" className="rounded-[15px] h-12 px-8 border-primary text-primary font-black">ابدأ التسوق الآن</Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
