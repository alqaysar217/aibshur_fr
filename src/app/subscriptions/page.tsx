
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Crown, Check, Zap, ShieldCheck, Copy, MessageCircle, Info, Landmark, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" },
  { id: "tadhamon", name: "بنك التضامن", holder: "عمر احمد مبارك دعكيك", account: "112233445", logo: "https://picsum.photos/seed/tadhamon/100" }
]

const PLANS = [
  {
    id: "silver",
    name: "عضوية أبشر سيلفر",
    price: 49,
    duration: "شهر",
    features: ["توصيل مجاني لـ 5 طلبات", "خصم 5% على المتاجر المختارة", "دعم فني ذو أولوية"],
    color: "from-slate-400 to-slate-600",
    icon: <ShieldCheck className="h-8 w-8 text-white" />,
    btnClass: "bg-slate-600 hover:bg-slate-700 shadow-slate-200"
  },
  {
    id: "gold",
    name: "عضوية أبشر جولد",
    price: 99,
    duration: "شهر",
    features: ["توصيل مجاني غير محدود", "خصم 10% على كافة المتاجر", "دعم فني VIP مباشر", "نقاط ولاء مضاعفة x2"],
    color: "from-amber-400 to-orange-600",
    icon: <Crown className="h-10 w-10 text-white" />,
    popular: true,
    btnClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
  }
]

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePlanSelection = (plan: typeof PLANS[0]) => {
    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول أولاً" })
      router.push('/login')
      return
    }
    setSelectedPlan(plan)
    setIsPaymentOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">اشتراك VIP</h1>
      </header>

      <div className="p-5 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-20 w-20 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto mb-2 relative shadow-inner border-4 border-white">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
            <Sparkles className="h-5 w-5 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">عالم من المزايا</h2>
          <p className="text-gray-500 text-sm font-bold max-w-[280px] mx-auto leading-relaxed">
            اشترك الآن ووفر أكثر من 5000 ريال شهرياً من رسوم التوصيل والخصومات
          </p>
        </div>

        <div className="space-y-8">
          {PLANS.map((plan) => (
            <div key={plan.id} className={cn(
              "relative rounded-[30px] overflow-hidden bg-white shadow-2xl transition-all active:scale-[0.98]",
              plan.popular ? "ring-4 ring-amber-400/30" : ""
            )}>
              <div className={cn("h-32 bg-gradient-to-br p-8 flex items-center justify-between", plan.color)}>
                <div className="space-y-1">
                  <h3 className="font-black text-2xl text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 text-white/90">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-xs font-bold">ر.س / {plan.duration}</span>
                  </div>
                </div>
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                  {plan.icon}
                </div>
              </div>

              {plan.popular && (
                <div className="absolute top-4 right-4 bg-white/20 text-white text-[9px] font-black px-3 py-1 rounded-full backdrop-blur-md border border-white/30 uppercase tracking-widest">
                  الأكثر طلباً
                </div>
              )}

              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 text-[13px] text-gray-700 font-bold group">
                      <div className="h-6 w-6 bg-green-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handlePlanSelection(plan)}
                  className={cn("w-full h-15 rounded-[20px] font-black text-lg text-white transition-all shadow-xl border-b-4 border-black/10", plan.btnClass)}
                >
                  تفعيل الاشتراك
                </Button>
              </CardContent>
            </div>
          ))}
        </div>

        <div className="p-5 bg-primary/5 rounded-[20px] border border-primary/10 flex items-start gap-4">
          <Info className="h-6 w-6 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-primary">معلومات التجديد</p>
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
              جميع الاشتراكات يدوية؛ لن يتم خصم أي مبالغ من رصيدك تلقائياً. تنتهي العضوية بنهاية الفترة المحددة مالم تقم بالتجديد.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="rounded-[30px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-primary p-8 text-white text-center space-y-2">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Landmark className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-black">إتمام الدفع للباقة</DialogTitle>
            <DialogDescription className="text-white/80 text-xs font-bold leading-relaxed">
              يرجى تحويل {selectedPlan?.price} ريال إلى أحد حساباتنا
            </DialogDescription>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
            {BANK_ACCOUNTS.map((bank) => (
              <div key={bank.id} className="p-4 rounded-[20px] border border-gray-100 bg-secondary/10 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-black text-primary">{bank.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-dashed border-primary/30">
                  <span className="font-black text-lg text-primary tabular-nums">{bank.account}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(bank.account);
                    toast({ title: "تم النسخ" });
                  }} className="h-10 w-10 p-0 text-primary">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-4">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-[20px] text-[11px] font-bold border border-amber-100 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p>بمجرد إرسال السند، سنقوم بتفعيل باقة {selectedPlan?.name} فوراً.</p>
              </div>
              <Button 
                onClick={() => {
                  const text = `مرحباً أبشر، أريد تفعيل ${selectedPlan?.name}. قمت بالتحويل وسأرفق السند الآن.`;
                  window.open(`https://wa.me/967700000000?text=${encodeURIComponent(text)}`, "_blank");
                }} 
                className="w-full h-16 rounded-[20px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3 shadow-xl"
              >
                <MessageCircle className="h-7 w-7" /> إرسال السند عبر واتساب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
