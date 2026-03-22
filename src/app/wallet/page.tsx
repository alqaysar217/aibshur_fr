"use client"

import { useState, useEffect } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { 
  ArrowRight, History, Plus, TrendingUp, TrendingDown, 
  Copy, MessageCircle, Landmark, Wallet, ShieldCheck, CreditCard
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
  { id: "busairi", name: "شركة البسيري", holder: "عمر احمد مبارك دعكيك", account: "554433221", logo: "https://picsum.photos/seed/busairi/100" }
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
    return query(collection(db, "users", user.uid, "transactions"), orderBy("createdAt", "desc"), limit(10))
  }, [db, user])

  const { data: wallet } = useDoc(walletRef)
  const { data: transactions, isLoading } = useCollection(transactionsQuery)

  if (!mounted) return null

  const mockTransactions = [
    { id: "1", type: "deposit", desc: "شحن رصيد - بنك الكريمي", amount: 5000, date: new Date() },
    { id: "2", type: "debit", desc: "دفع طلب #9921", amount: 1500, date: new Date() },
    { id: "3", type: "deposit", desc: "مكافأة دعوة صديق", amount: 500, date: new Date() }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-body" dir="rtl">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 hover:bg-gray-100">
          <ArrowRight className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="text-lg font-black text-gray-900">محفظتي</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Modern Balance Card */}
        <div className="relative overflow-hidden rounded-[20px] bg-gray-900 p-8 text-white shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10 flex flex-col space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الرصيد المتاح</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black tabular-nums">{wallet?.balance || 0}</h2>
                  <span className="text-sm font-bold opacity-60">ريال</span>
                </div>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>

            <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 bg-primary text-white font-black text-lg rounded-[12px] hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  <Plus className="ml-2 h-5 w-5" /> شحن الرصيد
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[20px] w-[92%] max-w-md mx-auto p-0 border-none overflow-hidden [&>button]:text-white [&>button]:opacity-100 [&>button]:bg-black/20 [&>button]:hover:bg-black/40 [&>button]:rounded-full [&>button]:transition-all" dir="rtl">
                <div className="bg-gray-900 p-8 text-white text-center space-y-2">
                  <Landmark className="h-10 w-10 text-primary mx-auto mb-2" />
                  <DialogTitle className="text-xl font-black">إيداع مالي</DialogTitle>
                  <DialogDescription className="text-gray-400 text-xs font-medium leading-relaxed">
                    يرجى التحويل لأحد الحسابات التالية وإرسال السند عبر واتساب للتفعيل الفوري
                  </DialogDescription>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-white">
                  {BANK_ACCOUNTS.map((bank) => (
                    <div key={bank.id} className="p-4 rounded-[15px] bg-gray-50 border border-gray-100 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                          <Image src={bank.logo} alt={bank.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-900">{bank.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{bank.holder}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-dashed border-gray-200">
                        <span className="font-black text-sm tracking-widest text-primary">{bank.account}</span>
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(bank.account); toast({ title: "تم النسخ" }); }} className="h-8 w-8 p-0 text-primary">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 space-y-4">
                    <Button onClick={() => window.open("https://wa.me/967700000000")} className="w-full h-14 rounded-[12px] bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-lg gap-2 shadow-xl">
                      <MessageCircle className="h-6 w-6" /> إرسال السند (واتساب)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> السجل الأخير
            </h3>
          </div>
          
          <div className="space-y-3">
            {(transactions || mockTransactions).map((tx: any) => (
              <div key={tx.id} className="p-4 bg-white rounded-[15px] border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  )}>
                    {tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{tx.desc || tx.description}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{format(tx.createdAt?.toDate?.() || tx.date, "PPP", { locale: ar })}</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className={cn(
                    "text-base font-black tabular-nums",
                    tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                  </span>
                  <p className="text-[8px] font-black text-gray-300">ريال</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
