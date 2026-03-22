
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Crown, Check, Zap, ShieldCheck, Copy, MessageCircle, Info, Landmark, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
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
    name: "الباقة الفضية",
    price: 49,
    duration: "شهر",
    features: ["توصيل مجاني لـ 5 طلبات", "خصم 5% على المتاجر المختارة", "دعم فني ذو أولوية"],
    color: "bg-slate-50",
    iconColor: "bg-slate-200 text-slate-600",
    icon: <ShieldCheck className="h-8 w-8" />,
    btnClass: "bg-slate-600 hover:bg-slate-700"
  },
  {
    id: "gold",
    name: "الباقة الذهبية",
    price: 99,
    duration: "شهر",
    features: ["توصيل مجاني غير محدود", "خصم 10% على كافة المتاجر", "دعم فني VIP", "نقاط ولاء مضاعفة"],
    color: "bg-amber-50",
    iconColor: "bg-amber-100 text-amber-600",
    icon: <Crown className="h-8 w-8" />,
    popular: true,
    btnClass: "bg-amber-600 hover:bg-amber-700"
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "تم النسخ", description: "رقم الحساب جاهز للصق" })
  }

  const openWhatsApp = () => {
    const text = `مرحباً أبشر، أريد تفعيل ${selectedPlan?.name}. قمت بالتحويل وسأرفق السند.`
    window.open(`https://wa.me/967700000000?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handlePlanSelection = (plan: typeof PLANS[0]) => {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedPlan(plan)
    setIsPaymentOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="pb-20 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">عضوية أبشر VIP</h1>
        </div>
      </header>

      <div className="p-5 space-y-8">
        <div className="text-center space-y-3 pt-4">
          <div className="bg-primary/10 w-24 h-24 rounded-[30px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white">
            <Zap className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-primary">وفر أكثر مع VIP</h2>
          <p className="text-muted-foreground text-sm font-bold max-w-[280px] mx-auto leading-relaxed">
            استمتع بالتوصيل المجاني وخصومات حصرية تجعل تجربة تسوقك أوفر وأمتع
          </p>
        </div>

        <div className="space-y-6">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={cn(
              "border-none rounded-[10px] shadow-xl overflow-hidden relative transition-all active:scale-[0.98]",
              plan.popular ? "ring-2 ring-amber-400 bg-white" : "bg-white"
            )}>
              {plan.popular && (
                <div className="absolute top-0 left-0 bg-amber-400 text-amber-900 text-[10px] font-black px-5 py-1.5 rounded-br-[10px] shadow-sm">
                  الأكثر طلباً
                </div>
              )}
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-5">
                  <div className={cn("p-4 rounded-[10px] shadow-sm", plan.iconColor)}>
                    {plan.icon}
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-xl text-gray-800">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-primary">{plan.price}</span>
                      <span className="text-xs text-muted-foreground font-bold">ر.س / {plan.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-50 pt-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[13px] text-gray-700">
                      <div className="bg-green-100 p-1 rounded-full shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-bold">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handlePlanSelection(plan)}
                  className={cn("w-full h-15 rounded-[10px] font-black text-lg shadow-xl text-white", plan.btnClass)}
                >
                  اشترك الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-5 bg-white rounded-[10px] border border-gray-100 flex items-start gap-4 shadow-sm">
          <Info className="h-6 w-6 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-800">ملاحظات هامة</p>
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
              يتم تفعيل العضوية يدوياً بعد تأكيد الحوالة. الباقات لا تجدد تلقائياً لضمان عدم الخصم من رصيدك دون علمك.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="rounded-[10px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <DialogHeader className="p-6 bg-primary text-white text-right">
            <DialogTitle className="text-2xl font-black">إتمام الاشتراك</DialogTitle>
            <DialogDescription className="text-white/80 text-sm font-bold mt-2">
              يرجى الإيداع في أحد الحسابات التالية لتفعيل {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 bg-white">
            <div className="space-y-4">
              {BANK_ACCOUNTS.map((bank) => (
                <div key={bank.id} className="p-4 rounded-[10px] border border-gray-100 bg-secondary/5 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-[10px] overflow-hidden border shadow-sm shrink-0 bg-white">
                      <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-black text-primary">{bank.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-[10px] border border-dashed border-primary/30">
                    <span className="font-black text-lg tracking-wider text-primary">{bank.account}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bank.account)} className="h-10 w-10 p-0 text-primary hover:bg-primary/5">
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-4">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-[10px] text-[11px] font-bold border border-amber-100 flex items-center gap-3">
                <Info className="h-5 w-5 shrink-0" />
                بمجرد إرسال السند، سيقوم فريقنا بمراجعة العملية وتفعيل عضويتك فوراً.
              </div>
              <Button 
                onClick={openWhatsApp} 
                className="w-full h-16 rounded-[10px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3 shadow-xl shadow-green-100"
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
