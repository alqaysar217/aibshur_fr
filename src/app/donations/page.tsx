"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Heart, Gift, Users, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const CHARITIES = [
  { id: "water", name: "سقيا ماء", description: "توفير مياه شرب نظيفة للمناطق المحتاجة", icon: <Users className="h-6 w-6 text-blue-500" />, color: "bg-blue-50" },
  { id: "food", name: "إطعام مسكين", description: "توزيع وجبات غذائية يومية للأسر المتعففة", icon: <Heart className="h-6 w-6 text-red-500" />, color: "bg-red-50" },
  { id: "orphan", name: "كفالة يتيم", description: "رعاية كاملة للأيتام في المحافظات اليمنية", icon: <Gift className="h-6 w-6 text-orange-500" />, color: "bg-orange-50" }
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
      toast({ title: "خطأ", description: "يرجى اختيار الجمعية وتحديد المبلغ", variant: "destructive" })
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
        title: "شكراً لك!",
        description: "تم استلام تبرعك بنجاح، في ميزان حسناتك",
      })
      router.push('/profile')
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
    <div className="pb-10 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">بوابة التبرعات</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-3">
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <HandHeart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">ساهم في الخير</h2>
          <p className="text-muted-foreground text-sm">اجعل لطلبك أثراً في حياة الآخرين</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm px-1">اختر جهة التبرع</h3>
          <div className="grid gap-3">
            {CHARITIES.map((charity) => (
              <button
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={`w-full p-5 flex items-center gap-4 bg-white rounded-3xl border transition-all active:scale-[0.98] ${selectedCharity === charity.id ? 'border-primary ring-2 ring-primary/10 shadow-lg' : 'border-transparent shadow-sm'}`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${charity.color}`}>
                  {charity.icon}
                </div>
                <div className="text-right">
                  <p className="font-bold">{charity.name}</p>
                  <p className="text-[10px] text-muted-foreground">{charity.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm px-1">مبلغ التبرع</h3>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="أدخل المبلغ بالريال..." 
              className="h-16 rounded-2xl border-none shadow-sm text-lg font-bold pr-12 text-right"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">ر.س</span>
          </div>
          <div className="flex gap-2">
            {[5, 10, 20, 50].map((val) => (
              <Button 
                key={val} 
                variant="outline" 
                className={`flex-1 h-12 rounded-xl font-bold ${amount === val.toString() ? 'bg-primary text-white border-primary' : ''}`}
                onClick={() => setAmount(val.toString())}
              >
                {val} ر.س
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleDonate}
          disabled={loading || !selectedCharity || !amount}
          className="w-full h-16 rounded-3xl bg-primary text-lg font-black shadow-xl shadow-primary/30"
        >
          {loading ? "جاري المعالجة..." : "تأكيد التبرع الآن"}
        </Button>
      </div>
    </div>
  )
}
