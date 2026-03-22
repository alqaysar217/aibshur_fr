
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ArrowRight, Clock, MapPin, CreditCard, ShoppingBag, Star, Phone, MessageCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

// بيانات تفصيلية للطلبات التجريبية لغرض المعاينة
const MOCK_ORDERS_DETAILS: Record<string, any> = {
  "mock-1": {
    id: "mock-1",
    storeName: "مطعم مذاقي",
    storeId: "mathaqi_rest",
    totalAmount: 4500,
    subtotal: 3500,
    deliveryFee: 1000,
    status: "delivered",
    createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) },
    deliveryAddress: "المكلا - حي الشرج - عمارة البركة",
    paymentMethod: "cash_on_delivery",
    orderItems: [
      { name: "مندي دجاج نصف حبة", quantity: 1, price: 2500 },
      { name: "سلطة حارة", quantity: 2, price: 500 }
    ]
  },
  "mock-2": {
    id: "mock-2",
    storeName: "سوبر ماركت الخليج",
    storeId: "al_khaleej_market",
    totalAmount: 1200,
    subtotal: 200,
    deliveryFee: 1000,
    status: "on_the_way",
    createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 30) },
    deliveryAddress: "المكلا - فوه - مساكن الإنشاءات",
    paymentMethod: "wallet",
    orderItems: [
      { name: "زبادي نادك كبير", quantity: 2, price: 100 }
    ]
  },
  "mock-3": {
    id: "mock-3",
    storeName: "كافيه بن علي",
    storeId: "cafe_ben_ali",
    totalAmount: 2800,
    subtotal: 1800,
    deliveryFee: 1000,
    status: "preparing",
    createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 45) },
    deliveryAddress: "المكلا - روكب - الشارع العام",
    paymentMethod: "cash_on_delivery",
    orderItems: [
      { name: "لاتيه مثلج", quantity: 1, price: 1200 },
      { name: "كيكة زعفران", quantity: 1, price: 600 }
    ]
  },
  "mock-4": {
    id: "mock-4",
    storeName: "صيدلية السلام",
    storeId: "salam_pharmacy",
    totalAmount: 3500,
    subtotal: 2500,
    deliveryFee: 1000,
    status: "accepted",
    createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 60) },
    deliveryAddress: "المكلا - الديس - بجانب المحضار",
    paymentMethod: "wallet",
    orderItems: [
      { name: "بندول اكسترا", quantity: 2, price: 800 },
      { name: "فيتامين سي فوار", quantity: 1, price: 900 }
    ]
  },
  "mock-5": {
    id: "mock-5",
    storeName: "عسل حضرمي",
    storeId: "sweet_home",
    totalAmount: 15000,
    subtotal: 14000,
    deliveryFee: 1000,
    status: "pending",
    createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 10) },
    deliveryAddress: "سيئون - السحيل - خلف المسجد",
    paymentMethod: "bank_transfer",
    orderItems: [
      { name: "عسل سدر ملكي 1كجم", quantity: 1, price: 14000 }
    ]
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false)

  // جلب البيانات من Firestore إذا كان الطلب حقيقياً
  const orderRef = useMemoFirebase(() => {
    if (!db || !user || !id || id.startsWith('mock-')) return null
    return doc(db, "users", user.uid, "orders", id as string)
  }, [db, user, id])

  const { data: realOrder, isLoading: isRealOrderLoading } = useDoc(orderRef)

  // دمج الطلب الحقيقي مع الطلبات التجريبية
  const order = useMemo(() => {
    if (id && id.startsWith('mock-')) {
      return MOCK_ORDERS_DETAILS[id]
    }
    return realOrder
  }, [id, realOrder])

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

  const handleRatingSubmit = async () => {
    if (!db || !user || !order || rating === 0) return
    
    // إذا كان الطلب تجريبياً، نظهر رسالة نجاح فقط
    if (id.startsWith('mock-')) {
      setIsRatingSubmitted(true)
      toast({ title: "شكراً لك!", description: "تم استلام تقييمك التجريبي بنجاح" })
      return
    }

    const ratingData = {
      userId: user.uid,
      orderId: id as string,
      storeId: order.storeId,
      ratingValue: rating,
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, "users", user.uid, "orders", id as string, "ratings"), ratingData)
      setIsRatingSubmitted(true)
      toast({ title: "شكراً لك!", description: "تم إرسال تقييمك بنجاح" })
    } catch (error) {
      console.error(error)
    }
  }

  if (isRealOrderLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-black text-primary">جاري تحميل تفاصيل الطلب...</p>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-6" dir="rtl">
      <div className="bg-secondary/20 p-8 rounded-full">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-primary">عذراً، الطلب غير موجود</h2>
        <p className="text-gray-400 text-sm font-bold">قد يكون الطلب قد تم حذفه أو أن الرابط غير صحيح</p>
      </div>
      <Button onClick={() => router.push('/orders')} className="rounded-xl h-12 px-8 font-black">
        العودة لطلباتي
      </Button>
    </div>
  )

  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date()

  return (
    <div className="pb-20 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-lg font-black text-primary">تفاصيل الطلب</h1>
        </div>
        <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 text-[10px]">
          #{order.id.substring(0, 8).toUpperCase()}
        </Badge>
      </header>

      <div className="p-5 space-y-6">
        {/* شريط حالة الطلب */}
        <Card className="border-none shadow-sm rounded-[25px] overflow-hidden bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">الحالة الحالية</p>
                  <h2 className="font-black text-sm text-gray-900">{getStatusLabel(order.status)}</h2>
                </div>
              </div>
              <Badge className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black border-none",
                order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-primary text-white'
              )}>
                {Math.floor(getStatusProgress(order.status))}%
              </Badge>
            </div>

            {order.status !== 'delivered' && (
              <div className="space-y-2">
                <Progress value={getStatusProgress(order.status)} className="h-2 rounded-full bg-secondary" />
                <p className="text-[9px] text-gray-400 font-bold text-center italic">يتم تحديث الحالة فور تغييرها من قبل المندوب أو المتجر</p>
              </div>
            )}

            <div className="pt-4 border-t border-secondary/30 flex items-center justify-center gap-2">
              <p className="text-[10px] text-muted-foreground font-bold">
                تم الطلب في {format(orderDate, "PPP p", { locale: ar })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* نظام التقييم - يظهر فقط عند اكتمال الطلب */}
        {order.status === 'delivered' && !isRatingSubmitted && (
          <Card className="border-none shadow-xl rounded-[25px] bg-gradient-to-br from-primary to-emerald-600 text-white overflow-hidden animate-in zoom-in duration-500">
            <CardContent className="p-6 text-center space-y-5">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg">كيف كانت تجربتك اليوم؟</h3>
                <p className="text-[11px] opacity-80 font-medium">تقييمك للمتجر والمندوب يساعدنا على تحسين خدمتنا</p>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-all active:scale-75 hover:scale-110">
                    <Star className={`h-9 w-9 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <Button onClick={handleRatingSubmit} className="bg-white text-primary hover:bg-white/95 w-full h-12 rounded-xl font-black text-sm shadow-lg">
                  إرسال التقييم
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* قائمة الوجبات */}
        <div className="space-y-3">
          <h3 className="font-black text-sm flex items-center gap-2 px-2 text-gray-900">
            <ShoppingBag className="h-4 w-4 text-primary" /> ملخص الوجبات
          </h3>
          <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
            <div className="p-4 bg-secondary/5 border-b border-secondary/30">
              <p className="font-black text-xs text-primary">{order.storeName}</p>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-secondary/30">
                {order.orderItems.map((item: any, i: number) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-primary border border-secondary">
                        {item.quantity}x
                      </div>
                      <span className="font-bold text-sm text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-gray-500 font-black text-xs">{item.price * item.quantity} <small className="text-[8px]">ر.س</small></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل التوصيل والدفع */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-none shadow-sm rounded-[25px] bg-white">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="bg-orange-50 p-3 rounded-xl shrink-0">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">عنوان التوصيل</p>
                <p className="text-sm font-bold text-gray-800 leading-relaxed">{order.deliveryAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[25px] bg-white">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl shrink-0">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">طريقة الدفع</p>
                <p className="text-sm font-bold text-gray-800">
                  {order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 
                   order.paymentMethod === 'wallet' ? 'المحفظة الإلكترونية' : 'تحويل بنكي'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ملخص الفاتورة */}
        <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>المجموع الفرعي</span>
              <span>{order.subtotal} ر.س</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>رسوم التوصيل</span>
              <span className="text-primary">+ {order.deliveryFee} ر.س</span>
            </div>
            <div className="border-t border-dashed border-secondary/50 pt-4 flex justify-between items-center">
              <span className="font-black text-sm text-gray-900">الإجمالي الكلي</span>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-2xl text-primary">{order.totalAmount}</span>
                <span className="text-[10px] font-black text-primary">ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار التواصل */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 bg-white text-primary font-black text-sm gap-2 shadow-sm active:scale-95 transition-all">
            <Phone className="h-4 w-4" /> اتصال
          </Button>
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-green-500/20 bg-white text-green-600 font-black text-sm gap-2 shadow-sm active:scale-95 transition-all">
            <MessageCircle className="h-4 w-4" /> واتساب
          </Button>
        </div>
      </div>
    </div>
  )
}
