
"use client"

import { useState, useEffect } from "react"
import { 
  ArrowRight, Heart, Gift, Users, HandHeart, CheckCircle2, 
  Loader2, Sparkles, Wallet, Landmark, Copy, MessageCircle, Info 
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

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" },
  { id: "tadhamon", name: "بنك التضامن", holder: "عمر احمد مبارك دعكيك", account: "112233445", logo: "https://picsum.photos/seed/tadhamon/100" }
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
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار الجمعية وتحديد مبلغ صحيح", variant: "destructive" })
      return
    }

    const donationAmount = Number(amount)
    const charity = CHARITIES.find(c => c.id === selectedCharity)

    if (paymentMethod === "wallet") {
      if (!wallet || (wallet.balance || 0) < donationAmount) {
        toast({ 
          title: "رصيد غير كافٍ", 
          description: "رصيدك في المحفظة لا يغطي مبلغ التبرع، يرجى الشحن أو اختيار الحوالة البنكية", 
          variant: "destructive" 
        })
        return
      }

      setLoading(true)
      try {
        // الخصم من المحفظة
        await updateDoc(walletRef!, { balance: increment(-donationAmount) })
        
        // تسجيل عملية المحفظة
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          amount: donationAmount,
          type: "debit",
          description: `تبرع لـ ${charity?.name}`,
          createdAt: serverTimestamp()
        })

        // تسجيل التبرع
        await addDoc(collection(db, "users", user.uid, "donations"), {
          userId: user.uid,
          amount: donationAmount,
          charityName: charity?.name,
          paymentMethod: "wallet",
          status: "completed",
          createdAt: serverTimestamp()
        })

        toast({ title: "بارك الله فيك", description: "تم خصم التبرع من محفظتك بنجاح" })
        router.push('/profile')
      } catch (e) {
        console.error(e)
        toast({ title: "خطأ", description: "حدث خطأ أثناء معالجة التبرع", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    } else {
      // إظهار نافذة الحسابات البنكية
      setIsBankDialogOpen(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "تم النسخ", description: "رقم الحساب جاهز للصق" })
  }

  const openWhatsApp = () => {
    const text = `مرحباً أبشر، أريد تأكيد تبرعي لـ ${CHARITIES.find(c => c.id === selectedCharity)?.name} بمبلغ ${amount} ريال. سأرفق سند التحويل الآن.`
    window.open(`https://wa.me/967700000000?text=${encodeURIComponent(text)}`, "_blank")
    setIsBankDialogOpen(false)
    router.push('/profile')
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

      <div className="p-5 space-y-6">
        <div className="text-center space-y-3 pt-4">
          <div className="bg-primary/10 w-24 h-24 rounded-[30px] flex items-center justify-center mx-auto mb-4 shadow-inner border-4 border-white relative overflow-hidden">
            <HandHeart className="h-12 w-12 text-primary z-10" />
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-primary">ساهم في الخير</h2>
          <p className="text-muted-foreground text-[11px] font-bold max-w-[280px] mx-auto leading-relaxed">
            اجعل لطلبك أثراً طيباً، فـ "صنائع المعروف تقي مصارع السوء"
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-xs text-primary flex items-center gap-2 px-1">
            <Sparkles className="h-3 w-3" /> اختر جهة التبرع
          </h3>
          <div className="grid gap-3">
            {CHARITIES.map((charity) => (
              <button
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={cn(
                  "w-full p-3 flex items-center gap-4 bg-white rounded-[10px] border transition-all active:scale-[0.98] shadow-sm relative overflow-hidden",
                  selectedCharity === charity.id ? 'border-primary ring-4 ring-primary/5 bg-primary/5' : 'border-gray-50'
                )}
              >
                <div className={cn("h-12 w-12 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm", charity.color)}>
                  {charity.icon}
                </div>
                <div className="text-right flex-1">
                  <p className="font-black text-[14px] text-gray-800">{charity.name}</p>
                  <p className="text-[9px] text-gray-400 font-bold leading-relaxed">{charity.description}</p>
                </div>
                {selectedCharity === charity.id && (
                  <div className="absolute top-1 left-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-xs text-primary px-1">مبلغ التبرع</h3>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="المبلغ..." 
              className="h-14 rounded-[10px] border-none shadow-sm text-lg font-black pr-14 text-right bg-white focus-visible:ring-primary/20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-sm">ر.س</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 50].map((val) => (
              <Button 
                key={val} 
                variant="outline" 
                className={cn(
                  "h-10 rounded-[10px] font-black text-[11px] transition-all shadow-sm border-gray-100",
                  amount === val.toString() ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white hover:bg-primary/5'
                )}
                onClick={() => setAmount(val.toString())}
              >
                {val} ر.س
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-xs text-primary px-1">طريقة الدفع</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={cn(
                "p-4 rounded-[10px] border flex flex-col items-center gap-2 transition-all",
                paymentMethod === "wallet" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-400 border-gray-100 shadow-sm"
              )}
            >
              <Wallet className="h-6 w-6" />
              <span className="text-[11px] font-black">المحفظة</span>
              <span className="text-[8px] opacity-70">رصيدك: {wallet?.balance || 0} ر.س</span>
            </button>
            <button
              onClick={() => setPaymentMethod("bank")}
              className={cn(
                "p-4 rounded-[10px] border flex flex-col items-center gap-2 transition-all",
                paymentMethod === "bank" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-400 border-gray-100 shadow-sm"
              )}
            >
              <Landmark className="h-6 w-6" />
              <span className="text-[11px] font-black">حوالة بنكية</span>
              <span className="text-[8px] opacity-70">إيداع يدوي</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleDonate}
            disabled={loading || !selectedCharity || !amount}
            className="w-full h-16 rounded-[10px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>جاري المعالجة...</span>
              </div>
            ) : (
              paymentMethod === "wallet" ? "تبرع من المحفظة الآن" : "تأكيد التبرع بالحوالة"
            )}
          </Button>
        </div>
      </div>

      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="rounded-[10px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
          <DialogHeader className="p-6 bg-primary text-white text-right">
            <DialogTitle className="text-xl font-black">تأكيد التبرع البنكي</DialogTitle>
            <DialogDescription className="text-white/80 text-[11px] font-bold mt-2">
              يرجى الإيداع في أحد الحسابات التالية لإتمام عملية التبرع
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 bg-white">
            <div className="space-y-4">
              {BANK_ACCOUNTS.map((bank) => (
                <div key={bank.id} className="p-4 rounded-[10px] border border-gray-100 bg-secondary/5 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-[10px] overflow-hidden border shadow-sm shrink-0 bg-white">
                      <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs font-black text-primary">{bank.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{bank.holder}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-[10px] border border-dashed border-primary/30">
                    <span className="font-black text-sm tracking-wider text-primary">{bank.account}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bank.account)} className="h-9 w-9 p-0 text-primary">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-[10px] text-[10px] font-bold border border-amber-100 flex items-center gap-3">
                <Info className="h-5 w-5 shrink-0" />
                بمجرد إرسال السند، سيتم تسجيل التبرع باسمك في سجلاتنا فوراً.
              </div>
              <Button 
                onClick={openWhatsApp} 
                className="w-full h-15 rounded-[10px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3 shadow-xl"
              >
                <MessageCircle className="h-6 w-6" /> إرسال السند عبر واتساب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
