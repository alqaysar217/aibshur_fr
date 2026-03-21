
"use client"

import { useState, useEffect } from "react"
import { 
  Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, 
  Tag, MapPin, ChevronLeft, Loader2, Wallet, Banknote, 
  MessageSquare, AlertCircle, CheckCircle2, X, Edit2, Check 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, increment } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "مؤسسة أبشر للتجارة", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "tadhamon", name: "بنك التضامن", holder: "مؤسسة أبشر للتجارة", account: "987654321", logo: "https://picsum.photos/seed/tadhamon/100" },
  { id: "yemen_kuwait", name: "بنك اليمن والكويت", holder: "مؤسسة أبشر للتجارة", account: "456789123", logo: "https://picsum.photos/seed/ykb/100" }
]

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [coupon, setCoupon] = useState("")
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [isCouponApplied, setIsCouponApplied] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wallet" | "bank">("cash")
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
  const deliveryFee = 10
  const discount = isCouponApplied ? 15 : 0
  const total = Math.max(0, cartTotal + deliveryFee - discount)

  const handleCheckout = async () => {
    if (!user || !db) {
      router.push('/login')
      return
    }

    if (!selectedAddressId) {
      toast({ title: "تنبيه", description: "يرجى اختيار عنوان التوصيل", variant: "destructive" })
      return
    }

    if (paymentMethod === "wallet" && (wallet?.balance || 0) < total) {
      toast({ title: "رصيد غير كافٍ", description: "رصيد محفظتك لا يكفي لإتمام الطلب", variant: "destructive" })
      return
    }

    if (paymentMethod === "bank" && !selectedBankId) {
      toast({ title: "تنبيه", description: "يرجى اختيار البنك المراد التحويل إليه", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const selectedAddress = addresses?.find(a => a.id === selectedAddressId)
    const selectedBank = BANK_ACCOUNTS.find(b => b.id === selectedBankId)
    
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
      bankDetails: paymentMethod === "bank" ? selectedBank : null,
      deliveryAddress: `${selectedAddress?.city} - ${selectedAddress?.details}`,
      notes: orderNotes,
      createdAt: serverTimestamp(),
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

      await addDoc(collection(db, "users", user.uid, "notifications"), {
        title: "تم استلام طلبك!",
        body: `طلبك #${docRef.id.substring(0,6)} قيد التجهيز. سنتواصل معك عبر الواتساب لتأكيد الطلب وإرسال الفاتورة التفصيلية.`,
        type: "order_status",
        isRead: false,
        createdAt: serverTimestamp()
      })

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

  const applyCoupon = () => {
    if (coupon.toLowerCase() === 'absher24') {
      setIsCouponApplied(true)
      toast({ title: "تم تفعيل الخصم" })
    } else {
      toast({ title: "كوبون غير صالح", variant: "destructive" })
    }
  }

  if (!mounted) return null
  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white" dir="rtl">
      <div className="bg-secondary/20 p-10 rounded-full mb-6">
        <ShoppingBag className="h-20 w-20 text-muted-foreground opacity-30" />
      </div>
      <h1 className="text-xl font-black mb-2">سلة التسوق فارغة</h1>
      <p className="text-muted-foreground text-sm mb-8">ابدأ بإضافة منتجاتك المفضلة الآن</p>
      <Button onClick={() => router.push('/')} className="rounded-2xl h-14 px-10 font-bold text-lg">تصفح المتاجر</Button>
    </div>
  )

  return (
    <div className="pb-40 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black">سلة التسوق</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive text-xs font-bold gap-1">
          <Trash2 className="h-4 w-4" /> تفريغ السلة
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* ملخص المنتجات (الجدول) */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> قائمة المنتجات
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-primary gap-1 h-8"
            >
              {isEditing ? <><Check className="h-3.5 w-3.5" /> تم</> : <><Edit2 className="h-3.5 w-3.5" /> تعديل</>}
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="bg-gray-50/50 p-3 flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b">
              <span className="flex-1">المنتج</span>
              <span className="w-16 text-center">السعر</span>
              <span className="w-16 text-center">الكمية</span>
              <span className="w-16 text-left">الإجمالي</span>
            </div>
            <div className="divide-y divide-secondary/50">
              {cart.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-3 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{item.name}</p>
                    {isEditing && (
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="text-[9px] text-destructive font-bold flex items-center gap-0.5 mt-1"
                      >
                        <Trash2 className="h-3 w-3" /> حذف
                      </button>
                    )}
                  </div>
                  <div className="w-16 text-center font-bold text-[11px]">{item.price}</div>
                  <div className="w-16 flex items-center justify-center">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="h-5 w-5 rounded-full border flex items-center justify-center bg-white active:scale-90"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center active:scale-90"><Plus className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <span className="text-xs font-black">{item.quantity}</span>
                    )}
                  </div>
                  <div className="w-16 text-left font-black text-primary text-[11px]">{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* العناوين */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> عنوان التوصيل</h2>
            <Link href="/addresses" className="text-[10px] text-primary font-bold">إضافة/تعديل</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {addresses && addresses.length > 0 ? (
              addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    "min-w-[150px] p-4 rounded-2xl border-2 text-right transition-all",
                    selectedAddressId === addr.id ? "border-primary bg-primary/5 shadow-sm" : "border-white bg-white opacity-70"
                  )}
                >
                  <p className="font-black text-xs mb-1">{addr.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{addr.city} - {addr.details}</p>
                </button>
              ))
            ) : (
              <Link href="/addresses" className="w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed">إضافة عنوان للتوصيل</Button>
              </Link>
            )}
          </div>
        </section>

        {/* الكوبون */}
        <section className="space-y-3">
          {!showCouponInput ? (
            <button onClick={() => setShowCouponInput(true)} className="flex items-center gap-2 text-primary font-bold text-xs px-1">
              <Tag className="h-4 w-4" /> هل لديك كوبون خصم؟
            </button>
          ) : (
            <div className="relative flex items-center gap-2 animate-in slide-in-from-top-2">
              <Input 
                placeholder="أدخل الكود (مثال: ABSHER24)" 
                className="h-12 rounded-xl bg-white border-none shadow-sm"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <Button onClick={applyCoupon} className="h-12 rounded-xl px-6" disabled={isCouponApplied || !coupon}>تطبيق</Button>
              <button onClick={() => setShowCouponInput(false)} className="p-2"><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          )}
        </section>

        {/* طرق الدفع */}
        <section className="space-y-4">
          <h2 className="font-bold text-sm px-1 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> طريقة الدفع</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash", label: "نقدي", icon: Banknote },
              { id: "wallet", label: "محفظة", icon: Wallet },
              { id: "bank", label: "تحويل", icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={cn(
                  "p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                  paymentMethod === method.id ? "border-primary bg-primary/5 shadow-md" : "border-white bg-white"
                )}
              >
                <method.icon className={cn("h-5 w-5", paymentMethod === method.id ? "text-primary" : "text-muted-foreground")} />
                <span className="text-[10px] font-black">{method.label}</span>
              </button>
            ))}
          </div>

          {/* تفاصيل التحويل البنكي */}
          {paymentMethod === "bank" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
              <p className="text-[10px] font-bold text-muted-foreground mr-1">اختر البنك لتحويل المبلغ وإرفاق السند لاحقاً:</p>
              <div className="space-y-2">
                {BANK_ACCOUNTS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-right transition-all",
                      selectedBankId === bank.id ? "border-primary bg-primary/5 shadow-sm" : "border-white bg-white"
                    )}
                  >
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 border bg-white">
                      <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xs">{bank.name}</p>
                      <p className="text-[10px] text-muted-foreground tracking-widest">{bank.account}</p>
                      <p className="text-[8px] text-primary/70 font-bold">{bank.holder}</p>
                    </div>
                    {selectedBankId === bank.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ملاحظات الطلب */}
        <section className="space-y-2">
          <label className="text-xs font-black text-muted-foreground flex items-center gap-2 mr-1">
            <MessageSquare className="h-3.5 w-3.5" /> ملاحظات إضافية (اختياري)
          </label>
          <Textarea 
            placeholder="مثال: يرجى جعل الطعام حاراً، أو الاتصال عند الوصول..."
            className="min-h-[100px] rounded-2xl border-none shadow-sm bg-white resize-none text-xs leading-relaxed"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </section>

        {/* الفاتورة النهائية */}
        <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">قيمة المنتجات</span>
              <span>{cartTotal} ر.س</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">رسوم التوصيل</span>
              <span className="text-primary">+ {deliveryFee} ر.س</span>
            </div>
            {isCouponApplied && (
              <div className="flex justify-between text-xs font-bold text-green-600">
                <span>خصم الكوبون</span>
                <span>- {discount} ر.س</span>
              </div>
            )}
            <div className="border-t-2 border-dashed pt-4 flex justify-between items-center">
              <span className="font-black text-lg">المبلغ الإجمالي</span>
              <span className="font-black text-2xl text-primary">{total} <small className="text-xs">ر.س</small></span>
            </div>
          </CardContent>
        </Card>

        {/* تنبيه الأمان */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-[10px] font-medium leading-relaxed">بضغطك على زر التنفيذ، سيتم إرسال طلبك فوراً. سيقوم فريقنا بمراجعته والتواصل معك عبر الواتساب لتأكيد التفاصيل النهائية وموعد التوصيل.</p>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-[70] animate-in slide-in-from-bottom-10">
        <Button 
          onClick={handleCheckout} 
          disabled={isSubmitting || !selectedAddressId || (paymentMethod === "bank" && !selectedBankId)}
          className="w-full h-16 rounded-2xl shadow-2xl text-lg font-black bg-primary flex items-center justify-between px-8"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2 mx-auto">
              <Loader2 className="animate-spin h-6 w-6" />
              <span>جاري إرسال الطلب...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span>تأكيد وتنفيذ الطلب</span>
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
