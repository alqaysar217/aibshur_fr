
"use client"

import { useState, useEffect } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { 
  ArrowRight, CreditCard, History, Plus, TrendingUp, TrendingDown, 
  Copy, MessageCircle, Landmark, CheckCircle2, Loader2, Wallet, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" },
  { id: "tadhamon", name: "بنك التضامن", holder: "عمر احمد مبارك دعكيك", account: "112233445", logo: "https://picsum.photos/seed/tadhamon/100" }
]

export default function WalletPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const walletRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "wallet", "wallet")
  }, [db, user])

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: wallet, isLoading: isWalletLoading } = useDoc(walletRef)
  const { data: transactions, isLoading } = useCollection(transactionsQuery)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "تم النسخ", description: "رقم الحساب جاهز للصق" })
  }

  const openWhatsApp = () => {
    const text = "مرحباً أبشر، قمت بتحويل مبلغ للمحفظة وسأرفق السند الآن لتفعيل الرصيد."
    window.open(`https://wa.me/967700000000?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">محفظتي الرقمية</h1>
      </header>

      <div className="p-5 space-y-6">
        {/* بطاقة الرصيد الفاخرة */}
        <div className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#1FAF9A] to-[#128C7E] p-8 text-white shadow-2xl shadow-primary/30">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">الرصيد المتاح</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black tabular-nums">{wallet?.balance || 0}</h2>
                  <span className="text-sm font-bold opacity-90">ر.س</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/20 p-3 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Wallet className="h-8 w-8 text-white" />
              </div>
            </div>

            <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 bg-white text-primary font-black text-lg rounded-[15px] hover:bg-white/95 shadow-xl transition-all active:scale-[0.98] gap-2 border-b-4 border-black/10">
                  <Plus className="h-5 w-5" /> شحن الرصيد الآن
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[20px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
                <div className="bg-primary p-6 text-white text-center space-y-2">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Landmark className="h-8 w-8" />
                  </div>
                  <DialogTitle className="text-xl font-black">شحن المحفظة</DialogTitle>
                  <DialogDescription className="text-white/80 text-xs font-bold leading-relaxed">
                    يرجى الإيداع في أحد الحسابات التالية ثم أرسل صورة السند لتفعيل رصيدك فوراً
                  </DialogDescription>
                </div>
                
                <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4 bg-white">
                  {BANK_ACCOUNTS.map((bank) => (
                    <div key={bank.id} className="p-4 rounded-[15px] border border-gray-100 bg-secondary/10 space-y-3 group active:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                          <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-black text-primary">{bank.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-dashed border-primary/30">
                        <span className="font-black text-sm tracking-wider text-primary">{bank.account}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bank.account)} className="h-9 w-9 p-0 text-primary hover:bg-primary/5 rounded-lg">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-[15px] text-[10px] font-bold border border-amber-100">
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                      <p className="leading-relaxed">سيتم تحديث رصيدك تلقائياً فور تأكيد فريق المالية لعملية التحويل (عادة خلال دقائق).</p>
                    </div>
                    <Button onClick={openWhatsApp} className="w-full h-15 rounded-[15px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3 shadow-xl">
                      <MessageCircle className="h-6 w-6" /> إرسال السند عبر واتساب
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* سجل العمليات */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> السجل المالي
            </h3>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-[15px] animate-pulse" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[15px] bg-white overflow-hidden active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl shadow-inner",
                        tx.type === 'credit' || tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'credit' || tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), "PPP p", { locale: ar }) : "الآن"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={cn(
                        "font-black text-lg tabular-nums",
                        tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-600' : 'text-rose-600'
                      )}>
                        {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                      </span>
                      <p className="text-[8px] font-black text-gray-400 uppercase">ر.س</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // بيانات افتراضية احترافية
              [
                { id: "1", type: "deposit", desc: "شحن رصيد - بنك الكريمي", amount: 5000, date: "قبل ساعتين" },
                { id: "2", type: "debit", desc: "دفع طلب #9921 - مطعم مذاقي", amount: 1500, date: "اليوم، 12:30 م" },
                { id: "3", type: "deposit", desc: "استعادة رصيد - طلب ملغي", amount: 1200, date: "أمس" }
              ].map((tx) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[15px] bg-white overflow-hidden opacity-80">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl", tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600')}>
                        {tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.desc}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={cn("font-black text-lg", tx.type === 'deposit' ? 'text-green-600' : 'text-rose-600')}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                      </span>
                      <p className="text-[8px] font-black text-gray-400">ر.س</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
