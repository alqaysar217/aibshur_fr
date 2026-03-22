
"use client"

import { useState, useEffect } from "react"
import { 
  ArrowRight, Heart, Gift, Users, HandHeart, CheckCircle2, 
  Loader2, Sparkles, Wallet, Landmark, Copy, MessageCircle, Info, ShieldCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"

const CHARITIES = [
  { id: "water", name: "سقيا ماء", desc: "حفر آبار وتوفير مياه نظيفة", icon: <Users className="h-6 w-6 text-blue-600" />, color: "bg-blue-50" },
  { id: "food", name: "إطعام مسكين", desc: "وجبات ساخنة للأسر المتعففة", icon: <HandHeart className="h-6 w-6 text-rose-600" />, color: "bg-rose-50" },
  { id: "orphan", name: "كفالة يتيم", desc: "رعاية شاملة وتعليم للأيتام", icon: <Gift className="h-6 w-6 text-amber-600" />, color: "bg-amber-50" }
]

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
]

export default function DonationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "bank">("wallet")
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const walletRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "wallet", "wallet")
  }, [db, user])
  const { data: wallet } = useDoc(walletRef)

  const handleDonate = async () => {
    if (!user || !db) {
      router.push('/login')
      return
    }

    if (!selectedCharity || !amount || Number(amount) <= 0) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار القسم وتحديد المبلغ", variant: "destructive" })
      return
    }

    if (paymentMethod === "wallet") {
      const val = Number(amount)
      if ((wallet?.balance || 0) < val) {
        toast({ title: "رصيد غير كافٍ", description: "رصيد محفظتك لا يغطي هذا التبرع", variant: "destructive" })
        return
      }
      setLoading(true)
      try {
        await updateDoc(walletRef!, { balance: increment(-val) })
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: val, type: "debit", description: `تبرع لـ ${CHARITIES.find(c=>c.id===selectedCharity)?.name}`, createdAt: serverTimestamp()
        })
        toast({ title: "بارك الله فيك", description: "تم قبول تبرعك بنجاح" })
        router.push('/profile')
      } catch (e) { console.error(e) } finally { setLoading(false) }
    } else {
      setIsBankDialogOpen(true)
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">بوابة الخير</h1>
      </header>

      <div className="p-5 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-24 w-24 bg-rose-50 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white rotate-3 relative overflow-hidden">
            <Heart className="h-12 w-12 text-rose-500 fill-rose-500 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">اجعل لطلبك أثراً</h2>
          <p className="text-gray-500 text-xs font-bold max-w-[280px] mx-auto leading-relaxed">
            "صنائع المعروف تقي مصارع السوء" - ساهم بما تجود به نفسك لإسعاد الآخرين
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-amber-500" /> اختر وجهة تبرعك
          </h3>
          <div className="space-y-3">
            {CHARITIES.map((charity) => (
              <button
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={cn(
                  "w-full p-4 flex items-center gap-4 bg-white rounded-[20px] border-2 transition-all active:scale-[0.98] shadow-sm relative overflow-hidden group",
                  selectedCharity === charity.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-50 hover:border-primary/20'
                )}
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform", charity.color)}>
                  {charity.icon}
                </div>
                <div className="text-right flex-1">
                  <p className="font-black text-base text-gray-800">{charity.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{charity.desc}</p>
                </div>
                {selectedCharity === charity.id && (
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 bg-white p-6 rounded-[25px] shadow-xl shadow-gray-200/50 border border-gray-50">
          <h3 className="font-black text-sm text-gray-800">مبلغ المساهمة</h3>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="0.00" 
              className="h-16 rounded-[15px] border-none bg-secondary/10 text-2xl font-black pr-6 text-right focus-visible:ring-primary/20 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary text-sm tracking-widest">ر.س</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {[10, 20, 50, 100].map((val) => (
              <Button 
                key={val} 
                variant="outline" 
                className={cn(
                  "h-12 rounded-xl font-black text-xs transition-all border-none shadow-sm",
                  amount === val.toString() ? 'bg-primary text-white scale-105 shadow-primary/20' : 'bg-secondary/20 hover:bg-secondary/30'
                )}
                onClick={() => setAmount(val.toString())}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-sm text-gray-800">طريقة الدفع</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={cn(
                "p-5 rounded-[20px] border-2 flex flex-col items-center gap-3 transition-all",
                paymentMethod === "wallet" ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-white text-gray-400 border-gray-50 shadow-sm"
              )}
            >
              <Wallet className="h-7 w-7" />
              <div className="text-center">
                <p className="text-xs font-black">رصيد المحفظة</p>
                <p className="text-[9px] font-bold opacity-70">المتاح: {wallet?.balance || 0} ر.س</p>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod("bank")}
              className={cn(
                "p-5 rounded-[20px] border-2 flex flex-col items-center gap-3 transition-all",
                paymentMethod === "bank" ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-white text-gray-400 border-gray-50 shadow-sm"
              )}
            >
              <Landmark className="h-7 w-7" />
              <div className="text-center">
                <p className="text-xs font-black">حوالة بنكية</p>
                <p className="text-[9px] font-bold opacity-70">إيداع مباشر</p>
              </div>
            </button>
          </div>
        </div>

        <Button 
          onClick={handleDonate}
          disabled={loading || !selectedCharity || !amount}
          className="w-full h-16 rounded-[20px] bg-primary text-white text-xl font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-b-4 border-black/10"
        >
          {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : "تأكيد المساهمة"}
        </Button>
      </div>

      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="rounded-[30px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <div className="bg-primary p-8 text-white text-center space-y-2">
            <HandHeart className="h-12 w-12 mx-auto animate-pulse" />
            <DialogTitle className="text-2xl font-black">إيداع التبرع</DialogTitle>
            <DialogDescription className="text-white/80 text-xs font-bold leading-relaxed">
              تقبل الله طاعاتكم، يرجى التحويل لأحد الحسابات التالية
            </DialogDescription>
          </div>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white text-right">
            {BANK_ACCOUNTS.map((bank) => (
              <div key={bank.id} className="p-4 rounded-[20px] bg-secondary/10 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary">{bank.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-dashed border-primary/30">
                  <span className="font-black text-sm tracking-wider text-primary tabular-nums">{bank.account}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(bank.account);
                    toast({ title: "تم النسخ" });
                  }} className="h-9 w-9 p-0 text-primary">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-[20px] text-[10px] font-bold border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p>بمجرد إرسال السند، سيتم توثيق التبرع باسمك في سجلاتنا فوراً.</p>
              </div>
              <Button 
                onClick={() => {
                  const text = `مرحباً أبشر، أريد تأكيد تبرعي لـ ${CHARITIES.find(c=>c.id===selectedCharity)?.name} بمبلغ ${amount} ريال. سأرفق السند الآن.`;
                  window.open(`https://wa.me/967700000000?text=${encodeURIComponent(text)}`, "_blank");
                }} 
                className="w-full h-16 rounded-[20px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3 shadow-xl"
              >
                <MessageCircle className="h-7 w-7" /> إرسال السند (واتساب)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
