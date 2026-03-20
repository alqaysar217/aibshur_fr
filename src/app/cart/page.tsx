
"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, Tag, MapPin, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [coupon, setCoupon] = useState("")
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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

  // جلب عناوين المستخدم لاختيار أحدها
  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: addresses, isLoading: isLoadingAddresses } = useCollection(addressesQuery)

  // تحديد العنوان الافتراضي تلقائياً عند التحميل
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddressId(defaultAddr.id)
    }
  }, [addresses, selectedAddressId])

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

    if (!selectedAddressId) {
      toast({ title: "تنبيه", description: "يرجى اختيار عنوان التوصيل أولاً", variant: "destructive" })
      return
    }

    const selectedAddress = addresses?.find(a => a.id === selectedAddressId)
    if (!selectedAddress) return

    setIsSubmitting(true)

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
      deliveryAddress: `${selectedAddress.label}: ${selectedAddress.city} - ${selectedAddress.details}`,
      deliveryLatitude: selectedAddress.latitude,
      deliveryLongitude: selectedAddress.longitude,
      paymentMethod: "cash_on_delivery"
    }

    const ordersRef = collection(db, "users", user.uid, "orders")
    const notificationsRef = collection(db, "users", user.uid, "notifications")
    
    addDoc(ordersRef, orderData)
      .then((docRef) => {
        addDoc(notificationsRef, {
          title: "تم استلام طلبك بنجاح!",
          body: `طلبك من متجر ${cart[0].storeName || 'المتجر'} برقم #${docRef.id.substring(0, 6)} قيد المراجعة. سيصلك إلى ${selectedAddress.label}.`,
          type: "order_status_update",
          isRead: false,
          createdAt: serverTimestamp()
        })

        localStorage.removeItem('absher_cart')
        setCart([])
        toast({ title: "تم إرسال الطلب", description: "شكراً لك! يمكنك متابعة حالة الطلب من قائمة طلباتي" })
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
      .finally(() => setIsSubmitting(false))
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-white font-body" dir="rtl">
        <div className="bg-secondary/20 p-8 rounded-full">
          <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">سلة التسوق فارغة</h1>
        <Button onClick={() => router.push('/')} className="w-full h-14 rounded-2xl">تصفح المتاجر</Button>
      </div>
    )
  }

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">سلة التسوق</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* العناوين (الميزة الجديدة) */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> عنوان التوصيل
            </h2>
            <Link href="/addresses" className="text-[10px] font-bold text-primary flex items-center gap-1">
              إدارة العناوين <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {isLoadingAddresses ? (
              <div className="h-16 w-full bg-white rounded-2xl animate-pulse" />
            ) : addresses && addresses.length > 0 ? (
              addresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    "min-w-[140px] border-none shadow-sm cursor-pointer transition-all rounded-2xl overflow-hidden",
                    selectedAddressId === addr.id ? "ring-2 ring-primary bg-primary/5" : "bg-white opacity-60"
                  )}
                >
                  <CardContent className="p-3">
                    <p className="font-bold text-xs truncate">{addr.label}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{addr.city}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="w-full border-dashed border-2 bg-transparent text-center p-4 rounded-2xl">
                 <Link href="/addresses" className="text-xs font-bold text-primary">
                    + أضف عنوان لاهلك أو لنفسك
                 </Link>
              </Card>
            )}
          </div>
        </section>

        {/* قائمة الوجبات */}
        <section className="space-y-3">
          {cart.map((item) => (
            <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-4 flex gap-4">
                <div className="relative h-20 w-20 shrink-0 shadow-inner">
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
        </section>

        {/* الكوبون */}
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

        {/* تفاصيل الدفع */}
        <div className="space-y-4">
          <h2 className="font-bold px-1">تفاصيل الدفع</h2>
          <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-6 space-y-3">
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
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-black text-lg">الإجمالي</span>
                <span className="font-black text-primary text-2xl">{total} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 p-5 bg-white rounded-[2rem] shadow-sm">
          <div className="bg-green-100 p-3 rounded-2xl">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">الدفع عند الاستلام</p>
            <p className="text-[10px] text-muted-foreground">ادفع نقداً للمندوب فور وصوله</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button 
          onClick={handleCheckout} 
          disabled={isSubmitting || !selectedAddressId}
          className="w-full h-16 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-black bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد وإرسال الطلب"}
        </Button>
      </div>
    </div>
  )
}
