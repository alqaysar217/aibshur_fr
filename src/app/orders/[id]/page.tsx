
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ArrowRight, Clock, MapPin, CreditCard, ShoppingBag, Star, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false)

  const orderRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null
    return doc(db, "users", user.uid, "orders", id as string)
  }, [db, user, id])

  const { data: order, isLoading } = useDoc(orderRef)

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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
  if (!order) return <div className="p-10 text-center">الطلب غير موجود</div>

  const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date()

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">تفاصيل الطلب</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* شريط حالة الطلب */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">رقم الطلب</p>
                <h2 className="font-black text-sm">#{order.id.substring(0, 8)}</h2>
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-bold px-3 py-1">
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-primary flex items-center gap-1"><Clock className="h-3 w-3" /> حالة التوصيل</span>
                <span>{getStatusProgress(order.status)}%</span>
              </div>
              <Progress value={getStatusProgress(order.status)} className="h-3 rounded-full" />
            </div>

            <p className="text-[10px] text-center text-muted-foreground italic">
              تم الطلب في {format(orderDate, "PPP p", { locale: ar })}
            </p>
          </CardContent>
        </Card>

        {/* نظام التقييم - يظهر فقط عند اكتمال الطلب */}
        {order.status === 'delivered' && !isRatingSubmitted && (
          <Card className="border-none shadow-lg rounded-3xl bg-primary text-white overflow-hidden">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="font-black">كيف كانت تجربتك اليوم؟</h3>
              <p className="text-xs opacity-80">تقييمك يساعدنا على تحسين خدمتنا</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                    <Star className={`h-8 w-8 ${rating >= star ? 'fill-accent text-accent' : 'text-white/30'}`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <Button onClick={handleRatingSubmit} className="bg-white text-primary hover:bg-white/90 w-full rounded-xl font-bold">
                  إرسال التقييم
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* قائمة الوجبات */}
        <div className="space-y-3">
          <h3 className="font-bold flex items-center gap-2 px-2">
            <ShoppingBag className="h-4 w-4 text-primary" /> ملخص الوجبات
          </h3>
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-4 space-y-4">
              {order.orderItems.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary px-2 py-1 rounded-lg text-[10px] font-bold">{item.quantity}x</span>
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground font-bold">{item.price * item.quantity} ر.س</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل التوصيل والدفع */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-orange-50 p-2 rounded-xl">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold">عنوان التوصيل</p>
                <p className="text-xs font-bold">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-2 rounded-xl">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold">طريقة الدفع</p>
                <p className="text-xs font-bold">
                  {order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 'المحفظة الإلكترونية'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ملخص الفاتورة */}
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{order.subtotal} ر.س</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>رسوم التوصيل</span>
              <span>{order.deliveryFee} ر.س</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-black text-lg">الإجمالي الكلي</span>
              <span className="font-black text-xl text-primary">{order.totalAmount} ر.س</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary text-primary font-bold gap-2">
            <Phone className="h-4 w-4" /> اتصل بنا
          </Button>
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-green-500 text-green-600 font-bold gap-2">
            <MessageCircle className="h-4 w-4" /> واتساب
          </Button>
        </div>
      </div>
    </div>
  )
}
