
"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, Tag, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [coupon, setCoupon] = useState("")
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
  }

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta)
        return newQty === 0 ? null : { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean)
    saveCart(newCart)
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 10
  const discount = isCouponApplied ? 15 : 0
  const total = cartTotal + deliveryFee - discount

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const orderData = {
      userId: user.uid,
      storeId: cart[0].storeId,
      orderItems: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: cartTotal,
      deliveryFee: deliveryFee,
      discountAmount: discount,
      totalAmount: total,
      status: "pending",
      createdAt: serverTimestamp(),
      deliveryAddress: "حضرموت - المكلا (افتراضي)",
      deliveryLatitude: 14.54,
      deliveryLongitude: 49.13,
      paymentMethod: "cash_on_delivery"
    }

    const ordersRef = collection(db, "users", user.uid, "orders")
    const notificationsRef = collection(db, "users", user.uid, "notifications")
    
    addDoc(ordersRef, orderData)
      .then((docRef) => {
        // إنشاء تنبيه حقيقي للمستخدم عند نجاح الطلب
        addDoc(notificationsRef, {
          title: "تم استلام طلبك!",
          body: `طلبك رقم #${docRef.id.substring(0, 6)} قيد المراجعة الآن. سنوافيك بالتحديثات قريباً.`,
          type: "order_status_update",
          isRead: false,
          createdAt: serverTimestamp()
        })

        localStorage.removeItem('absher_cart')
        setCart([])
        toast({ title: "تم إرسال الطلب بنجاح", description: "شكراً لك! سيتم التواصل معك قريباً" })
        router.push('/orders')
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: ordersRef.path,
          operation: 'create',
          requestResourceData: orderData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  const applyCoupon = () => {
    if (coupon.toLowerCase() === 'absher24') {
      setIsCouponApplied(true)
      toast({ title: "تم تفعيل الكوبون", description: "حصلت على خصم 15 ريال" })
    } else {
      toast({ title: "كوبون غير صحيح", description: "تأكد من رمز الكوبون وحاول مجدداً", variant: "destructive" })
    }
  }

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="bg-secondary/20 p-8 rounded-full">
          <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">سلة التسوق فارغة</h1>
        <Button onClick={() => router.push('/')} className="w-full h-14 rounded-2xl">تصفح المتاجر</Button>
      </div>
    )
  }

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">سلة التسوق</h1>
      </header>

      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-4 flex gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-primary font-black text-sm">{item.price} ر.س</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => updateQuantity(item.id, -1)} variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.id, 1)} variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive p-0 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* الكوبون */}
        <div className="pt-4">
          <div className="relative">
            <Tag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="هل لديك كوبون خصم؟" 
              className="h-14 pr-12 pl-24 rounded-2xl border-none shadow-sm bg-white font-bold"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              disabled={isCouponApplied}
            />
            <Button 
              onClick={applyCoupon}
              disabled={!coupon || isCouponApplied}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 rounded-xl"
            >
              {isCouponApplied ? 'مطبق' : 'تطبيق'}
            </Button>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <h2 className="font-bold">تفاصيل الدفع</h2>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-bold">{cartTotal} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رسوم التوصيل</span>
                <span className="font-bold">{deliveryFee} ر.س</span>
              </div>
              {isCouponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>خصم الكوبون</span>
                  <span className="font-bold">- {discount} ر.س</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-black">الإجمالي</span>
                <span className="font-black text-primary text-lg">{total} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold">طريقة الدفع</h2>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">الدفع عند الاستلام</p>
              <p className="text-[10px] text-muted-foreground">ادفع نقداً للمندوب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button onClick={handleCheckout} className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-black">
          تأكيد وإرسال الطلب
        </Button>
      </div>
    </div>
  )
}
