
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Star, History, Gift, Zap, Copy, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
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

  const userRef = useMemoFirebase(() => (!db || !user) ? null : doc(db, "users", user.uid), [db, user])
  const { data: userData } = useDoc(userRef)

  const points = userData?.loyaltyPoints || 0
  const threshold = 500
  const progress = Math.min((points / threshold) * 100, 100)

  const handleRedeem = () => {
    if (points < threshold) {
      toast({ title: "رصيد غير كافٍ", description: `تحتاج إلى ${threshold - points} نقطة إضافية`, variant: "destructive" })
      return
    }
    setCouponCode(`ABSHER-${Math.floor(1000 + Math.random() * 9000)}`)
    setIsRedeemOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-body" dir="rtl">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="text-lg font-black text-gray-900">نقاط أبشر</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Luxury Points Card */}
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-400 to-orange-600 p-8 text-white shadow-2xl">
          <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">رصيد النقاط</p>
              <h2 className="text-6xl font-black tabular-nums leading-none tracking-tight">{points}</h2>
            </div>

            <div className="w-full space-y-3">
              <div className="flex justify-between text-[10px] font-black px-1 uppercase opacity-80">
                <span>المستوى التالي</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[9px] font-bold opacity-70 italic">اجمع {threshold} نقطة للحصول على مكافأة فورية</p>
            </div>

            <Button onClick={handleRedeem} className="w-full h-14 bg-white text-orange-600 hover:bg-gray-50 rounded-[12px] font-black text-lg shadow-xl active:scale-[0.98] transition-all">
              استبدال النقاط
            </Button>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-[15px] border border-gray-100 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-gray-600 leading-relaxed">احصل على 10 نقاط لكل 1000 ريال</p>
          </div>
          <div className="p-5 bg-white rounded-[15px] border border-gray-100 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Gift className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-gray-600 leading-relaxed">هدايا حصرية وعروض VIP</p>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> السجل الأخير
          </h3>
          <div className="space-y-3">
            {[
              { id: "1", title: "نقاط مقابل طلب #9921", val: "+45", date: "منذ ساعتين" },
              { id: "2", title: "هدية الانضمام", val: "+100", date: "أمس" }
            ].map((tx) => (
              <div key={tx.id} className="p-4 bg-white rounded-[15px] border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{tx.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                  </div>
                </div>
                <span className="font-black text-lg text-green-600 tabular-nums">{tx.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="rounded-[20px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-primary p-8 text-center text-white space-y-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black">مبارك لك!</DialogTitle>
            <DialogDescription className="text-white/80 font-medium">تم استبدال نقاطك بنجاح</DialogDescription>
          </div>
          <div className="p-8 bg-white space-y-6">
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-[15px] bg-gray-50 text-center space-y-3">
              <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">كود الخصم</p>
              <h3 className="text-3xl font-black text-primary tracking-widest">{couponCode}</h3>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(couponCode || ""); toast({ title: "تم النسخ" }); }} className="text-primary font-bold gap-2">
                <Copy className="h-4 w-4" /> نسخ الكود
              </Button>
            </div>
            <Button onClick={() => setIsRedeemOpen(false)} className="w-full h-14 rounded-[12px] bg-primary font-black text-lg">حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
