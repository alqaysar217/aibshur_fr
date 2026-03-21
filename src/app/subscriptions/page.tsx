"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Crown, Check, Zap, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const PLANS = [
  {
    id: "silver",
    name: "الباقة الفضية",
    price: 49,
    duration: "شهر",
    features: ["توصيل مجاني لـ 5 طلبات", "خصم 5% على المطاعم المختارة", "دعم فني ذو أولوية"],
    color: "bg-slate-100",
    textColor: "text-slate-600",
    icon: <ShieldCheck className="h-8 w-8 text-slate-500" />
  },
  {
    id: "gold",
    name: "الباقة الذهبية (الأكثر طلباً)",
    price: 99,
    duration: "شهر",
    features: ["توصيل مجاني غير محدود", "خصم 10% على كافة المتاجر", "دعم فني VIP", "نقاط ولاء مضاعفة"],
    color: "bg-accent/10",
    textColor: "text-accent-foreground",
    icon: <Crown className="h-8 w-8 text-accent" />,
    popular: true
  }
]

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(plan.id)
    const subId = `sub_${Date.now()}`
    const subData = {
      id: subId,
      userId: user.uid,
      planName: plan.name,
      price: plan.price,
      currency: "ر.س",
      startDate: serverTimestamp(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // بعد 30 يوم
      status: "active",
      paymentTransactionId: `tx_${Date.now()}`,
      benefits: plan.features,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const subRef = doc(db, "users", user.uid, "subscriptions", subId)
    const userUpdateRef = doc(db, "users", user.uid)

    try {
      // تحديث حالة الاشتراك في وثيقة المستخدم أيضاً
      await setDoc(subRef, subData)
      await setDoc(userUpdateRef, { subscriptionId: subId }, { merge: true })
      
      toast({
        title: "تم الاشتراك بنجاح!",
        description: `أنت الآن عضو في ${plan.name}`,
      })
      router.push('/profile')
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: subRef.path,
        operation: 'create',
        requestResourceData: subData,
      })
      errorEmitter.emit('permission-error', permissionError)
    } finally {
      setLoading(null)
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">عضوية أبشر VIP</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-accent/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl animate-pulse">
            <Zap className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-2xl font-black text-primary">وفر أكثر مع VIP</h2>
          <p className="text-muted-foreground text-sm">استمتع بالتوصيل المجاني وخصومات حصرية يومياً</p>
        </div>

        <div className="space-y-6">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={`border-none rounded-[2.5rem] shadow-xl overflow-hidden relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-black px-4 py-1 rounded-bl-2xl">
                  الأكثر طلباً
                </div>
              )}
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-primary">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">ر.س / {plan.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full h-14 rounded-2xl font-black text-lg shadow-lg ${plan.popular ? 'bg-accent text-accent-foreground shadow-accent/20' : 'bg-primary shadow-primary/20'}`}
                >
                  {loading === plan.id ? "جاري الاشتراك..." : "اشترك الآن"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-[10px] text-center text-muted-foreground px-6 leading-relaxed">
          * يتم تجديد الاشتراك تلقائياً كل شهر. يمكنك إلغاء الاشتراك في أي وقت من إعدادات الحساب.
        </p>
      </div>
    </div>
  )
}
