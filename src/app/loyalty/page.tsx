
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Gift, History, Star, TrendingUp, HelpCircle, CheckCircle2, Copy, Zap, Info } from "lucide-react"
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

  const loyaltyTransactionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "loyaltyPointTransactions"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: transactions, isLoading } = useCollection(loyaltyTransactionsQuery)

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

  const copyCoupon = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode)
      toast({ title: "تم النسخ", description: "كوبون الخصم جاهز للاستخدام" })
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-20 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">نقاط أبشر</h1>
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* بطاقة النقاط الفاخرة */}
        <Card className="border-none bg-gradient-to-br from-amber-400 via-orange-500 to-primary text-white rounded-[10px] shadow-2xl shadow-orange-200 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CardContent className="p-8 text-center space-y-6 relative z-10">
            <div className="bg-white/30 w-16 h-16 rounded-[10px] flex items-center justify-center mx-auto shadow-inner backdrop-blur-md">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-90">رصيدك من النقاط</p>
              <h2 className="text-6xl font-black tabular-nums leading-none">{points}</h2>
              <p className="text-xs font-bold opacity-80">نقطة ولاء</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black px-1">
                <span>الهدف: {redeemThreshold} نقطة</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-black/10 rounded-full" />
              <p className="text-[10px] opacity-70 italic">عند وصولك لـ {redeemThreshold} نقطة، يمكنك الحصول على خصم فوري!</p>
            </div>

            <Button 
              onClick={handleRedeem}
              className="w-full h-14 bg-white text-orange-600 hover:bg-white/95 rounded-[10px] font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
            >
              استبدال النقاط بمكافأة
            </Button>
          </CardContent>
        </Card>

        {/* كيف تكتسب النقاط؟ */}
        <section className="space-y-3">
          <h3 className="font-black text-sm text-primary flex items-center gap-2 px-1">
            <HelpCircle className="h-4 w-4" /> كيف تكتسب النقاط؟
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none bg-white p-4 rounded-[10px] shadow-sm">
              <Zap className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-[11px] font-black text-gray-800 leading-tight">10 نقاط لكل 1000 ريال تنفقها في التطبيق</p>
            </Card>
            <Card className="border-none bg-white p-4 rounded-[10px] shadow-sm">
              <Gift className="h-5 w-5 text-primary mb-2" />
              <p className="text-[11px] font-black text-gray-800 leading-tight">مكافآت مجانية عند إتمام 10 طلبات شهرياً</p>
            </Card>
          </div>
        </section>

        {/* سجل النقاط */}
        <section className="space-y-4">
          <h3 className="font-black text-sm text-primary flex items-center gap-2 px-1">
            <History className="h-4 w-4" /> سجل العمليات الأخيرة
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-[10px] animate-pulse" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[10px] bg-white active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-[10px]",
                        tx.type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'earned' ? <TrendingUp className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), "PPP", { locale: ar }) : "اليوم"}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-black text-lg",
                      tx.type === 'earned' ? 'text-green-600' : 'text-rose-600'
                    )}>
                      {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              // عمليات افتراضية في حالة عدم وجود بيانات حقيقية
              [
                { id: "1", type: "earned", description: "نقاط مقابل طلب #9921", pointsAmount: 45, date: "منذ ساعتين" },
                { id: "2", type: "earned", description: "هدية ترحيبية بالانضمام", pointsAmount: 100, date: "أمس" },
                { id: "3", type: "redeemed", description: "استبدال كوبون خصم 500 ريال", pointsAmount: -500, date: "الأسبوع الماضي" }
              ].map((tx) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[10px] bg-white active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-[10px]",
                        tx.type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'earned' ? <TrendingUp className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{tx.date}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-black text-lg",
                      tx.type === 'earned' ? 'text-green-600' : 'text-rose-600'
                    )}>
                      {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* معلومة إضافية */}
        <div className="p-4 bg-primary/5 rounded-[10px] flex items-start gap-3 border border-primary/10">
          <Info className="h-5 w-5 text-primary shrink-0" />
          <p className="text-[10px] text-gray-600 font-bold leading-relaxed">
            يتم احتساب النقاط تلقائياً بعد كل عملية توصيل ناجحة. لا يمكن استبدال النقاط نقداً، بل يتم استبدالها بكوبونات خصم ترويجية داخل التطبيق.
          </p>
        </div>
      </div>

      {/* نافذة الاستبدال */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="rounded-[10px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-primary p-6 text-center space-y-2 text-white">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black">تهانينا!</DialogTitle>
            <DialogDescription className="text-white/80 font-bold">
              لقد حصلت على كوبون خصم بقيمة 500 ريال يمني
            </DialogDescription>
          </div>
          <div className="p-6 bg-white space-y-6">
            <div className="p-5 border-2 border-dashed border-primary/30 rounded-[10px] bg-secondary/10 text-center space-y-3">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">رمز الكوبون</p>
              <h3 className="text-3xl font-black text-primary tracking-widest">{couponCode}</h3>
              <Button variant="ghost" size="sm" onClick={copyCoupon} className="text-primary font-bold gap-2 hover:bg-primary/5">
                <Copy className="h-4 w-4" /> نسخ الكوبون
              </Button>
            </div>
            <p className="text-[11px] text-center text-gray-400 font-bold">
              استخدم هذا الرمز في صفحة الدفع للحصول على الخصم. هذا الكوبون صالح لمرة واحدة فقط.
            </p>
            <Button onClick={() => setIsRedeemOpen(false)} className="w-full h-14 rounded-[10px] bg-primary font-black text-lg">
              تم، شكراً!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
