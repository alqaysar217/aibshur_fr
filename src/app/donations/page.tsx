
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Heart, Gift, Users, HandHeart, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

const CHARITIES = [
  { 
    id: "water", 
    name: "سقيا ماء", 
    description: "توفير مياه شرب نظيفة للمناطق المحتاجة", 
    icon: <Users className="h-6 w-6 text-blue-600" />, 
    color: "bg-blue-50" 
  },
  { 
    id: "food", 
    name: "إطعام مسكين", 
    description: "توزيع وجبات غذائية يومية للأسر المتعففة", 
    icon: <Heart className="h-6 w-6 text-rose-600" />, 
    color: "bg-rose-50" 
  },
  { 
    id: "orphan", 
    name: "كفالة يتيم", 
    description: "رعاية كاملة للأيتام في المحافظات اليمنية", 
    icon: <Gift className="h-6 w-6 text-amber-600" />, 
    color: "bg-amber-50" 
  }
]

export default function DonationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDonate = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!selectedCharity || !amount) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار الجمعية وتحديد المبلغ", variant: "destructive" })
      return
    }

    setLoading(true)
    const charity = CHARITIES.find(c => c.id === selectedCharity)
    const donationData = {
      userId: user.uid,
      amount: Number(amount),
      currency: "ر.س",
      charityName: charity?.name || "جمعية خيرية",
      status: "completed",
      createdAt: serverTimestamp(),
      transactionId: `don_${Date.now()}`
    }

    const donationsRef = collection(db, "users", user.uid, "donations")

    try {
      await addDoc(donationsRef, donationData)
      toast({
        title: "بارك الله فيك",
        description: "تم استلام تبرعك بنجاح، جعله الله في ميزان حسناتك",
      })
      setTimeout(() => router.push('/profile'), 1500)
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: donationsRef.path,
        operation: 'create',
        requestResourceData: donationData,
      })
      errorEmitter.emit('permission-error', permissionError)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-20 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">بوابة التبرعات</h1>
      </header>

      <div className="p-5 space-y-8">
        {/* هيرو التبرعات */}
        <div className="text-center space-y-3 pt-4">
          <div className="bg-primary/10 w-24 h-24 rounded-[30px] flex items-center justify-center mx-auto mb-4 shadow-inner border-4 border-white relative overflow-hidden">
            <HandHeart className="h-12 w-12 text-primary z-10" />
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-primary">ساهم في الخير</h2>
          <p className="text-muted-foreground text-sm font-bold max-w-[280px] mx-auto leading-relaxed">
            اجعل لطلبك أثراً طيباً، فـ "صنائع المعروف تقي مصارع السوء"
          </p>
        </div>

        {/* قائمة الجمعيات */}
        <div className="space-y-4">
          <h3 className="font-black text-sm text-primary flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4" /> اختر جهة التبرع
          </h3>
          <div className="grid gap-4">
            {CHARITIES.map((charity) => (
              <button
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={cn(
                  "w-full p-4 flex items-center gap-4 bg-white rounded-[10px] border transition-all active:scale-[0.98] shadow-sm relative overflow-hidden",
                  selectedCharity === charity.id ? 'border-primary ring-4 ring-primary/5 bg-primary/5' : 'border-gray-50'
                )}
              >
                <div className={cn("h-14 w-14 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm", charity.color)}>
                  {charity.icon}
                </div>
                <div className="text-right flex-1">
                  <p className="font-black text-[15px] text-gray-800">{charity.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{charity.description}</p>
                </div>
                {selectedCharity === charity.id && (
                  <div className="absolute top-2 left-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* مبلغ التبرع */}
        <div className="space-y-4">
          <h3 className="font-black text-sm text-primary px-1">مبلغ التبرع</h3>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="أدخل المبلغ الذي تجود به نفسك..." 
              className="h-16 rounded-[10px] border-none shadow-sm text-xl font-black pr-14 text-right bg-white focus-visible:ring-primary/20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-primary text-lg">ر.س</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((val) => (
              <Button 
                key={val} 
                variant="outline" 
                className={cn(
                  "h-12 rounded-[10px] font-black text-sm transition-all shadow-sm border-gray-100",
                  amount === val.toString() ? 'bg-primary text-white border-primary shadow-primary/20 scale-105' : 'bg-white hover:bg-primary/5'
                )}
                onClick={() => setAmount(val.toString())}
              >
                {val} ر.س
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleDonate}
            disabled={loading || !selectedCharity || !amount}
            className="w-full h-16 rounded-[10px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>جاري معالجة التبرع...</span>
              </div>
            ) : (
              "تأكيد التبرع الآن"
            )}
          </Button>
          <p className="text-[10px] text-center text-gray-400 mt-4 font-bold leading-relaxed">
            يتم تحويل مبالغ التبرعات مباشرة إلى حسابات الجمعيات المعتمدة لضمان وصولها لمستحقيها.
          </p>
        </div>
      </div>
    </div>
  )
}
