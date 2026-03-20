
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ArrowRight, ShoppingBag, Loader2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, collectionGroup, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [mounted, setMounted] = useState(false)
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // جلب البيانات الأولية للبحث (محدودة لضمان السرعة)
  const storesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "stores"), limit(50))
  }, [db])

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collectionGroup(db, "products"), limit(100))
  }, [db])
  
  const { data: stores, isLoading: loadingStores } = useCollection(storesQuery)
  const { data: products, isLoading: loadingProducts } = useCollection(productsQuery)

  const filteredResults = useMemo(() => {
    if (!mounted) return []
    const searchVal = queryText.trim().toLowerCase()
    
    const allStores = (stores || []).map(s => ({ ...s, type: 'store' }))
    const allProducts = (products || []).map(p => ({ ...p, type: 'product' }))
    const combined = [...allStores, ...allProducts]

    if (!searchVal) return combined.slice(0, 10) // عرض نتائج مقترحة عند فراغ البحث

    return combined.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchVal)
      const descMatch = item.description?.toLowerCase().includes(searchVal)
      const addressMatch = item.address?.toLowerCase().includes(searchVal)
      
      return nameMatch || descMatch || addressMatch
    })
  }, [queryText, stores, products, mounted])

  const isLoading = loadingStores || loadingProducts

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="pb-24 min-h-screen bg-secondary/5 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black text-primary">البحث في أبشر</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* حقل البحث التقليدي */}
        <div className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن مطعم، وجبة، أو متجر..." 
            className="pr-12 h-16 rounded-3xl border-none shadow-2xl bg-white text-lg focus-visible:ring-primary text-right"
          />
        </div>

        {/* نتائج البحث */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-muted-foreground">النتائج ({filteredResults.length})</h2>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white rounded-3xl animate-pulse" />)
          ) : filteredResults.length > 0 ? (
            filteredResults.map((item: any) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="border-none shadow-sm rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all bg-white group"
                onClick={() => router.push(item.type === 'store' ? `/store/${item.id}` : `/store/${item.storeId}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 shadow-inner">
                    <Image 
                      src={item.logoUrl || item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} 
                      alt={item.name} 
                      fill 
                      className="object-cover rounded-2xl group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <Badge 
                        variant={item.type === 'store' ? "default" : "secondary"} 
                        className={cn(
                          "text-[8px] h-4 px-2 border-none font-black",
                          item.type === 'store' ? "bg-primary text-white" : "bg-accent/20 text-accent-foreground"
                        )}
                      >
                        {item.type === 'store' ? 'متجر' : 'وجبة'}
                      </Badge>
                      <h3 className="font-black text-sm">{item.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {item.type === 'store' ? (item.address || "عنوان غير متوفر") : (item.description || "لا يوجد وصف")}
                    </p>
                    {item.type === 'product' && (
                      <p className="text-primary font-black text-xs mt-1.5">{item.price} ر.س</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-32 flex flex-col items-center opacity-30">
              <div className="bg-secondary/50 p-8 rounded-full mb-4">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <p className="text-sm font-bold">عذراً، لم نجد ما تبحث عنه</p>
              <p className="text-[10px]">تأكد من كتابة الكلمات بشكل صحيح</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
