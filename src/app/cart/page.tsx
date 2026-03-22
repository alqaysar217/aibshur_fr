"use client"

import { useState, useEffect } from "react"
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  MapPin, Loader2, Wallet, Banknote, 
  MessageSquare, CheckCircle2, ChevronDown, Check, Edit2, LogIn, Tag, PlusCircle, Copy,
  Home, Briefcase, Landmark
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
import { collection, addDoc, serverTimestamp, query, orderBy, doc } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" }
]

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [orderNotes, setOrderNotes] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isCouponExpanded, setIsCouponExpanded] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

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
  const total = cartTotal + deliveryFee

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

    if (!paymentMethod) {
      toast({ title: "تنبيه", description: "يرجى اختيار طريقة الدفع", variant: "destructive" })
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
      totalAmount: total,
      status: "pending",
      paymentMethod: paymentMethod,
      deliveryAddress: `${selectedAddress?.city} - ${selectedAddress?.details}`,
      notes: orderNotes,
      couponCode: couponCode,
      createdAt: serverTimestamp()
    }

    try {
      const ordersRef = collection(db, "users", user.uid, "orders")
      await addDoc(ordersRef, orderData)

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
      <div className="bg-secondary/20 p-8 rounded-[15px] mb-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
      </div>
      <h1 className="text-xl font-black text-primary mb-2">سلة التسوق فارغة</h1>
      <Button onClick={() => router.push('/')} className="rounded-[15px] h-14 px-10 font-bold text-lg">تصفح المتاجر</Button>
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

      <div className="p-4 space-y-6">
        {!user && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-[15px] flex items-center justify-between mb-2">
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

        {/* قائمة الطلبات */}
        <Card className="border-none shadow-sm rounded-[15px] overflow-hidden bg-white">
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
          
          {/* Table Headers */}
          {!isEditing && (
            <div className="px-4 py-3 bg-gray-50/50 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <span className="flex-1 text-right">المنتج</span>
              <span className="w-16 text-center">السعر</span>
              <span className="w-12 text-center">الكمية</span>
              <span className="w-20 text-center">الإجمالي</span>
            </div>
          )}

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

        {/* عنوان التوصيل */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-sm text-primary flex items-center gap-2">
              <MapPin className="h-4 w-4" /> عنوان التوصيل
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/addresses')}
              className="text-[10px] font-black text-primary gap-1 h-7 bg-primary/5 rounded-full px-3"
            >
              <PlusCircle className="h-3 w-3" /> إضافة عنوان
            </Button>
          </div>
          {user ? (
            <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <SelectTrigger className="h-14 rounded-[15px] bg-white border-none shadow-sm font-bold text-xs text-right" dir="rtl">
                <SelectValue placeholder="اختر عنوان التوصيل" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]" dir="rtl">
                {addresses?.map((addr) => {
                  const AddrIcon = addr.label === "المنزل" ? Home : addr.label === "العمل" ? Briefcase : MapPin;
                  return (
                    <SelectItem key={addr.id} value={addr.id} className="font-bold text-xs py-3 text-right">
                      <div className="flex items-center gap-2 justify-end w-full">
                        <span>{addr.label} ({addr.city} - {addr.details})</span>
                        <AddrIcon className="h-4 w-4 text-primary" />
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Card className="border-none shadow-sm rounded-[15px] bg-white p-4 text-center">
              <p className="text-xs text-muted-foreground font-bold italic">سجل دخولك لاختيار عنوان التوصيل</p>
            </Card>
          )}
        </section>

        {/* كوبون الخصم */}
        <section className="space-y-3">
          <button 
            onClick={() => setIsCouponExpanded(!isCouponExpanded)}
            className="flex items-center justify-between w-full px-1 py-1"
          >
            <h2 className="font-bold text-sm text-primary flex items-center gap-2">
              <Tag className="h-4 w-4" /> هل لديك كوبون خصم؟
            </h2>
            <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", isCouponExpanded && "rotate-180")} />
          </button>
          {isCouponExpanded && (
            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
              <Input 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="أدخل كود الخصم هنا"
                className="h-12 rounded-[12px] bg-white border-none shadow-sm text-right font-bold text-xs"
              />
              <Button className="h-12 px-6 rounded-[12px] font-black text-xs shadow-sm">تطبيق</Button>
            </div>
          )}
        </section>

        {/* الملاحظات */}
        <section className="space-y-3">
          <button 
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="flex items-center justify-between w-full px-1 py-1"
          >
            <h2 className="font-bold text-sm text-primary flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> هل لديك ملاحظة؟
            </h2>
            <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", isNotesExpanded && "rotate-180")} />
          </button>
          {isNotesExpanded && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <Textarea 
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="مثال: يرجى الاتصال عند الوصول، بدون شطة، إلخ..."
                className="rounded-[15px] bg-white border-none shadow-sm text-right font-bold text-xs min-h-[100px] p-4 resize-none"
              />
            </div>
          )}
        </section>

        {/* طرق الدفع */}
        <section className="space-y-3">
          <h2 className="font-bold text-sm text-primary px-1 flex items-center gap-2">
            <Wallet className="h-4 w-4" /> طريقة الدفع
          </h2>
          
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="h-14 rounded-[15px] bg-white border-none shadow-sm font-bold text-xs text-right" dir="rtl">
              <SelectValue placeholder="اختر طريقة الدفع" />
            </SelectTrigger>
            <SelectContent className="rounded-[15px]" dir="rtl">
              <SelectItem value="wallet" className="font-bold text-xs py-3 text-right">
                <div className="flex items-center gap-2 justify-end w-full">
                  <span>المحفظة (الرصيد: {wallet?.balance || 0} ر.س)</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
              </SelectItem>
              <SelectItem value="cash" className="font-bold text-xs py-3 text-right">
                <div className="flex items-center gap-2 justify-end w-full">
                  <span>الدفع عند الاستلام</span>
                  <Banknote className="h-4 w-4 text-primary" />
                </div>
              </SelectItem>
              <SelectItem value="bank" className="font-bold text-xs py-3 text-right">
                <div className="flex items-center gap-2 justify-end w-full">
                  <span>تحويل بنكي</span>
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {paymentMethod === 'bank' && (
            <div className="space-y-3 animate-in fade-in duration-300 mt-4">
              {BANK_ACCOUNTS.map((bank) => (
                <div key={bank.id} className="p-4 bg-white rounded-[15px] border border-gray-100 space-y-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                      <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-black text-gray-900">{bank.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
                    <span className="font-black text-sm tracking-widest text-primary">{bank.account}</span>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(bank.account); toast({ title: "تم النسخ" }); }} className="h-8 w-8 p-0 text-primary">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ملخص الفاتورة */}
        <Card className="border-none shadow-sm rounded-[15px] bg-white overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">إجمالي المنتجات</span>
              <span>{cartTotal} ر.س</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">رسوم التوصيل</span>
              <span className="text-primary">+ {deliveryFee} ر.س</span>
            </div>
            <div className="border-t border-dashed pt-4 flex justify-between items-center">
              <span className="font-black text-sm text-primary">الإجمالي الكلي</span>
              <span className="font-black text-2xl text-primary">{total} <small className="text-xs">ر.س</small></span>
            </div>
          </CardContent>
        </Card>

        {/* زر التأكيد */}
        <Button 
          onClick={handleCheckout} 
          disabled={isSubmitting || (user && (!selectedAddressId || !paymentMethod))}
          className="w-full h-16 rounded-[15px] shadow-xl text-base font-black bg-primary flex items-center justify-center gap-3 mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>جاري المعالجة...</span>
            </>
          ) : (
            <span>تأكيد الطلب - {total} ر.س</span>
          )}
        </Button>
      </div>
    </div>
  )
}
