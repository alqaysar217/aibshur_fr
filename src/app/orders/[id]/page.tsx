
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from "firebase/firestore"
import { 
  ArrowRight, Clock, MapPin, CreditCard, ShoppingBag, Star, 
  Phone, MessageCircle, ChevronRight, Truck, CheckCircle2, 
  Utensils, XCircle, RefreshCw, Wallet, Landmark, Copy, Heart,
  Navigation, Home, Bug
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useMemo, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Image from "next/image"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" }
]

const MOCK_ORDERS_DETAILS: Record<string, any> = {
  "mock-1": { id: "mock-1", storeName: "مطعم مذاقي", storeId: "mathaqi_rest", totalAmount: 4500, subtotal: 3500, deliveryFee: 1000, status: "delivered", createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) }, deliveryAddress: "المكلا - حي الشرج - عمارة البركة", paymentMethod: "الدفع عند الاستلام", orderItems: [{ id: "p1", name: "مندي دجاج نصف حبة", quantity: 1, price: 2500 }, { id: "p2", name: "سلطة حارة", quantity: 2, price: 500 }] },
  "mock-2": { id: "mock-2", storeName: "سوبر ماركت الخليج", storeId: "al_khaleej_market", totalAmount: 1200, subtotal: 200, deliveryFee: 1000, status: "on_the_way", createdAt: { toDate: () => new Date() }, deliveryAddress: "المكلا - فوه - مساكن الإنشاءات", paymentMethod: "المحفظة", driverName: "سالم محمد", orderItems: [{ id: "p3", name: "زبادي نادك كبير", quantity: 2, price: 100 }] },
  "mock-3": { id: "mock-3", storeName: "كافيه بن علي", storeId: "ali_cafe", totalAmount: 2800, subtotal: 1800, deliveryFee: 1000, status: "preparing", createdAt: { toDate: () => new Date() }, deliveryAddress: "المكلا - الديس", paymentMethod: "الدفع عند الاستلام", orderItems: [{ id: "p4", name: "كابتشينو", quantity: 2, price: 900 }] },
  "mock-4": { id: "mock-4", storeName: "صيدلية السلام", storeId: "salam_pharmacy", totalAmount: 3500, subtotal: 2500, deliveryFee: 1000, status: "cancelled", createdAt: { toDate: () => new Date() }, deliveryAddress: "المكلا - الشرج", paymentMethod: "الدفع عند الاستلام", orderItems: [{ id: "p5", name: "بنادول اكسترا", quantity: 5, price: 500 }] },
  "mock-5": { id: "mock-5", storeName: "عسل حضرمي", storeId: "sweet_home", totalAmount: 15000, subtotal: 14000, deliveryFee: 1000, status: "pending", createdAt: { toDate: () => new Date() }, deliveryAddress: "سيئون - السحيل", paymentMethod: "تحويل بنكي", orderItems: [{ id: "p6", name: "عسل سدر ملكي 1كجم", quantity: 1, price: 14000 }] }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [mounted, setMounted] = useState(false)
  const [rating, setRating] = useState(0)
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false)
  const [canCancel, setCanCancel] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isTipOpen, setIsTipOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState("")
  const [tipMethod, setTipMethod] = useState<"wallet" | "bank">("wallet")
  const [driverHeading, setDriverHeading] = useState(45)
  const [simulatedStatus, setSimulatedStatus] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const orderRef = useMemoFirebase(() => (!db || !user || !id || id.startsWith('mock-')) ? null : doc(db, "users", user.uid, "orders", id as string), [db, user, id])
  const { data: realOrder, isLoading: isRealOrderLoading } = useDoc(orderRef)
  
  const baseOrder = useMemo(() => id.startsWith('mock-') ? MOCK_ORDERS_DETAILS[id] : realOrder, [id, realOrder])
  const order = useMemo(() => baseOrder ? { ...baseOrder, status: simulatedStatus || baseOrder.status } : null, [baseOrder, simulatedStatus])

  const walletRef = useMemoFirebase(() => (!db || !user) ? null : doc(db, "users", user.uid, "wallet", "wallet"), [db, user])
  const { data: wallet } = useDoc(walletRef)

  useEffect(() => {
    if (order && order.status === 'pending') {
      const createdTime = order.createdAt?.toDate ? order.createdAt.toDate().getTime() : Date.now()
      const diff = Math.floor((Date.now() - createdTime) / 1000)
      if (diff < 10) {
        setCanCancel(true)
        setTimeLeft(10 - diff)
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) { clearInterval(timer); setCanCancel(false); return 0; }
            return prev - 1;
          })
        }, 1000)
        return () => clearInterval(timer)
      }
    } else {
      setCanCancel(false)
    }
  }, [order?.status, order?.id])

  useEffect(() => {
    if (order?.status === 'on_the_way') {
      const interval = setInterval(() => {
        setDriverHeading(prev => (prev + (Math.random() * 10 - 5)) % 360)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [order?.status])

  const steps = [
    { id: 'pending', label: 'قيد الانتظار', icon: Clock },
    { id: 'accepted', label: 'تم القبول', icon: CheckCircle2 },
    { id: 'preparing', label: 'جاري التحضير', icon: Utensils },
    { id: 'on_the_way', label: 'في الطريق', icon: Truck },
    { id: 'delivered', label: 'تم التسليم', icon: CheckCircle2 }
  ]

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === order?.status)
  
  const handleCancelOrder = async () => {
    if (!canCancel || !order) return
    toast({ title: "تم إلغاء الطلب", description: "تم إلغاء طلبك بنجاح" })
    setSimulatedStatus('cancelled')
  }

  const handleTipSubmit = async () => {
    if (tipMethod === 'wallet' && (wallet?.balance || 0) < Number(tipAmount)) {
      toast({ title: "رصيد غير كافٍ", variant: "destructive" }); return;
    }
    toast({ title: "شكراً لك!", description: "تم إرسال البخشيش للمندوب بنجاح" })
    setIsTipOpen(false)
  }

  const handleReorder = () => {
    if (!order) return
    const savedCart = localStorage.getItem('absher_cart')
    let cart = savedCart ? JSON.parse(savedCart) : []
    
    order.orderItems.forEach((item: any) => {
      const existing = cart.find((i: any) => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        cart.push({
          ...item,
          storeId: order.storeId,
          storeName: order.storeName
        })
      }
    })
    
    localStorage.setItem('absher_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast({ title: "تمت إعادة الطلب", description: "تمت إضافة المنتجات إلى السلة" })
    router.push('/cart')
  }

  if (!mounted || isRealOrderLoading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-black text-primary"><RefreshCw className="animate-spin h-10 w-10" /> جاري التحميل...</div>
  if (!order) return <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-6" dir="rtl"><ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" /><h2 className="text-xl font-black text-primary">الطلب غير موجود</h2><Button onClick={() => router.push('/orders')}>العودة لطلباتي</Button></div>

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10"><ArrowRight className="h-6 w-6 text-primary" /></Button>
          <h1 className="text-lg font-black text-primary">تفاصيل الطلب</h1>
        </div>
        <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 text-[10px]">#{order.id.substring(0, 8).toUpperCase()}</Badge>
      </header>

      <div className="p-5 space-y-6">
        <div className="flex justify-between items-start">
          <div className="text-right space-y-1">
            <h2 className="text-xl font-black text-gray-900">{order.storeName}</h2>
            <p className="text-xs text-gray-400 font-bold">{format(order.createdAt?.toDate?.() || new Date(), "PPP p", { locale: ar })}</p>
          </div>
          <Badge className={cn(
            "border-none font-black px-4 py-1.5 rounded-full text-xs",
            order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-primary text-white'
          )}>
            {steps.find(s => s.id === order.status)?.label || (order.status === 'cancelled' ? 'ملغي' : order.status)}
          </Badge>
        </div>

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="relative flex justify-between items-center w-full px-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary -translate-y-1/2 z-0" />
                <div className="absolute top-1/2 right-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%`, right: 0 }} />
                {steps.map((step, idx) => {
                  const isActive = idx <= getCurrentStepIndex()
                  const StepIcon = step.icon
                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm", isActive ? "bg-primary text-white scale-110" : "bg-gray-200 text-gray-400")}>
                        <StepIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn("text-[8px] font-black whitespace-nowrap", isActive ? "text-primary" : "text-gray-400")}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === 'on_the_way' && (
          <Card className="border-none shadow-sm rounded-[25px] overflow-hidden bg-white animate-in zoom-in duration-500">
            <div className="p-4 bg-primary/5 border-b border-secondary/30 flex justify-between items-center">
              <h3 className="font-black text-xs text-primary flex items-center gap-2"><Truck className="h-4 w-4" /> تتبع المندوب مباشر</h3>
              <Badge className="bg-green-500 text-white border-none text-[8px] font-black">نشط الآن</Badge>
            </div>
            <div className="h-64 w-full bg-[#e5e7eb] relative overflow-hidden">
              <iframe 
                className="w-full h-full border-none" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=49.12,14.53,49.14,14.55&layer=mapnik" 
              />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="var(--primary)" strokeWidth="4" strokeDasharray="8,8" />
              </svg>
              <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white p-2 rounded-full shadow-lg border-2 border-primary">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full mt-1 whitespace-nowrap shadow-sm">موقعك</div>
              </div>
              <div 
                className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                style={{ transform: `translate(-50%, -50%) rotate(${driverHeading}deg)` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="bg-primary p-2.5 rounded-full shadow-2xl border-2 border-white relative z-10">
                    <Navigation className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border shadow-sm flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-700">المندوب يتحرك باتجاهك</span>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h3 className="font-black text-sm px-2 text-right">الوجبات المطلوبة</h3>
          <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex items-center text-[10px] font-black text-gray-400 border-b">
              <span className="flex-1 text-right">المنتج</span>
              <span className="w-16 text-center">السعر</span>
              <span className="w-12 text-center">الكمية</span>
              <span className="w-20 text-left">الإجمالي</span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-secondary/30">
                {order.orderItems.map((item: any, i: number) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <span className="flex-1 font-bold text-xs text-gray-800 text-right">{item.name}</span>
                    <span className="w-16 text-center font-bold text-[10px] text-gray-500">{item.price}</span>
                    <span className="w-12 text-center font-black text-[10px]">x{item.quantity}</span>
                    <span className="w-20 text-left font-black text-primary text-[11px]">{item.price * item.quantity} ر.س</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-4 p-5 bg-white rounded-[25px] shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0"><MapPin className="h-5 w-5 text-orange-600" /></div>
            <div className="text-right space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase">عنوان التوصيل</p>
              <p className="text-xs font-bold text-gray-800 leading-relaxed">{order.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 bg-white rounded-[25px] shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <div className="text-right space-y-1">
              <p className="text-[9px] font-black text-gray-400 uppercase">طريقة الدفع</p>
              <p className="text-xs font-bold text-gray-800">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-xs font-bold text-gray-500"><span>المجموع الفرعي</span><span>{order.subtotal} ر.س</span></div>
            <div className="flex justify-between text-xs font-bold text-gray-500"><span>رسوم التوصيل</span><span className="text-primary">+ {order.deliveryFee} ر.س</span></div>
            <div className="border-t border-dashed border-secondary/50 pt-4 flex justify-between items-center"><span className="font-black text-sm text-gray-900">الإجمالي الكلي</span><span className="font-black text-2xl text-primary">{order.totalAmount} <small className="text-[10px]">ر.س</small></span></div>
          </CardContent>
        </Card>

        {canCancel && order.status === 'pending' ? (
          <Button onClick={handleCancelOrder} className="w-full h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-black text-sm gap-3">
            <XCircle className="h-5 w-5" /> إلغاء الطلب (متاح خلال {timeLeft} ث)
          </Button>
        ) : order.status !== 'delivered' && order.status !== 'cancelled' ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 bg-white text-primary font-black text-xs gap-2"><Phone className="h-4 w-4" /> اتصال {order.driverName ? 'بالمندوب' : 'بالدعم'}</Button>
            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-green-500/20 bg-white text-green-600 font-black text-xs gap-2"><MessageCircle className="h-4 w-4" /> واتساب {order.driverName ? 'بالمندوب' : 'بالدعم'}</Button>
          </div>
        ) : null}

        {order.status === 'delivered' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
            {!isRatingSubmitted ? (
              <Card className="border-none shadow-xl rounded-[30px] bg-gradient-to-br from-primary to-emerald-600 text-white p-6 text-center space-y-5">
                <Star className="h-10 w-10 text-white fill-white mx-auto animate-pulse" />
                <h3 className="font-black text-lg">كيف كانت تجربتك؟</h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform active:scale-75"><Star className={cn("h-8 w-8", rating >= s ? "fill-amber-400 text-amber-400" : "text-white/30")} /></button>
                  ))}
                </div>
                {rating > 0 && <Button onClick={() => { setIsRatingSubmitted(true); toast({ title: "تم التقييم" }) }} className="w-full bg-white text-primary font-black rounded-xl h-12">تأكيد التقييم</Button>}
              </Card>
            ) : (
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center justify-center gap-2 text-green-700 font-black text-xs"><CheckCircle2 className="h-4 w-4" /> شكراً لتقييمك الرائع!</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleReorder} className="h-14 rounded-2xl bg-primary text-white font-black text-xs gap-2"><RefreshCw className="h-4 w-4" /> إعادة الطلب</Button>
              <Button onClick={() => setIsTipOpen(true)} variant="outline" className="h-14 rounded-2xl border-amber-200 text-amber-600 bg-amber-50 font-black text-xs gap-2"><Heart className="h-4 w-4 fill-amber-600" /> بخشيش للمندوب</Button>
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <Button onClick={handleReorder} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm gap-2">
            <RefreshCw className="h-5 w-5" /> إعادة المحاولة (إضافة للسلة)
          </Button>
        )}

        {/* Simulator Controls for Testing */}
        {id.startsWith('mock-') && (
          <div className="mt-10 p-6 bg-slate-900 rounded-[25px] border-2 border-dashed border-primary/30 text-white space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Bug className="h-5 w-5" />
              <h3 className="font-black text-sm">أدوات المطور: محاكاة حالة الطلب</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map(s => (
                <Button 
                  key={s} 
                  variant={order.status === s ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSimulatedStatus(s)}
                  className={cn("h-10 text-[10px] font-bold rounded-xl", order.status === s ? "bg-primary border-none" : "text-white border-white/20")}
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-medium italic text-center">هذه اللوحة تظهر فقط للطلبات التجريبية لتسهيل معاينة التصميم</p>
          </div>
        )}
      </div>

      <Dialog open={isTipOpen} onOpenChange={setIsTipOpen}>
        <DialogContent className="rounded-[25px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-gray-900 p-8 text-white text-center space-y-2">
            <Heart className="h-10 w-10 text-rose-500 mx-auto mb-2 fill-rose-500" />
            <DialogTitle className="text-xl font-black">دعم المندوب</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs font-medium">ساهم بمبلغ بسيط تقديراً لمجهود المندوب</DialogDescription>
          </div>
          <div className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 2000].map(v => <Button key={v} variant="outline" onClick={() => setTipAmount(v.toString())} className={cn("h-12 rounded-xl font-black text-xs", tipAmount === v.toString() ? "bg-primary text-white border-primary" : "bg-gray-50 border-transparent")}>{v} ر.س</Button>)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setTipMethod('wallet')} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center gap-2", tipMethod === 'wallet' ? "bg-primary/5 border-primary text-primary" : "border-transparent bg-gray-50 text-gray-400")}>
                <Wallet className="h-5 w-5" /><span className="text-[10px] font-black">المحفظة</span>
              </button>
              <button onClick={() => setTipMethod('bank')} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center gap-2", tipMethod === 'bank' ? "bg-primary/5 border-primary text-primary" : "border-transparent bg-gray-50 text-gray-400")}>
                <Landmark className="h-5 w-5" /><span className="text-[10px] font-black">تحويل بنكي</span>
              </button>
            </div>
            {tipMethod === 'bank' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {BANK_ACCOUNTS.map(b => (
                  <div key={b.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3"><img src={b.logo} className="h-8 w-8 rounded-lg" alt={b.name} /><span className="text-[10px] font-bold text-gray-700">{b.name}</span></div>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(b.account); toast({ title: "تم النسخ" }) }} className="h-8 w-8 p-0 text-primary"><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleTipSubmit} disabled={!tipAmount} className="w-full h-14 rounded-2xl bg-primary text-white font-black text-base shadow-xl">تأكيد الإرسال</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
