"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, Tag, MapPin, ChevronLeft, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, increment } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [coupon, setCoupon] = useState("")
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wallet">("cash")
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

  // جلب المحفظة والعناوين
  const walletRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "wallet", "wallet")
  }, [db, user])
  const { data: wallet } = useDoc(walletRef)

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"))
  }, [db, user])
  const { data: addresses, isLoading: isLoadingAddresses } = useCollection(addressesQuery)

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddressId(defaultAddr.id)
    }
  }, [addresses, selectedAddressId])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
    // إطلاق حدث لتحديث السلة العائمة عالمياً
    window.dispatchEvent(new Event('cart-updated'))
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
    if (!user || !db) {
      router.push('/login')
      return
    }

    if (!selectedAddressId) {
      toast({ title: "تنبيه", description: "يرجى اختيار عنوان التوصيل أولاً", variant: "destructive" })
      return
    }

    if (paymentMethod === "wallet" && (wallet?.balance || 0) < total) {
      toast({ title: "رصيد غير كافٍ", description: "رصيد محفظتك لا يكفي لإتمام هذا الطلب", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const selectedAddress = addresses?.find(a => a.id === selectedAddressId)
    
    const orderData = {
      userId: user.uid,
      storeId: cart[0].storeId,
      orderItems: cart,
      totalAmount: total,
      status: "pending",
      createdAt: serverTimestamp(),
      deliveryAddress: `${selectedAddress?.label}: ${selectedAddress?.city} - ${selectedAddress?.details}`,
      paymentMethod: paymentMethod === "cash" ? "cash_on_delivery" : "wallet",
    }

    try {
      const ordersRef = collection(db, "users", user.uid, "orders")
      const docRef = await addDoc(ordersRef, orderData)

      // إذا كان الدفع عبر المحفظة، خصم المبلغ
      if (paymentMethod === "wallet") {
        await updateDoc(walletRef!, {
          balance: increment(-total)
        })
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: total,
          type: "debit",
          description: `دفع طلب من متجر برقم #${docRef.id.substring(0,6)}`,
          createdAt: serverTimestamp()
        })
      }

      // إضافة تنبيه
      await addDoc(collection(db, "users", user.uid, "notifications"), {
        title: "تم استلام طلبك!",
        body: `طلبك برقم #${docRef.id.substring(0,6)} قيد التجهيز الآن. سيصلك إلى ${selectedAddress?.label}.`,
        type: "order_status",
        isRead: false,
        createdAt: serverTimestamp()
      })

      localStorage.removeItem('absher_cart')
      // إطلاق حدث لتحديث السلة العائمة عالمياً (ستختفي لأن الكمية ستصبح 0)
      window.dispatchEvent(new Event('cart-updated'))
      
      toast({ title: "تم إرسال الطلب", description: "شكراً لك! سيصلك الطلب قريباً" })
      router.push('/orders')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyCoupon = () => {
    if (coupon.toLowerCase() === 'absher24') {
      setIsCouponApplied(true)
      toast({ title: "تم التفعيل", description: "حصلت على خصم 15 ريال" })
    } else {
      toast({ title: "كوبون خاطئ", variant: "destructive" })
    }
  }

  if (!mounted) return null
  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-body" dir="rtl">
      <ShoppingBag className="h-20 w-20 text-muted-foreground opacity-20 mb-4" />
      <h1 className="text-xl font-bold">سلة التسوق فارغة</h1>
      <Button onClick={() => router.push('/')} className="mt-4 rounded-xl">تصفح المتاجر</Button>
    </div>
  )

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full"><ArrowRight /></Button>
        <h1 className="text-xl font-bold">سلة التسوق</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* العناوين */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-sm">عنوان التوصيل</h2>
            <Link href="/addresses" className="text-[10px] text-primary font-bold">تعديل</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {addresses && addresses.length > 0 ? (
              addresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    "min-w-[140px] border-none shadow-sm cursor-pointer rounded-2xl",
                    selectedAddressId === addr.id ? "ring-2 ring-primary bg-primary/5" : "bg-white opacity-60"
                  )}
                >
                  <CardContent className="p-3">
                    <p className="font-bold text-xs">{addr.label}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{addr.city}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Button variant="outline" className="w-full rounded-2xl border-dashed" asChild>
                <Link href="/addresses">إضافة عنوان جديد</Link>
              </Button>
            )}
          </div>
        </section>

        {/* الوجبات */}
        <section className="space-y-3">
          {cart.map((item) => (
            <Card key={item.id} className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="p-4 flex gap-4">
                <div className="relative h-20 w-20 shrink-0"><Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" /></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-primary font-black text-sm">{item.price} ر.س</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button onClick={() => updateQuantity(item.id, -1)} variant="outline" size="sm" className="h-8 w-8 rounded-full">-</Button>
                      <span className="font-bold">{item.quantity}</span>
                      <Button onClick={() => updateQuantity(item.id, 1)} variant="outline" size="sm" className="h-8 w-8 rounded-full">+</Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* طرق الدفع */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm px-1">طريقة الدفع</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPaymentMethod("cash")}
              className={cn("p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all", paymentMethod === "cash" ? "border-primary bg-primary/5 shadow-md" : "border-white bg-white")}
            >
              <CreditCard className={cn("h-6 w-6", paymentMethod === "cash" ? "text-primary" : "text-muted-foreground")} />
              <span className="text-[10px] font-bold">عند الاستلام</span>
            </button>
            <button 
              onClick={() => setPaymentMethod("wallet")}
              className={cn("p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all", paymentMethod === "wallet" ? "border-primary bg-primary/5 shadow-md" : "border-white bg-white")}
            >
              <Wallet className={cn("h-6 w-6", paymentMethod === "wallet" ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <span className="text-[10px] font-bold">المحفظة</span>
                <p className="text-[8px] text-muted-foreground">رصيد: {wallet?.balance || 0}</p>
              </div>
            </button>
          </div>
        </section>

        {/* الكوبون */}
        <div className="relative">
          <Tag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="كوبون الخصم" 
            className="h-14 pr-12 pl-24 rounded-2xl bg-white border-none"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <Button onClick={applyCoupon} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 rounded-xl" disabled={isCouponApplied}>{isCouponApplied ? 'مطبق' : 'تطبيق'}</Button>
        </div>

        {/* المجموع */}
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">المجموع الفرعي</span><span className="font-bold">{cartTotal} ر.س</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">رسوم التوصيل</span><span className="font-bold">{deliveryFee} ر.س</span></div>
            {isCouponApplied && <div className="flex justify-between text-sm text-green-600"><span>خصم</span><span className="font-bold">- {discount} ر.س</span></div>}
            <div className="border-t pt-4 flex justify-between items-center"><span className="font-black text-lg">الإجمالي</span><span className="font-black text-primary text-2xl">{total} ر.س</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button 
          onClick={handleCheckout} 
          disabled={isSubmitting || !selectedAddressId}
          className="w-full h-16 rounded-2xl shadow-2xl text-lg font-black bg-primary"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد وإرسال الطلب"}
        </Button>
      </div>
    </div>
  )
}
