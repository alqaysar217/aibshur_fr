
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Gift, History, Star, TrendingUp, HelpCircle, CheckCircle2, Copy, Zap, Info, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function LoyaltyPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const points = userData?.loyaltyPoints || 0
  const redeemThreshold = 500
  const progress = Math.min((points / redeemThreshold) * 100, 100)

  const handleRedeem = () => {
    if (points < redeemThreshold) {
      toast({
        title: "رصيد غير كافٍ",
        description: `تحتاج إلى ${redeemThreshold - points} نقطة إضافية للاستبدال`,
        variant: "destructive"
      })
      return
    }
    setCouponCode(`ABSHER-${Math.floor(1000 + Math.random() * 9000)}`)
    setIsRedeemOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">نقاط أبشر</h1>
      </header>

      <div className="p-5 space-y-8">
        {/* بطاقة النقاط الفاخرة */}
        <div className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 text-white shadow-2xl shadow-orange-200">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl animate-pulse" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30 rotate-3">
              <Star className="h-10 w-10 text-white fill-white animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-90">إجمالي نقاطك</p>
              <h2 className="text-6xl font-black tabular-nums leading-none tracking-tight">{points}</h2>
              <p className="text-xs font-bold opacity-80">نقطة تم جمعها</p>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between text-[10px] font-black px-1">
                <span className="bg-white/20 px-2 py-0.5 rounded-full">المستوى الحالي</span>
                <span className="tabular-nums">{Math.floor(progress)}% اكتمل</span>
              </div>
              <div className="h-3 w-full bg-black/10 rounded-full p-0.5">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[9px] font-bold opacity-70 italic">اجمع {redeemThreshold} نقطة للحصول على كوبون خصم 500 ريال</p>
            </div>

            <Button 
              onClick={handleRedeem}
              className="w-full h-14 bg-white text-orange-600 hover:bg-white/95 rounded-[15px] font-black text-lg shadow-xl active:scale-[0.98] transition-all border-b-4 border-black/10"
            >
              استبدال النقاط الآن
            </Button>
          </div>
        </div>

        {/* كيف تعمل النقاط */}
        <section className="space-y-4">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-amber-500" /> طريقك للمكافآت
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none bg-white p-5 rounded-[20px] shadow-sm space-y-3 border-b-4 border-primary/10">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[11px] font-black text-gray-700 leading-relaxed">احصل على 10 نقاط لكل 1000 ريال تنفقها</p>
            </Card>
            <Card className="border-none bg-white p-5 rounded-[20px] shadow-sm space-y-3 border-b-4 border-amber-100">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Gift className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-[11px] font-black text-gray-700 leading-relaxed">هدايا مجانية ومفاجآت في المناسبات</p>
            </Card>
          </div>
        </section>

        {/* سجل النشاط */}
        <section className="space-y-4 pb-10">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 px-1">
            <History className="h-4 w-4 text-primary" /> سجل النقاط الأخير
          </h3>
          <div className="space-y-3">
            {[
              { id: "1", type: "earned", title: "نقاط مقابل طلب #9921", val: "+45", date: "منذ ساعتين" },
              { id: "2", type: "earned", title: "هدية ترحيبية بالانضمام", val: "+100", date: "أمس" },
              { id: "3", type: "redeemed", title: "استبدال كوبون خصم", val: "-500", date: "الأسبوع الماضي" }
            ].map((tx) => (
              <div key={tx.id} className="p-4 bg-white rounded-[15px] shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl", tx.type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600')}>
                    <TrendingUp className={cn("h-5 w-5", tx.type === 'redeemed' && "rotate-180")} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{tx.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{tx.date}</p>
                  </div>
                </div>
                <span className={cn("font-black text-lg tabular-nums", tx.type === 'earned' ? 'text-green-600' : 'text-rose-600')}>
                  {tx.val}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="rounded-[25px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-primary p-8 text-center text-white space-y-4">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black">مبارك لك!</DialogTitle>
            <DialogDescription className="text-white/80 font-bold">
              تم تحويل نقاطك إلى قسيمة خصم بقيمة 500 ريال
            </DialogDescription>
          </div>
          <div className="p-8 bg-white space-y-6">
            <div className="p-6 border-2 border-dashed border-primary/30 rounded-[20px] bg-secondary/10 text-center space-y-3 relative">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">كود الخصم الحصري</p>
              <h3 className="text-3xl font-black text-primary tracking-widest">{couponCode}</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                navigator.clipboard.writeText(couponCode || "");
                toast({ title: "تم النسخ" });
              }} className="text-primary font-bold gap-2 hover:bg-primary/5">
                <Copy className="h-4 w-4" /> نسخ الكود
              </Button>
            </div>
            <p className="text-[11px] text-center text-gray-500 font-bold leading-relaxed px-4">
              استخدم هذا الكود في صفحة الدفع قبل تأكيد الطلب القادم. القسيمة صالحة لمدة 30 يوماً.
            </p>
            <Button onClick={() => setIsRedeemOpen(false)} className="w-full h-14 rounded-[15px] bg-primary font-black text-lg shadow-lg">
              حسناً، فهمت
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
