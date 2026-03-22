"use client"

import { useState, useEffect, useMemo } from "react"
import { Clock, ChevronLeft, Utensils, ShoppingBag, ArrowRight, Package, CheckCircle2, Truck, XCircle, Search, Activity, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow, isToday, format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

const MOCK_ORDERS = [
  { id: "mock-1", storeName: "مطعم مذاقي", storeImage: "https://picsum.photos/seed/m1/100", totalAmount: 4500, status: "delivered", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), itemsCount: 3 },
  { id: "mock-2", storeName: "سوبر ماركت الخليج", storeImage: "https://picsum.photos/seed/m2/100", totalAmount: 1200, status: "on_the_way", createdAt: new Date(Date.now() - 1000 * 60 * 30), itemsCount: 5 },
  { id: "mock-3", storeName: "كافيه بن علي", storeImage: "https://picsum.photos/seed/m3/100", totalAmount: 2800, status: "preparing", createdAt: new Date(Date.now() - 1000 * 60 * 45), itemsCount: 2 },
  { id: "mock-4", storeName: "صيدلية السلام", storeImage: "https://picsum.photos/seed/m4/100", totalAmount: 3500, status: "cancelled", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), itemsCount: 2 },
  { id: "mock-5", storeName: "عسل حضرمي", storeImage: "https://picsum.photos/seed/m5/100", totalAmount: 15000, status: "pending", createdAt: new Date(Date.now() - 1000 * 60 * 10), itemsCount: 1 }
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
      }
    }
    updateCart()
    window.addEventListener('cart-updated', updateCart)
    return () => window.removeEventListener('cart-updated', updateCart)
  }, [])

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "orders"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: realOrders, isLoading: isCollectionLoading } = useCollection(ordersQuery)
  
  // دمج الطلبات الحقيقية مع الوهمية لضمان ظهور النماذج دائماً أثناء التطوير
  const displayOrders = useMemo(() => {
    const real = realOrders || []
    return [...real, ...MOCK_ORDERS].sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }, [realOrders])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> }
      case 'accepted': return { label: 'تم القبول', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="h-3 w-3" /> }
      case 'preparing': return { label: 'جاري التحضير', color: 'bg-orange-100 text-orange-700', icon: <Utensils className="h-3 w-3" /> }
      case 'on_the_way': return { label: 'في الطريق', color: 'bg-primary/10 text-primary', icon: <Truck className="h-3 w-3" /> }
      case 'delivered': return { label: 'تم التسليم', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> }
      case 'cancelled': return { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> }
      default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: <Package className="h-3 w-3" /> }
    }
  }

  const formatOrderDate = (dateInput: any) => {
    if (!dateInput) return "الآن"
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput)
    return isToday(date) ? formatDistanceToNow(date, { addSuffix: true, locale: ar }) : format(date, "yyyy/MM/dd", { locale: ar })
  }

  const filterOrders = (type: 'active' | 'completed' | 'cancelled') => {
    return displayOrders.filter((o: any) => {
      if (type === 'active') return ['pending', 'accepted', 'preparing', 'on_the_way'].includes(o.status)
      if (type === 'completed') return o.status === 'delivered'
      if (type === 'cancelled') return o.status === 'cancelled'
      return false
    })
  }

  if (!mounted) return null

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">طلباتي</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
          </Button>
        </Link>
      </header>

      <div className="p-5">
        <Tabs defaultValue="active" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white rounded-[15px] p-1.5 mb-6 shadow-sm">
            <TabsTrigger value="active" className="rounded-[10px] font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Clock className="h-3.5 w-3.5" /> الحالية
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-[10px] font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Check className="h-3.5 w-3.5" /> السابقة
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-[10px] font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <XCircle className="h-3.5 w-3.5" /> الملغية
            </TabsTrigger>
          </TabsList>

          {['active', 'completed', 'cancelled'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {filterOrders(tab as any).length > 0 ? filterOrders(tab as any).map((order: any) => {
                const config = getStatusConfig(order.status)
                return (
                  <Card key={order.id} className="border-none shadow-sm rounded-[20px] overflow-hidden bg-white hover:shadow-md transition-all active:scale-[0.98]">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-secondary bg-gray-50 shrink-0">
                            <img src={order.storeImage || `https://picsum.photos/seed/${order.id}/100`} alt={order.storeName} className="object-cover w-full h-full" />
                          </div>
                          <div className="text-right">
                            <h3 className="font-black text-sm text-gray-900 truncate max-w-[150px]">{order.storeName}</h3>
                            <p className="text-[10px] font-bold text-gray-400">#{order.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                        <Badge className={cn("px-2.5 py-1 rounded-full text-[9px] font-black border-none gap-1.5", config.color)}>
                          {config.icon} {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-secondary/30">
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase">وقت الطلب</p>
                          <p className="text-[11px] font-bold text-gray-600">{formatOrderDate(order.createdAt)}</p>
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase">إجمالي الحساب</p>
                          <p className="text-sm font-black text-primary">{order.totalAmount} <small className="text-[9px]">ريال</small></p>
                        </div>
                      </div>

                      <Button asChild className="w-full h-11 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-primary font-black text-xs shadow-none">
                        <Link href={`/orders/${order.id}`}>عرض التفاصيل <ChevronLeft className="mr-1 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              }) : (
                <div className="text-center py-20 opacity-30">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="font-black text-primary">لا توجد طلبات في هذا القسم</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}
