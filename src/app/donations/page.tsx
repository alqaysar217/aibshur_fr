"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Heart, Users, HandHeart, Gift, CheckCircle2, Wallet, Landmark, Copy, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"

const CHARITIES = [
  { id: "water", name: "سقيا ماء", desc: "توفير مياه نقية للمناطق المحتاجة", icon: <Users className="h-6 w-6 text-blue-600" />, color: "bg-blue-50" },
  { id: "food", name: "إطعام مسكين", desc: "وجبات ساخنة للأسر المتعففة", icon: <HandHeart className="h-6 w-6 text-rose-600" />, color: "bg-rose-50" },
  { id: "orphan", name: "كفالة يتيم", desc: "رعاية كاملة وتعليم للأطفال", icon: <Gift className="h-6 w-6 text-amber-600" />, color: "bg-amber-50" }
]

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" }
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

  const walletRef = useMemoFirebase(() => (!db || !user) ? null : doc(db, "users", user.uid, "wallet", "wallet"), [db, user])
  const { data: wallet } = useDoc(walletRef)

  const handleDonate = async () => {
    if (!user) { router.push('/login'); return; }
    if (!selectedCharity || !amount || Number(amount) <= 0) {
      toast({ title: "بيانات ناقصة", description: "يرجى تحديد الجهة والمبلغ", variant: "destructive" });
      return;
    }

    if (paymentMethod === "wallet") {
      const val = Number(amount)
      if ((wallet?.balance || 0) < val) {
        toast({ title: "رصيد غير كافٍ", variant: "destructive" });
        return;
      }
      setLoading(true)
      try {
        await updateDoc(walletRef!, { balance: increment(-val) })
        await addDoc(collection(db, "users", user.uid, "transactions"), { amount: val, type: "debit", description: `تبرع لـ ${CHARITIES.find(c=>c.id===selectedCharity)?.name}`, createdAt: serverTimestamp() })
        toast({ title: "بارك الله فيك", description: "تم استلام تبرعك بنجاح" })
        router.push('/profile')
      } catch (e) { console.error(e) } finally { setLoading(false) }
    } else {
      setIsBankDialogOpen(true)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-body" dir="rtl">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="text-lg font-black text-gray-900">بوابة الخير</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2 pt-4">
          <Heart className="h-12 w-12 text-rose-500 mx-auto mb-2 fill-rose-500 animate-pulse" />
          <h2 className="text-2xl font-black text-gray-900">اجعل لطلبك أثراً</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">"صنائع المعروف تقي مصارع السوء" - ساهم بما تجود به نفسك</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">اختر وجهة تبرعك</h3>
          <div className="space-y-3">
            {CHARITIES.map((c) => (
              <button key={c.id} onClick={() => setSelectedCharity(c.id)} className={cn("w-full p-4 bg-white rounded-[15px] border-2 flex items-center gap-4 transition-all active:scale-[0.98]", selectedCharity === c.id ? "border-primary bg-primary/5 shadow-lg" : "border-transparent shadow-sm")}>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", c.color)}>{c.icon}</div>
                <div className="text-right flex-1">
                  <p className="text-sm font-black text-gray-900">{c.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{c.desc}</p>
                </div>
                {selectedCharity === c.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-[20px] shadow-xl border border-gray-50 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">مبلغ المساهمة</label>
            <div className="relative">
              <Input type="number" placeholder="0.00" className="h-16 rounded-[12px] bg-gray-50 border-none text-2xl font-black text-center focus-visible:ring-primary/20" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-300">ريال</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[10, 20, 50, 100].map(v => (
              <Button key={v} variant="outline" className={cn("h-12 rounded-[10px] font-black text-xs", amount === v.toString() ? "bg-primary text-white border-primary" : "bg-gray-50 border-transparent hover:bg-gray-100")} onClick={() => setAmount(v.toString())}>{v}</Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">طريقة الدفع</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setPaymentMethod("wallet")} className={cn("p-5 rounded-[20px] border-2 flex flex-col items-center gap-3 transition-all", paymentMethod === "wallet" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-400 border-transparent shadow-sm")}>
              <Wallet className="h-6 w-6" />
              <div className="text-center"><p className="text-[11px] font-black leading-none">رصيد المحفظة</p><p className="text-[8px] font-bold opacity-70 mt-1">المتاح: {wallet?.balance || 0} ريال</p></div>
            </button>
            <button onClick={() => setPaymentMethod("bank")} className={cn("p-5 rounded-[20px] border-2 flex flex-col items-center gap-3 transition-all", paymentMethod === "bank" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-400 border-transparent shadow-sm")}>
              <Landmark className="h-6 w-6" />
              <div className="text-center"><p className="text-[11px] font-black leading-none">تحويل بنكي</p><p className="text-[8px] font-bold opacity-70 mt-1">إيداع مباشر</p></div>
            </button>
          </div>
        </div>

        <Button onClick={handleDonate} disabled={loading || !selectedCharity || !amount} className="w-full h-16 rounded-[15px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
          {loading ? "جاري المعالجة..." : "تأكيد المساهمة"}
        </Button>
      </div>

      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="rounded-[20px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden [&>button]:text-white [&>button]:opacity-100 [&>button]:bg-black/20 [&>button]:hover:bg-black/40 [&>button]:rounded-full [&>button]:transition-all" dir="rtl">
          <div className="bg-gray-900 p-8 text-center text-white space-y-2">
            <Landmark className="h-10 w-10 text-primary mx-auto mb-2" />
            <DialogTitle className="text-xl font-black">إيداع التبرع</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs font-medium">حول {amount} ريال لأحد حساباتنا</DialogDescription>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
            {BANK_ACCOUNTS.map((bank) => (
              <div key={bank.id} className="p-4 bg-gray-50 rounded-[15px] border border-gray-100 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0"><Image src={bank.logo} alt={bank.name} fill className="object-cover" /></div>
                  <div className="flex-1"><p className="text-sm font-black text-gray-900">{bank.name}</p><p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p></div>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-dashed border-gray-200">
                  <span className="font-black text-sm tracking-widest text-primary">{bank.account}</span>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(bank.account); toast({ title: "تم النسخ" }); }} className="text-primary"><Copy className="h-4 w-4" /></Button>
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
