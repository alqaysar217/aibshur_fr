"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Gift, History, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function LoyaltyPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const loyaltyTransactionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "loyaltyPointTransactions"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: transactions, isLoading } = useCollection(loyaltyTransactionsQuery)

  if (!mounted) return null

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">نقاط الولاء</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* ملخص النقاط */}
        <Card className="border-none bg-gradient-to-br from-accent to-orange-500 text-accent-foreground rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CardContent className="p-8 text-center space-y-4">
            <div className="bg-white/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">رصيدك الحالي</p>
              <h2 className="text-5xl font-black">{userData?.loyaltyPoints || 0}</h2>
              <p className="text-xs font-bold mt-1">نقطة أبشر</p>
            </div>
            <Button className="w-full bg-white text-accent hover:bg-white/90 rounded-2xl font-black">
              استبدال النقاط بمكافآت
            </Button>
          </CardContent>
        </Card>

        {/* سجل العمليات */}
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2 px-2">
            <History className="h-4 w-4 text-accent" /> سجل النقاط
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id} className="border-none shadow-sm rounded-2xl bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${tx.type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'earned' ? <TrendingUp className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), "PPP", { locale: ar }) : "تاريخ غير متاح"}
                        </p>
                      </div>
                    </div>
                    <span className={`font-black text-lg ${tx.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <Gift className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">لم تكتسب أي نقاط بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
