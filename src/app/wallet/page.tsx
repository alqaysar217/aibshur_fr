
"use client"

import { useState, useEffect } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { 
  ArrowRight, CreditCard, History, Plus, TrendingUp, TrendingDown, 
  Copy, MessageCircle, Landmark, ExternalLink, CheckCircle2, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { cn } from "@/lib/utils"

const BANK_ACCOUNTS = [
  { id: "kuraimi", name: "بنك الكريمي", holder: "عمر احمد مبارك دعكيك", account: "123456789", logo: "https://picsum.photos/seed/kuraimi/100" },
  { id: "omqi", name: "شركة العمقي", holder: "عمر احمد مبارك دعكيك", account: "998877665", logo: "https://picsum.photos/seed/omqi/100" },
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" },
  { id: "tadhamon", name: "بنك التضامن", holder: "عمر احمد مبارك دعكيك", account: "112233445", logo: "https://picsum.photos/seed/tadhamon/100" }
]

const MOCK_TRANSACTIONS = [
  { id: "m1", description: "شحن رصيد - بنك الكريمي", amount: 5000, type: "deposit", date: "منذ ساعتين" },
  { id: "m2", description: "دفع طلب #8821 - مطعم مذاقي", amount: 1500, type: "debit", date: "اليوم، 12:30 م" },
  { id: "m3", description: "استعادة رصيد - طلب ملغي", amount: 1200, type: "deposit", date: "أمس، 09:15 م" },
  { id: "m4", description: "دفع طلب #7732 - سوبر ماركت الخليج", amount: 2300, type: "debit", date: "أمس، 02:45 م" }
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
    toast({ title: "تم النسخ", description: "تم نسخ رقم الحساب إلى الحافظة" })
  }

  const openWhatsApp = () => {
    window.open("https://wa.me/967700000000", "_blank")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">محفظتي</h1>
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* بطاقة الرصيد الاحترافية */}
        <Card className="border-none bg-gradient-to-br from-primary via-primary/90 to-emerald-600 text-white rounded-[10px] shadow-2xl shadow-primary/20 overflow-hidden relative h-52">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
          
          <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">الرصيد المتاح</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black tabular-nums">{wallet?.balance || 0}</h2>
                  <span className="text-sm font-bold opacity-90">ر.س</span>
                </div>
              </div>
              <div className="bg-white/20 p-3.5 rounded-[10px] backdrop-blur-md border border-white/20">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
            </div>

            <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 bg-white text-primary font-black text-lg rounded-[10px] hover:bg-white/90 shadow-lg active:scale-[0.98] transition-all gap-2">
                  <Plus className="h-5 w-5" /> شحن الرصيد الآن
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[10px] w-[95%] max-w-md mx-auto p-0 border-none overflow-hidden" dir="rtl">
                <DialogHeader className="p-5 bg-primary text-white text-right">
                  <DialogTitle className="text-xl font-black">شحن المحفظة</DialogTitle>
                  <DialogDescription className="text-white/80 text-xs font-bold">
                    يرجى الإيداع في أحد الحسابات التالية ثم إرسال السند
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
                  {BANK_ACCOUNTS.map((bank) => (
                    <div key={bank.id} className="p-4 rounded-[10px] border border-gray-100 bg-secondary/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-[10px] overflow-hidden border shadow-sm shrink-0 bg-white">
                          <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs font-black text-primary">{bank.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{bank.holder}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-md border border-dashed border-primary/20">
                        <span className="font-black text-sm tracking-wider text-primary">{bank.account}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bank.account)} className="h-8 w-8 p-0 text-primary">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      سيتم شحن رصيدك تلقائياً فور تأكيد عملية التحويل من قبل فريقنا.
                    </div>
                    <Button onClick={openWhatsApp} className="w-full h-14 rounded-[10px] bg-green-600 hover:bg-green-700 text-white font-black text-lg gap-3">
                      <MessageCircle className="h-6 w-6" /> إرسال السند عبر واتساب
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* سجل العمليات */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-primary flex items-center gap-2">
              <History className="h-5 w-5" /> سجل العمليات الأخيرة
            </h3>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-[10px] animate-pulse" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[10px] bg-white overflow-hidden active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-[10px]",
                        tx.type === 'credit' || tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'credit' || tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), "PPP p", { locale: ar }) : "اليوم"}
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
                      <p className="text-[8px] font-bold text-gray-400 uppercase">ر.س</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // إظهار عمليات افتراضية في حالة عدم وجود عمليات حقيقية
              MOCK_TRANSACTIONS.map((tx) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-[10px] bg-white overflow-hidden active:scale-[0.98] transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-[10px]",
                        tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={cn(
                        "font-black text-lg tabular-nums",
                        tx.type === 'deposit' ? 'text-green-600' : 'text-rose-600'
                      )}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                      </span>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">ر.س</p>
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
