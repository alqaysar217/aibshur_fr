
"use client"

import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { ArrowRight, CreditCard, History, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function WalletPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()

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

  const { data: wallet } = useDoc(walletRef)
  const { data: transactions, isLoading } = useCollection(transactionsQuery)

  return (
    <div className="min-h-screen bg-secondary/5 pb-10">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">محفظتي</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* بطاقة الرصيد */}
        <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-white rounded-[2.5rem] shadow-2xl shadow-primary/30 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/70 text-xs font-bold mb-1">الرصيد المتاح</p>
                <h2 className="text-4xl font-black">{wallet?.balance || 0} <span className="text-sm">ر.س</span></h2>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <Button className="w-full h-12 bg-white text-primary font-bold rounded-xl hover:bg-white/90">
              <Plus className="h-4 w-4 ml-2" /> شحن الرصيد
            </Button>
          </CardContent>
        </Card>

        {/* سجل العمليات */}
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2 px-2">
            <History className="h-4 w-4 text-primary" /> سجل العمليات الأخيرة
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-2xl bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${tx.type === 'credit' || tx.type === 'deposit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'credit' || tx.type === 'deposit' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), "PPP p", { locale: ar }) : "تاريخ غير متاح"}
                        </p>
                      </div>
                    </div>
                    <span className={`font-black ${tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <History className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">لا توجد عمليات سابقة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
