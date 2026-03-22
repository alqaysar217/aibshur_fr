
"use client"

import { useState, useEffect } from "react"
import { 
  Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, 
  Tag, MapPin, ChevronLeft, Loader2, Wallet, Banknote, 
  MessageSquare, AlertCircle, CheckCircle2, Copy, ChevronDown, Check, Edit2, LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, increment } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [coupon, setCoupon] = useState("")
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [orderNotes, setOrderNotes] = useState("")
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

  const walletRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "wallet", "wallet")
  }, [db, user])
  const { data: wallet } = useDoc(walletRef)

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"))
  }, [db, user])
  const { data: addresses } = useCollection(addressesQuery)

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddressId(defaultAddr.id)
    }
  }, [addresses, selectedAddressId])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
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

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId)
    saveCart(newCart)
  }

  const clearCart = () => {
    saveCart([])
    toast({ title: "تم إفراغ السلة" })
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 1000 
  const discount = isCouponApplied ? 500 : 0
  const total = Math.max(0, cartTotal + deliveryFee - discount)

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول لإتمام الطلب" })
      router.push('/login')
      return
    }

    if (!selectedAddressId) {
      toast({ title: "تنبيه", description: "يرجى اختيار عنوان التوصيل", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const selectedAddress = addresses?.find(a => a.id === selectedAddressId)
    
    const orderData = {
      userId: user.uid,
      storeId: cart[0].storeId,
      orderItems: cart,
      subtotal: cartTotal,
      deliveryFee: deliveryFee,
      discount: discount,
      totalAmount: total,
      status: "pending",
      paymentMethod: paymentMethod,
      deliveryAddress: `${selectedAddress?.city} - ${selectedAddress?.details}`,
      notes: orderNotes,
      createdAt: serverTimestamp()
    }

    try {
      const ordersRef = collection(db, "users", user.uid, "orders")
      const docRef = await addDoc(ordersRef, orderData)

      if (paymentMethod === "wallet") {
        await updateDoc(walletRef!, { balance: increment(-total) })
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: total,
          type: "debit",
          description: `دفع طلب #${docRef.id.substring(0,6)}`,
          createdAt: serverTimestamp()
        })
      }

      localStorage.removeItem('absher_cart')
      window.dispatchEvent(new Event('cart-updated'))
      
      toast({ title: "تم إرسال الطلب بنجاح" })
      router.push('/orders')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null
  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white" dir="rtl">
      <div className="bg-secondary/20 p-8 rounded-[10px] mb-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
      </div>
      <h1 className="text-xl font-black text-primary mb-2">سلة التسوق فارغة</h1>
      <Button onClick={() => router.push('/')} className="rounded-[10px] h-14 px-10 font-bold text-lg">تصفح المتاجر</Button>
    </div>
  )

  return (
    <div className="pb-40 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">سلة التسوق</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive text-xs font-bold gap-1">
          <Trash2 className="h-4 w-4" /> تفريغ
        </Button>
      </header>

      <div className="p-4 space-y-4">
        {/* تنبيه الزائر في السلة */}
        {!user && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-[10px] flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-amber-600" />
              <div className="text-right">
                <p className="text-[11px] font-black text-amber-900 leading-none">أنت في وضع الضيف</p>
                <p className="text-[9px] font-bold text-amber-700 mt-1">سجل دخولك لتتمكن من إتمام الطلب</p>
              </div>
            </div>
            <Button onClick={() => router.push('/login')} size="sm" className="h-8 rounded-md bg-amber-600 text-[10px] font-black">دخول</Button>
          </div>
        )}

        <Card className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
          <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
            <h2 className="font-bold text-sm text-primary flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> قائمة الطلبات
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-primary gap-1 h-8 rounded-md border border-primary/20"
            >
              {isEditing ? <><Check className="h-3.5 w-3.5" /> تم</> : <><Edit2 className="h-3.5 w-3.5" /> تعديل</>}
            </Button>
          </div>
          <CardContent className="p-0">
            {!isEditing ? (
              <div className="divide-y divide-secondary/50">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate text-right">{item.name}</p>
                    </div>
                    <div className="w-16 text-center font-bold text-[11px] text-muted-foreground shrink-0">{item.price} ر.س</div>
                    <div className="w-12 text-center font-black text-[11px] shrink-0">x{item.quantity}</div>
                    <div className="w-20 text-center font-black text-primary text-[11px] shrink-0">
                      {item.price * item.quantity} ر.س
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 rounded-md bg-secondary/10 flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0 border bg-white">
                      <Image src={item.imageUrl || `https://picsum.photos/seed/${item.id}/100`} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-bold text-xs truncate">{item.name}</p>
                      <p className="text-[10px] text-primary font-black">{item.price} ر.س</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-md shadow-sm border">
                      <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 rounded flex items-center justify-center active:scale-90"><Minus className="h-3 w-3" /></button>
                      <span className="text-xs font-black min-w-[15px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 rounded bg-primary text-white flex items-center justify-center active:scale-90"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-destructive active:scale-90"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {user && (
          <section className="space-y-3">
            <h2 className="font-bold text-sm text-primary px-1 flex items-center gap-2"><MapPin className="h-4 w-4" /> عنوان التوصيل</h2>
            <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <SelectTrigger className="h-14 rounded-[10px] bg-white border-none shadow-sm font-bold text-xs text-right" dir="rtl">
                <SelectValue placeholder="اختر عنوان التوصيل" />
              </SelectTrigger>
              <SelectContent className="rounded-[10px]" dir="rtl">
                {addresses?.map((addr) => (
                  <SelectItem key={addr.id} value={addr.id} className="font-bold text-xs py-3 text-right">
                    {addr.label} ({addr.city} - {addr.details})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        )}

        <Card className="border-none shadow-sm rounded-[10px] bg-white overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">قيمة المنتجات</span>
              <span>{cartTotal} ر.س</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">رسوم التوصيل</span>
              <span className="text-primary">+ {deliveryFee} ر.س</span>
            </div>
            <div className="border-t border-dashed pt-4 flex justify-between items-center">
              <span className="font-black text-lg text-primary">المبلغ الإجمالي</span>
              <span className="font-black text-2xl text-primary">{total} <small className="text-xs">ر.س</small></span>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleCheckout} 
          disabled={isSubmitting || (user && !selectedAddressId)}
          className="w-full h-16 rounded-[10px] shadow-xl text-lg font-black bg-primary flex items-center justify-between px-8 mt-6"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2 mx-auto">
              <Loader2 className="animate-spin h-6 w-6" />
              <span>جاري المعالجة...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span>{user ? "تأكيد وتنفيذ الطلب" : "تسجيل الدخول للطلب"}</span>
                <ChevronLeft className="h-5 w-5" />
              </div>
              <span className="border-r pr-4 border-white/20">{total} ر.س</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
