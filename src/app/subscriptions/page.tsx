"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Crown, Check, Zap, MessageCircle, Landmark, ShieldCheck, Sparkles, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    id: "silver",
    name: "الباقة الفضية",
    monthlyPrice: 49,
    yearlyPrice: 450,
    features: ["توصيل مجاني لـ 5 طلبات", "خصم 5% على المتاجر", "دعم فني سريع"],
    color: "from-slate-400 to-slate-600",
    icon: <ShieldCheck className="h-8 w-8 text-white" />
  },
  {
    id: "gold",
    name: "الباقة الذهبية",
    monthlyPrice: 99,
    yearlyPrice: 890,
    features: ["توصيل مجاني غير محدود", "خصم 10% على كافة المتاجر", "دعم VIP مباشر", "نقاط مضاعفة x2"],
    color: "from-amber-400 to-orange-600",
    icon: <Crown className="h-8 w-8 text-white" />,
    popular: true
  }
]

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" }
]

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePlanSelection = (plan: any) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedPlan({
      ...plan,
      activePrice: billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
      period: billingCycle === "monthly" ? "شهر" : "سنة"
    })
    setIsPaymentOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-body" dir="rtl">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="text-lg font-black text-gray-900">عضوية VIP</h1>
      </header>

      <div className="p-6 space-y-10">
        <div className="text-center space-y-3 pt-4">
          <div className="h-16 w-16 bg-primary/5 rounded-[20px] flex items-center justify-center mx-auto mb-2">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">اختر مزاياك المفضلة</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">وفر الكثير واستمتع بتجربة تسوق لا محدودة مع عضوية VIP</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-secondary/30 p-1.5 rounded-full flex items-center gap-1 w-full max-w-[280px]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "flex-1 h-11 rounded-full text-xs font-black transition-all duration-300",
                billingCycle === "monthly" ? "bg-white text-primary shadow-sm" : "text-gray-500"
              )}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "flex-1 h-11 rounded-full text-xs font-black transition-all duration-300 relative",
                billingCycle === "yearly" ? "bg-white text-primary shadow-sm" : "text-gray-500"
              )}
            >
              سنوي
              {billingCycle === "monthly" && (
                <span className="absolute -top-3 -left-2 bg-amber-400 text-white text-[8px] px-2 py-0.5 rounded-full shadow-sm animate-bounce">وفر أكثر</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative rounded-[25px] overflow-hidden bg-white shadow-xl border border-gray-100 active:scale-[0.98] transition-all">
              <div className={cn("h-32 bg-gradient-to-br p-6 flex items-center justify-between", plan.color)}>
                <div className="text-white space-y-1">
                  <h3 className="font-black text-xl">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 animate-in fade-in duration-500" key={billingCycle}>
                    <span className="text-3xl font-black">
                      {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-[10px] font-bold opacity-80">
                      ريال / {billingCycle === "monthly" ? "شهر" : "سنة"}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {plan.icon}
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[12px] text-gray-600 font-bold">
                      <div className="h-5 w-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => handlePlanSelection(plan)} 
                  className={cn(
                    "w-full h-14 rounded-[12px] font-black text-base text-white shadow-lg", 
                    plan.id === 'gold' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-700 hover:bg-slate-800'
                  )}
                >
                  تفعيل العضوية
                </Button>
              </CardContent>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="rounded-[20px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-gray-900 p-8 text-white text-center space-y-2">
            <Landmark className="h-10 w-10 text-primary mx-auto mb-2" />
            <DialogTitle className="text-xl font-black">إكمال الدفع</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs font-medium">
              حول {selectedPlan?.activePrice} ريال لأحد حساباتنا لتفعيل {selectedPlan?.name} لـ {selectedPlan?.period}
            </DialogDescription>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
            {BANK_ACCOUNTS.map((bank) => (
              <div key={bank.id} className="p-4 bg-gray-50 rounded-[15px] border border-gray-100 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900">{bank.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-dashed border-gray-200">
                  <span className="font-black text-sm tracking-widest text-primary">{bank.account}</span>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(bank.account); toast({ title: "تم النسخ" }); }} className="text-primary">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={() => window.open("https://wa.me/967700000000")} className="w-full h-14 bg-[#25D366] text-white font-black text-lg gap-2 rounded-[12px] shadow-xl mt-4">
              <MessageCircle className="h-6 w-6" /> إرسال السند (واتساب)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
